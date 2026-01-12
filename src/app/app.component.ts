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
import { firstValueFrom } from 'rxjs';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { Router } from '@angular/router';
import { AnalyticsService } from './core/services/analytics.service';

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
    private modalCtrl: ModalController,
    private deeplinks: Deeplinks,
    private router: Router,
    private analytics: AnalyticsService // Injected
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

      this.splashScreen.hide(); // Duplicated in original, keeping or cleaning? Original had duplicate calls. I'll clean it.
      // this.changeDarkMode(); // Cleaning duplicate.

      if (this.platform.is('cordova')) {
        // Initialize DeepLinks
        this.deeplinks.routeWithNavController(this.router, {
          '/app/bible/:libro/:capitulo/:versiculo': 'lectura'
        }).subscribe(match => {
          console.log('Successfully matched route', match);
          const args = match.$args;
          if (args.libro && args.capitulo && args.versiculo) {
            this.router.navigate(['/tabs/lectura'], {
              queryParams: {
                libro: args.libro,
                capitulo: args.capitulo,
                versiculo: args.versiculo
              }
            });
          }
        }, nomatch => {
          console.log('Got a deeplink that didn\'t match', nomatch);
        });
      }


      // Initialize Auth & Sync
      try {
        // Wait for auth to settle (race condition fix)
        const user = await firstValueFrom(this.auth.user$);
        if (!user) {
          console.log('User not logged in. Operating in Offline Guest Mode.');
          this.analytics.setUserType('guest'); // Track Guest

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
          // Only show on Mobile Apps (Cordova/Capacitor) or if explicitly desired on mobile web.
          // User requested NOT to show on "version web pantalla grande" (Desktop).
          const isDesktop = this.platform.is('desktop');
          const promptStatus = await this.storage.get('registration_prompt_status');

          if (promptStatus !== 'never' && !isDesktop) {
            setTimeout(async () => {
              const modal = await this.modalCtrl.create({
                component: RegistrationPromptPage,
                cssClass: 'registration-prompt-modal',
                backdropDismiss: true
              });
              await modal.present();
            }, 1000); // Shorter wait if tutorial was just closed

            // Note: RegistrationPrompt might change user status if they login/register there.
          }
        } else {
          this.analytics.setUserType('registered'); // Track Registered
        }
        // Trigger Sync (background)
        this.sync.syncAll();
      } catch (error) {
        console.error('Error initializing Auth/Sync:', error);
      }
    });
  }

  changeDarkMode() {
    // Only auto-detect on iOS per user preference (avoiding Android Emulator defaults)
    if (this.platform.is('ios')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (prefersDark.matches) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    } else {
      // Default to Light on Android/Web
      document.body.classList.remove('dark');
    }
  }
}
