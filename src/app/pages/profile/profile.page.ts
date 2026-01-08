import { Component, OnInit, NgZone } from '@angular/core';
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
  downloadedQuality: 'alta' | 'media' | 'baja' | null = null;

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
    private ngZone: NgZone
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

  async testConnection() {
    console.log('--- TESTING WEBVIEW CONNECTION ---');
    try {
      const start = Date.now();
      const res = await fetch('https://www.googleapis.com/discovery/v1/apis?fields=kind', { mode: 'cors' });
      const duration = Date.now() - start;
      console.log(`Connection Test Success: Status ${res.status} (${duration}ms)`);
      const text = await res.text();
      console.log('Response preview:', text.substring(0, 50));
    } catch (e) {
      console.error('--- CONNECTION TEST FAILED ---');
      console.error('Fetch Error:', e);
      // Try fallback to native HTTP if available to compare
      try {
        console.log('Attempting Native HTTP fallback check...');
        const nativeRes = await this.nativeHTTP.get('https://www.google.com', {}, {});
        console.log('Native HTTP Success! Status:', nativeRes.status);
      } catch (nativeErr) {
        console.error('Native HTTP also failed:', nativeErr);
      }
    }
    console.log('----------------------------------');
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
      const dirPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid;
      // 1. Check if directory exists
      await this.file.checkDir(dirPath, 'por-Capitulos');

      // 2. Check for marker file to identify quality
      try {
        const quality = await this.file.readAsText(dirPath + 'por-Capitulos/', 'calidad.txt');
        if (quality && (['alta', 'media', 'baja'].includes(quality.trim()))) {
          this.downloadedQuality = quality.trim() as any;
          this.audioAvailable = true;
          return;
        }
      } catch (err) {
        console.warn('calidad.txt missing, falling back to basic check');
      }

      // 3. Fallback: Verify Genesis 1 exists if marker missing (legacy support)
      try {
        await this.file.checkFile(dirPath + 'por-Capitulos/1/', '1.mp3');
        this.audioAvailable = true;
        // If we have audio but no marker, we can't be sure of quality. 
        // We'll leave downloadedQuality null but audioAvailable true, 
        // or default to 'media' if preferred. For now keeping it ambiguous triggers "Check" on only verified ones? 
        // Actually, if we want to show GREEN, we need to match. Let's assume 'unknown' doesn't match any.
        // Or we could write the marker now if we knew? No.
      } catch (innerErr) {
        console.warn('Audio directory exists but Genesis 1 is missing.', innerErr);
        this.audioAvailable = false;
        this.downloadedQuality = null;
      }

    } catch (e) {
      this.audioAvailable = false;
      this.downloadedQuality = null;
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
    let downloadInterval: any;

    try {
      console.log('Starting Download Process for:', url);

      // 1. Get File Size via HEAD request
      let totalSize = 0;
      try {
        const headRes = await this.nativeHTTP.sendRequest(url, { method: 'head' });
        if (headRes.headers && headRes.headers['content-length']) {
          totalSize = parseInt(headRes.headers['content-length'], 10);
          console.log('Total file size:', totalSize);
        } else if (headRes.headers && headRes.headers['Content-Length']) { // Case sensitive check
          totalSize = parseInt(headRes.headers['Content-Length'], 10);
          console.log('Total file size:', totalSize);
        }
      } catch (headErr) {
        console.warn('Could not get file size via HEAD, progress will be indeterminate', headErr);
      }

      // 2. Start Polling for Progress
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
            .catch(_ => { }); // File might not exist yet
        }, 500);
      }

      // 3. Start Download
      console.log('Starting Native Download...');
      await this.nativeHTTP.downloadFile(url, {}, {}, filePath);
      console.log('Download complete');

      // Clear interval immediately
      if (downloadInterval) clearInterval(downloadInterval);
      this.ngZone.run(() => this.downloadProgress = 100);

      // 4. Cleanup Old Directory (Logic preserved)
      try {
        await this.file.checkDir(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos');
        await this.file.removeRecursively(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos');
      } catch (e) {
        // Ignore if dir doesn't exist
      }

      await this.unZip(nombre);

    } catch (err) {
      if (downloadInterval) clearInterval(downloadInterval);
      console.error('Download error', err);
      this.resetDownloadState();
      this.alertErrorDownloadAudio("Ocurrió un problema", err.status + " " + err.error);
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
            console.log(`Unzip Progress: ${this.downloadProgress}%`);
          }
        });
      });

      console.log('Unzip Result Code:', result);

      // Relaxed Success Check: Verify if result is 0 OR an object (progress/stats object)
      // User log confirmed result is: {loaded: 0, total: 481131402}
      if (result === 0 || (typeof result === 'object' && result !== null)) {
        // Success
        this.ngZone.run(() => {
          this.presentToast('Biblia en Audio instalada correctamente.', 'success');
          this.audioAvailable = true;
          // Set the newly downloaded quality as active
          if (nombre.includes('alta')) this.downloadedQuality = 'alta';
          else if (nombre.includes('media')) this.downloadedQuality = 'media';
          else if (nombre.includes('baja')) this.downloadedQuality = 'baja';

          this.resetDownloadState();
        });

        // Write marker file
        try {
          let q = 'media';
          if (nombre.includes('alta')) q = 'alta';
          if (nombre.includes('baja')) q = 'baja';
          await this.file.writeFile(destPath + 'por-Capitulos/', 'calidad.txt', q, { replace: true });
        } catch (wErr) {
          console.error('Error writing quality marker', wErr);
        }

        // Cleanup zip
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
      // Fix for "Error [object Object]": Stringify the error
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
