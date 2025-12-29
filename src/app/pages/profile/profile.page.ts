import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SyncService } from 'src/app/core/services/sync.service';
import { GamificationService, Badge } from 'src/app/core/services/gamification.service';
import { LocalBibleRepository } from 'src/app/core/repositories/local-bible.repository';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user$: Observable<firebase.User | null>;
  isSyncing$: Observable<boolean>;
  badges: Badge[] = [];

  // Quick stats
  booksRead = 0;
  versesMarked = 0;
  currentStreak = 0;

  constructor(
    private auth: AuthService,
    private sync: SyncService,
    private gamification: GamificationService,
    private localRepo: LocalBibleRepository
  ) { }

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.isSyncing$ = this.sync.isSyncing$;
    this.loadStats();
  }

  ionViewWillEnter() {
    this.loadStats();
  }

  async loadStats() {
    // 1. Get raw stats from Local DB
    // Note: We need to implement a detailed stats aggregator or just use the UserStats table.
    // For Phase 4 demo, let's use the UserStats table data if available, 
    // OR basic queries if we haven't implemented the stat aggregator worker yet.
    // The gamification service expects UserStats[].

    // 1. Calculate Real Stats from Tables
    const bookmarks = await this.localRepo.getBookmarks();
    this.versesMarked = bookmarks.length;

    // TODO: We need a way to get ALL progress regardless of plan ID or iterate known plans.
    // For MVP, we'll check the main 'bible_in_a_year' plan or just 0 if not accessible easily.
    // Ideally, localRepo should have 'getAllReadingProgress()'.
    // Let's stick to 0 or try to fetch a specific plan if known.
    // Actually, let's use the 'UserStats' table for the badges logic, 
    // BUT we need to POPULATE 'UserStats' table first for Gamification to work!
    // Current Issue: Nothing is writing to 'UserStats'. 

    // Quick Fix for Gamification:
    // We will manually construct a stats array based on the table counts to pass to GamificationService.

    // Streak Integration
    const streak = await this.calculateStreak();
    this.currentStreak = streak;

    const computedStats = [
      { id: '1', metric_key: 'verses_marked', value: bookmarks.length, updated_at: Date.now(), is_synced: 0 },
      { id: '2', metric_key: 'current_streak', value: streak, updated_at: Date.now(), is_synced: 0 }
    ] as any[];

    // 2. Get Badges (processed rules)
    this.badges = this.gamification.getBadges(computedStats);
  }

  // Calculate Streak Logic
  async calculateStreak(): Promise<number> {
    const bookmarks = await this.localRepo.getBookmarks();
    const activityDates = new Set<string>();

    bookmarks.forEach(b => {
      const d = new Date(b.created_at || Date.now());
      d.setHours(0, 0, 0, 0);
      activityDates.add(d.toISOString());
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentCheck = new Date(today);

    // Check today or yesterday to keep streak alive
    if (!activityDates.has(currentCheck.toISOString())) {
      currentCheck.setDate(currentCheck.getDate() - 1);
      if (!activityDates.has(currentCheck.toISOString())) {
        return 0;
      }
    }

    while (true) {
      if (activityDates.has(currentCheck.toISOString())) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }



  async logout() {
    await this.auth.logout();
    this.badges = [];
    this.versesMarked = 0;
    this.booksRead = 0;
  }

  async loginGoogle() {
    console.log('Login with Google - Pending Implementation');
  }

  // --- DEBUGGING ---
  showDebug = false;
  debugData: any = {};

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }

  async dumpDebugData() {
    this.debugData = {
      user: await this.auth.getCurrentUser(),
      stats: await this.localRepo.getStats(),
      bookmarks: (await this.localRepo.getBookmarks()).slice(0, 5), // Limit to 5
      unsyncedBookmarks: await this.localRepo.getUnsyncedBookmarks()
    };
    console.log('Debug Data:', this.debugData);
  }
}
