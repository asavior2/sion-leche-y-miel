import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
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
    private localRepo: LocalBibleRepository,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
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

    // 4. Calculate Stats via Worker
    const statsResult = await this.gamification.calculateStatsAsync(bookmarks);
    this.currentStreak = statsResult.streak;

    // 2. Get Badges using the Map returned by worker
    this.badges = this.gamification.getBadges(statsResult.raw);

  }




  async logout() {
    await this.auth.logout();
    this.badges = [];
    this.versesMarked = 0;
    this.booksRead = 0;
  }

  async loginGoogle() {
    console.log('Login with Google logic starting...');
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión con Google...',
    });
    await loading.present();

    try {
      await this.auth.loginWithGoogle();
      this.presentToast('Bienvenido. Sincronizando tus datos locales...', 'success');

      // Trigger forced sync to merge local guest data with cloud
      this.sync.syncAll(true);
    } catch (error) {
      console.error('Google Login UI Error', error);
      this.presentToast('Error al iniciar sesión: ' + (error.message || JSON.stringify(error)), 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
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
