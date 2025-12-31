import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Storage as IonicStorage } from '@ionic/storage-angular';

@Component({
  selector: 'app-registration-prompt',
  templateUrl: './registration-prompt.page.html',
  styleUrls: ['./registration-prompt.page.scss'],
})
export class RegistrationPromptPage implements OnInit {

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private storage: IonicStorage
  ) { }

  ngOnInit() {
  }

  async goToRegister() {
    await this.modalCtrl.dismiss();
    // Navigate to Profile page where login/register happens
    this.navCtrl.navigateForward('/tabs/profile');
  }

  async remindLater() {
    // Just dismiss. Logic in app.component handles showing it again next boot unless 'never' is set.
    await this.modalCtrl.dismiss();
  }

  async dontShowAgain() {
    await this.storage.set('registration_prompt_status', 'never');
    await this.modalCtrl.dismiss();
  }
}
