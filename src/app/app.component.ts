import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();

import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { AuthService } from './core/services/auth.service';
import { SyncService } from './core/services/sync.service';
import { DataMigrationService } from './core/services/data-migration.service';
import { RegistrationPromptPage } from './pages/registration-prompt/registration-prompt.page';
import { TutorialPage } from './pages/tutorial/tutorial.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: IonicStorage,
    private migrationService: DataMigrationService,
    private auth: AuthService,
    private sync: SyncService,
    private modalCtrl: ModalController
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.storage.create();
    this.migrationService.migrate();
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.changeDarkMode();

      // Initialize Auth & Sync
      try {
        const user = await this.auth.getCurrentUser();
        if (!user) {
          console.log('User not logged in. Operating in Offline Guest Mode.');
          // await this.auth.loginAnonymously(); // Disabled per user request

          // Check Tutorial Status First
          const hasSeenTutorial = await this.storage.get('has_seen_tutorial');
          if (!hasSeenTutorial) {
            const tutorialModal = await this.modalCtrl.create({
              component: TutorialPage,
              backdropDismiss: false
            });
            await tutorialModal.present();
            await tutorialModal.onDidDismiss(); // Wait for tutorial to finish

            // First run: Do not show registration prompt immediately after tutorial.
            // It will appear on next launch.
            return;
          }

          // Check Registration Prompt
          const promptStatus = await this.storage.get('registration_prompt_status');
          if (promptStatus !== 'never') {
            setTimeout(async () => {
              const modal = await this.modalCtrl.create({
                component: RegistrationPromptPage,
                cssClass: 'registration-prompt-modal',
                backdropDismiss: true
              });
              await modal.present();
            }, 1000); // Shorter wait if tutorial was just closed
          }
        }
        // Trigger Sync (background)
        this.sync.syncAll();
      } catch (error) {
        console.error('Error initializing Auth/Sync:', error);
      }
    });
  }

  changeDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      document.body.classList.toggle('dark');
    }
  }
}
