import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  esLogin : boolean;
  constructor(private router: Router,
    public authservice: AuthService,
    public actionSheetController: ActionSheetController) { 
      
    }

    ngOnInit() {
      this.validaUri();
    }

   validaUri(){
    if (this.router.url =="/tabs/login" ){
      this.esLogin = true;
      console.log(this.esLogin)
    } else {
      this.esLogin = false;
    }
  }
  onLogout(){
      this.authservice.logout();
  }

  async presentActionSheet() {
    if(this.router.url !="/tabs/login"){
      const actionSheet = await this.actionSheetController.create({
        header: 'Opciones',
        mode: "ios",
        buttons: [{
            text: 'Desconectarse',
            role: 'destructive',
            icon: 'log-out',
            handler: () => {
              this.onLogout();
            }
          }, {
            text: 'Sobre Sion:Leche y Miel (SLM)',
            icon: 'ios-information-circle-outline',
            handler: () => {
              this.router.navigate(['/tabs/tab4']);
            }
          },
          {
            text: 'Contacto',
            icon: 'ios-contact',
            handler: () => {
              this.router.navigate(['/tabs/tab3']);
            }
          }
        ]
        });
        await actionSheet.present();
      }
    }

}
