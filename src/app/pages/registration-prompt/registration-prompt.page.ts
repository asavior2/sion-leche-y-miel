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
    this.navCtrl.navigateForward('/login'); // Send to Login first, which has links to Register
  }

  async remindLater() {
    await this.modalCtrl.dismiss();
  }

  async dontShowAgain() {
    await this.storage.set('registration_prompt_status', 'never');
    await this.modalCtrl.dismiss();
  }
}
