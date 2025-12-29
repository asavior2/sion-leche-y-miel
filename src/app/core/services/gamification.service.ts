import { Injectable } from '@angular/core';
import { UserStats } from '../repositories/bible.repository';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: Map<string, number>) => boolean;
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
      condition: (stats) => (stats.get('days_read') || 0) >= 1,
      unlocked: false
    },
    {
      id: 'streak_3',
      name: 'Constancia',
      description: 'Lee la Biblia 3 días seguidos.',
      icon: 'flame',
      color: 'warning',
      condition: (stats) => (stats.get('current_streak') || 0) >= 3,
      unlocked: false
    },
    {
      id: 'verses_100',
      name: 'Estudioso',
      description: 'Marca 100 versículos.',
      icon: 'bookmarks',
      color: 'primary',
      condition: (stats) => (stats.get('verses_marked') || 0) >= 100,
      unlocked: false
    },
    {
      id: 'bible_year',
      name: 'Biblia en un Año',
      description: 'Completa el plan de lectura anual.',
      icon: 'trophy',
      color: 'gold', // Custom class needed or use 'warning'
      condition: (stats) => (stats.get('plan_completed_bible_year') || 0) === 1,
      unlocked: false
    }
  ];

  constructor() { }

  getBadges(stats: UserStats[]): Badge[] {
    // 1. Convert stats array to Map for easier lookup
    const statsMap = new Map<string, number>();
    stats.forEach(s => statsMap.set(s.metric_key, s.value));

    // 2. Evaluate each badge
    return this.badges.map(badge => ({
      ...badge,
      unlocked: badge.condition(statsMap)
    }));
  }

  // Helper to calculate progress (0-1) for a specific badge could be added here
}
