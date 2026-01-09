import { Injectable } from '@angular/core';
import { UserStats } from '../repositories/bible.repository';
import Libros from '../../../assets/libros.json';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: Map<string, number | boolean>) => boolean;
  unlocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {

  private badges: Badge[] = [
    {
      id: 'first_read',
      name: 'Primer Paso',
      description: 'Completa tu primer día de lectura.',
      icon: 'footsteps',
      color: 'success',
      condition: (stats) => (Number(stats.get('days_read') || 0)) >= 1,
      unlocked: false
    },
    {
      id: 'streak_3',
      name: 'Constancia',
      description: 'Lee la Biblia 3 días seguidos.',
      icon: 'flame',
      color: 'warning',
      condition: (stats) => (Number(stats.get('current_streak') || 0)) >= 3,
      unlocked: false
    },
    {
      id: 'streak_7',
      name: 'Hábito de Hierro',
      description: 'Lee la Biblia 7 días seguidos.',
      icon: 'barbell',
      color: 'danger',
      condition: (stats) => (Number(stats.get('current_streak') || 0)) >= 7,
      unlocked: false
    },
    {
      id: 'verses_100',
      name: 'Estudioso',
      description: 'Marca 100 versículos.',
      icon: 'bookmarks',
      color: 'primary',
      condition: (stats) => (Number(stats.get('verses_marked') || 0)) >= 100,
      unlocked: false
    },
    {
      id: 'writer_10',
      name: 'Escritor',
      description: 'Crea 10 notas personales.',
      icon: 'document-text',
      color: 'tertiary',
      condition: (stats) => (Number(stats.get('notes_count') || 0)) >= 10,
      unlocked: false
    },
    {
      id: 'early_bird',
      name: 'Madrugador',
      description: 'Lee antes de las 7:00 AM.',
      icon: 'sunny',
      color: 'warning',
      condition: (stats) => Boolean(stats.get('early_bird')),
      unlocked: false
    },
    {
      id: 'night_owl',
      name: 'Nocturno',
      description: 'Lee después de las 10:00 PM.',
      icon: 'moon',
      color: 'dark',
      condition: (stats) => Boolean(stats.get('night_owl')),
      unlocked: false
    },
    // CATEGORIES
    {
      id: 'cat_tora',
      name: 'Torá',
      description: 'Completa el Pentateuco.',
      icon: 'newspaper',
      color: 'gold',
      condition: (stats) => Boolean(stats.get('cat_tora')),
      unlocked: false
    },
    {
      id: 'cat_profetas',
      name: 'Profetas',
      description: 'Completa los libros Proféticos (Josué a Ezequiel).',
      icon: 'eye',
      color: 'secondary',
      condition: (stats) => Boolean(stats.get('cat_profetas')),
      unlocked: false
    },
    {
      id: 'cat_menores',
      name: 'Profetas Menores',
      description: 'Completa los 12 Profetas Menores.',
      icon: 'mic',
      color: 'medium',
      condition: (stats) => Boolean(stats.get('cat_menores')),
      unlocked: false
    },
    {
      id: 'cat_escritos',
      name: 'Escritos',
      description: 'Completa los libros Poéticos y Sapienciales.',
      icon: 'library',
      color: 'light',
      condition: (stats) => Boolean(stats.get('cat_escritos')),
      unlocked: false
    },
    {
      id: 'cat_nt',
      name: 'Segundo Pacto',
      description: 'Completa todo el Nuevo Testamento.',
      icon: 'book',
      color: 'success',
      condition: (stats) => Boolean(stats.get('cat_nt')),
      unlocked: false
    },
    {
      id: 'bible_year',
      name: 'Biblia en un Año',
      description: 'Completa el plan de lectura anual.',
      icon: 'trophy',
      color: 'gold',
      condition: (stats) => (Number(stats.get('plan_completed_bible_year') || 0)) === 1,
      unlocked: false
    }
  ];


  async calculateStatsAsync(bookmarks: any[], notes: any[] = [], activityLogs: any[] = [], chapterViews: any[] = []): Promise<{ streak: number, versesMarked: number, notesCount: number, raw: Map<string, any> }> {
    if (typeof Worker !== 'undefined') {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL('../workers/stats.worker.ts', import.meta.url));

        worker.onmessage = ({ data }) => {
          const rawMap = new Map<string, any>();
          rawMap.set('verses_marked', data.versesMarked);
          rawMap.set('notes_count', data.notesCount);
          rawMap.set('current_streak', data.streak);
          rawMap.set('days_read', activityLogs.length);

          // New Flags
          rawMap.set('early_bird', data.earlyBird);
          rawMap.set('night_owl', data.nightOwl);
          rawMap.set('cat_tora', data.cat_tora);
          rawMap.set('cat_profetas', data.cat_profetas);
          rawMap.set('cat_menores', data.cat_menores);
          rawMap.set('cat_escritos', data.cat_escritos);
          rawMap.set('cat_nt', data.cat_nt);

          resolve({
            streak: data.streak,
            versesMarked: data.versesMarked,
            notesCount: data.notesCount,
            raw: rawMap
          });
          worker.terminate();
        };

        // Pass Libros metadata to worker
        worker.postMessage({ bookmarks, notes, activityLogs, chapterViews, bookMetadata: Libros });
      });
    } else {
      console.warn('Web Workers not supported.');
      return { streak: 0, versesMarked: bookmarks.length, notesCount: notes.length, raw: new Map() };
    }
  }

  getBadges(stats: UserStats[] | Map<string, any>): Badge[] {
    let statsMap: Map<string, any>;

    if (stats instanceof Map) {
      statsMap = stats;
    } else {
      statsMap = new Map<string, any>();
      stats.forEach(s => statsMap.set(s.metric_key, s.value));
    }

    return this.badges.map(badge => ({
      ...badge,
      unlocked: badge.condition(statsMap)
    })).sort((a, b) => {
      // Unlocked first
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return 0; // Maintain original order
    });
  }

  // Helper to calculate progress (0-1) for a specific badge could be added here
}
