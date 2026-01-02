import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { SyncService } from 'src/app/core/services/sync.service';
import { GamificationService, Badge } from 'src/app/core/services/gamification.service';
import { LocalBibleRepository } from 'src/app/core/repositories/local-bible.repository';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Zip } from '@awesome-cordova-plugins/zip/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Router } from '@angular/router';

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
  planProgress = 0;

  // Audio Download State
  activeDownloadQuality: 'alta' | 'media' | 'baja' | null = null;
  downloadProgress = 0;
  pathDiviceIosAndroid: string = '';
  audioAvailable = false;

  constructor(
    private auth: AuthService,
    private sync: SyncService,
    private gamification: GamificationService,
    private localRepo: LocalBibleRepository,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private zip: Zip,
    private file: File,
    private nativeHTTP: HTTP,
    private alertCtrl: AlertController,
    private platform: Platform,
    private router: Router
  ) { }

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.isSyncing$ = this.sync.isSyncing$;

    // Platform Path Init
    if (this.platform.is("android")) {
      this.pathDiviceIosAndroid = "/files/Documents/"
    } else if (this.platform.is("ios")) {
      this.pathDiviceIosAndroid = "/Documents/"
    }
    this.checkAudioStatus();
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

    // 3. Plan Progress (Bible One Year)
    // Assuming 365 days for the standard plan
    const planProgressData = await this.localRepo.getReadingProgress('bibleOneYear');
    const completedDays = planProgressData.filter(p => p.status === 1).length;
    this.planProgress = Math.min(100, Math.round((completedDays / 365) * 100));
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

  // --- AUDIO DOWNLOAD LOGIC ---

  async checkAudioStatus() {
    try {
      // Check if 'por-Capitulos' directory exists
      await this.file.checkDir(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos');
      this.audioAvailable = true;
    } catch (e) {
      this.audioAvailable = false;
    }
  }

  async initiateDownload(calidad: 'alta' | 'media' | 'baja') {
    if (this.activeDownloadQuality) return; // Prevent concurrent downloads

    let url = '';
    let nombre = '';

    if (calidad === 'alta') {
      url = 'https://sionlecheymiel.com/file/audio-SLM-calidad-alta.zip';
      nombre = "audio-SLM-calidad-alta.zip";
    } else if (calidad === 'media') {
      url = 'https://sionlecheymiel.com/file/audio-SLM-calidad-media.zip';
      nombre = "audio-SLM-calidad-media.zip";
    } else {
      url = 'https://sionlecheymiel.com/file/audio-SLM-calidad-baja.zip';
      nombre = "audio-SLM-calidad-baja.zip";
    }

    this.activeDownloadQuality = calidad;
    this.downloadProgress = 0;
    this.presentToast('Iniciando descarga en segundo plano...', 'primary');

    await this.download(url, nombre);
  }

  async download(url: string, nombre: string) {
    const filePath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + nombre;

    this.nativeHTTP.downloadFile(url, {}, {}, filePath).then(response => {
      console.log('Archivo descargado...', response);
      // Delete old directory if exists
      this.file.checkDir(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos')
        .then(_ => {
          this.file.removeRecursively(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos')
            .then(_ => this.unZip(nombre))
            .catch(err => {
              console.error("Error removing old dir", err);
              this.unZip(nombre);
            });
        }).catch(err => {
          this.unZip(nombre); // Directory didn't exist, proceed
        });

    }).catch(err => {
      console.error('Download error', err);
      this.resetDownloadState();
      this.alertErrorDownloadAudio("Ocurrió un problema", err.status + " " + err.error);
    });
  }

  async unZip(nombre: string) {
    const zipPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + nombre;

    try {
      await this.file.checkFile(zipPath, '');
      const result = await this.zip.unzip(zipPath,
        this.file.applicationStorageDirectory + this.pathDiviceIosAndroid,
        (progress) => {
          if (progress.total > 0) {
            this.downloadProgress = Math.round((progress.loaded / progress.total) * 100);
            // Force change detection if needed, implied by Angular Zone
          }
        }
      );

      if (result === 0) {
        // Success
        this.presentToast('Biblia en Audio instalada correctamente.', 'success');
        this.audioAvailable = true;
        this.file.removeFile(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, nombre);
      } else {
        this.alertErrorDownloadAudio('Error al descomprimir', 'Código: ' + result);
      }
    } catch (err) {
      this.alertErrorDownloadAudio('Error', JSON.stringify(err));
    } finally {
      this.resetDownloadState();
    }
  }

  resetDownloadState() {
    this.activeDownloadQuality = null;
    this.downloadProgress = 0;
  }

  async alertErrorDownloadAudio(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
      mode: 'ios'
    });
    await alert.present();
  }

  openContact() {
    this.router.navigate(['/tabs/contacto']);
  }

  openAbout() {
    this.router.navigate(['/tabs/tab4']);
  }
}
