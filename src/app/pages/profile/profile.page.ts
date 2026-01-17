import { Component, OnInit, NgZone } from '@angular/core';
import { LoadingController, ToastController, AlertController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { SyncService } from 'src/app/core/services/sync.service';
import { GamificationService, Badge } from 'src/app/core/services/gamification.service';
import { LocalBibleRepository } from 'src/app/core/repositories/local-bible.repository';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Zip } from '@awesome-cordova-plugins/zip/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

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
  notesCount = 0;
  currentStreak = 0;
  planProgress = 0;
  generalProgress = 0;
  uniqueChapters = 0;

  // Audio Download State
  activeDownloadQuality: 'alta' | 'media' | 'baja' | null = null;
  downloadProgress = 0;
  pathDiviceIosAndroid: string = '';
  audioAvailable = false;
  downloadedQuality: 'alta' | 'media' | 'baja' | null = null;

  isProduction = environment.production;
  isWeb = false;

  // --- DEBUGGING ---
  showDebug = false;
  debugData: any = {};

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
    private router: Router,
    private ngZone: NgZone,
    private analytics: AnalyticsService
  ) { }

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.isSyncing$ = this.sync.isSyncing$;
    this.isWeb = !this.platform.is('cordova');

    // Platform Path Init
    if (this.platform.is("android")) {
      this.pathDiviceIosAndroid = "/files/Documents/"
    } else if (this.platform.is("ios")) {
      this.pathDiviceIosAndroid = "/Documents/"
    }
    this.checkAudioStatus();
    this.loadStats();

    // Check initial connection
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  isOnline = true;

  updateOnlineStatus() {
    this.ngZone.run(() => {
      this.isOnline = navigator.onLine;
    });
  }

  ionViewWillEnter() {
    this.localRepo.logActivity('profile_view');
    this.analytics.logScreenView('Perfil');
    this.loadStats();
  }

  async loadStats() {
    const bookmarks = await this.localRepo.getBookmarks();
    this.versesMarked = bookmarks.length;

    const notes = await this.localRepo.getNotes();
    this.notesCount = notes.length;

    const activityLogs = await this.localRepo.getActivityLogs();
    const chapterViews = await this.localRepo.getChapterViews();

    const statsResult = await this.gamification.calculateStatsAsync(bookmarks, notes, activityLogs, chapterViews);
    this.currentStreak = statsResult.streak;

    this.badges = this.gamification.getBadges(statsResult.raw);

    // General Bible Progress
    // Total Chapters = 1189 (Standard Protestant Canon)
    const uniqueChapters = chapterViews.length;
    this.uniqueChapters = uniqueChapters;
    this.generalProgress = Math.min(100, Math.round((uniqueChapters / 1189) * 100));

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

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async loginGoogle() {
    console.log('Login with Google logic starting...');
    await this.testConnection(); // Test connection before login
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión con Google...',
    });
    await loading.present();

    try {
      await this.auth.loginWithGoogle();
      this.presentToast('Bienvenido. Sincronizando tus datos locales...', 'success', 'success');
      this.sync.syncAll(true);
    } catch (error) {
      console.error('Google Login UI Error', error);
      this.presentToast('Error al iniciar sesión: ' + (error.message || JSON.stringify(error)), 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async testConnection() {
    console.log('--- TESTING WEBVIEW CONNECTION ---');
    try {
      const start = Date.now();
      const res = await fetch('https://www.googleapis.com/discovery/v1/apis?fields=kind', { mode: 'cors' });
      const duration = Date.now() - start;
      console.log(`Connection Test Success: Status ${res.status} (${duration}ms)`);
    } catch (e) {
      console.error('--- CONNECTION TEST FAILED ---');
      console.error('Fetch Error:', e);
    }
  }

  async presentToast(message: string, color: string, color2: string = '') {
    // Note: corrected signature to match usage or fix usage.
    // Original usage: this.presentToast(msg, 'success') -> matches
    // But loginGoogle calls: this.presentToast(..., 'success')
    // Let's just keep simple signature
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  toggleDebug() {
    if (!environment.production) {
      this.showDebug = !this.showDebug;
    }
  }

  async dumpDebugData() {
    this.debugData = {
      user: await this.auth.getCurrentUser(),
      stats: await this.localRepo.getStats(),
      bookmarks: (await this.localRepo.getBookmarks()).slice(0, 5),
      unsyncedBookmarks: await this.localRepo.getUnsyncedBookmarks()
    };
    console.log('Debug Data:', this.debugData);
  }

  // --- AUDIO DOWNLOAD LOGIC ---


  // Versioning
  readonly AUDIO_VERSION = 2;
  readonly VERSION_FILE = 'audio_version_v2.txt';

  async checkAudioStatus() {
    try {
      const dirPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid;

      // 1. Check if Audio Directory exists
      const dirExists = await this.file.checkDir(dirPath, 'por-Capitulos').then(() => true).catch(() => false);

      if (!dirExists) {
        this.audioAvailable = false;
        this.downloadedQuality = null;
        return;
      }

      // 2. Check Version Flag (Cache Busting)
      // If directory exists but version file is missing, it's Legacy V1 -> DELETE IT
      const versionExists = await this.file.checkFile(dirPath + 'por-Capitulos/', this.VERSION_FILE).then(() => true).catch(() => false);

      if (!versionExists) {
        console.warn('Legacy Audio (V1) detected. Cleaning up to force V2 update...');
        await this.file.removeRecursively(dirPath, 'por-Capitulos');
        this.audioAvailable = false;
        this.downloadedQuality = null;
        this.presentToast('Nueva versión de audio disponible. Por favor descárgala nuevamente.', 'warning');
        return;
      }

      // 3. Verify Content (Simple check)
      try {
        await this.file.checkFile(dirPath + 'por-Capitulos/1/', '1.mp3');
        this.audioAvailable = true;
        this.downloadedQuality = 'alta'; // V2 is considered 'alta' (single quality)
      } catch (innerErr) {
        console.warn('Audio directory exists but content is broken.');
        this.audioAvailable = false;
        this.downloadedQuality = null;
      }

    } catch (e) {
      this.audioAvailable = false;
      this.downloadedQuality = null;
    }
  }

  async initiateDownload() {
    if (this.activeDownloadQuality) return;

    // New V2 URL (Proposed)
    const url = 'https://media.sionlecheymiel.com/descargas/biblia_audio_v2.zip';
    const nombre = "biblia_audio_v2.zip";

    this.activeDownloadQuality = 'alta'; // Single quality mapping
    this.downloadProgress = 0;
    this.presentToast('Iniciando descarga de la nueva versión de audio...', 'primary');

    await this.download(url, nombre);
  }

  async download(url: string, nombre: string) {
    const filePath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + nombre;
    let downloadInterval: any;

    try {
      console.log('Starting Download Process for:', url);

      let totalSize = 0;
      try {
        const headRes = await this.nativeHTTP.sendRequest(url, { method: 'head' });
        if (headRes.headers && headRes.headers['content-length']) {
          totalSize = parseInt(headRes.headers['content-length'], 10);
        } else if (headRes.headers && headRes.headers['Content-Length']) {
          totalSize = parseInt(headRes.headers['Content-Length'], 10);
        }
      } catch (headErr) {
        console.warn('Could not get file size via HEAD', headErr);
      }

      if (totalSize > 0) {
        downloadInterval = setInterval(() => {
          this.file.resolveLocalFilesystemUrl(filePath)
            .then(fileEntry => {
              fileEntry.getMetadata(metadata => {
                this.ngZone.run(() => {
                  const currentSize = metadata.size;
                  this.downloadProgress = Math.round((currentSize / totalSize) * 100);
                  console.log(`Download Polling: ${currentSize} / ${totalSize} (${this.downloadProgress}%)`);
                });
              }, _ => { });
            })
            .catch(_ => { });
        }, 500);
      }

      console.log('Starting Native Download...');
      await this.nativeHTTP.downloadFile(url, {}, {}, filePath);
      console.log('Download complete');

      if (downloadInterval) clearInterval(downloadInterval);
      this.ngZone.run(() => this.downloadProgress = 100);

      // Cleanup destination before unzip (just in case)
      try {
        await this.file.removeRecursively(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos');
      } catch (e) { }

      await this.unZip(nombre);

    } catch (err) {
      if (downloadInterval) clearInterval(downloadInterval);
      console.error('Download error', err);
      this.resetDownloadState();
      this.alertErrorDownloadAudio("Ocurrió un problema", err.status + " " + (err.error || ''));
    }
  }

  async unZip(nombre: string) {
    const zipPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + nombre;
    const destPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid;

    try {
      await this.file.checkFile(zipPath, '');
      console.log('Starting Unzip:', zipPath, 'to', destPath);

      const result = await this.zip.unzip(zipPath, destPath, (progress) => {
        this.ngZone.run(() => {
          if (progress.total > 0) {
            this.downloadProgress = Math.round((progress.loaded / progress.total) * 100);
          }
        });
      });

      console.log('Unzip Result Code:', result);

      if (result === 0 || (typeof result === 'object' && result !== null)) {
        this.ngZone.run(() => {
          this.presentToast('Audio Biblia (v2) instalada correctamente.', 'success');
          this.audioAvailable = true;
          this.downloadedQuality = 'alta';
          this.resetDownloadState();
        });

        // Write Version Flag
        try {
          // We write '2' to audio_version_v2.txt
          await this.file.writeFile(destPath + 'por-Capitulos/', this.VERSION_FILE, String(this.AUDIO_VERSION), { replace: true });
        } catch (wErr) {
          console.error('Error writing version marker', wErr);
        }

        this.file.removeFile(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, nombre)
          .catch(e => console.warn('Could not delete zip file', e));

      } else {
        this.ngZone.run(() => {
          this.alertErrorDownloadAudio('Error al descomprimir', 'Código: ' + JSON.stringify(result));
          this.resetDownloadState();
        });
      }
    } catch (err) {
      console.error('Unzip Catch Error:', err);
      const errMsg = (typeof err === 'object') ? JSON.stringify(err) : String(err);

      this.ngZone.run(() => {
        this.alertErrorDownloadAudio('Error', errMsg);
        this.resetDownloadState();
      });
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
