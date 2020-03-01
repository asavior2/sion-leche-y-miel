import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import { TabsPage } from "../tabs/tabs.page";
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Observable } from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase';
import { LoadingController ,AlertController,ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginDetails: any;
  user: Observable<firebase.User>;
  email: string;
  code: string;
  password: string;
  loading: any;
  telefono= "";
  campoSMS = false;


  constructor(private authService: AuthService, 
              public router:Router,
              private googlePlus: GooglePlus, 
              private AFauth: AngularFireAuth,
              private platform: Platform,
              public loadingController: LoadingController,
              public alertController: AlertController,
              public toastController: ToastController,
              public tabs: TabsPage) {
    this.tabs.validaUri();
    this.user = this.AFauth.authState;
    
  }

  async ngOnInit() {
    this.loading = await this.loadingController.create({
      message: 'Connecting ...'
    });
  }


  async presentLoading(loading) {
    await loading.present();
  }


  onSubmitlogin(){
    this.authService.login(this.email, this.password).then( res =>{
      this.router.navigate(['/tabs/tab1']);
    }).catch(err => alert('Datos incorrecto o no estas registrado'));
  }

  onSubmitLoginGoogle(){
    this.authService.onLoginGoogle().then(auth => {
      this.router.navigate(['/tabs/tab1']);
      console.log (auth);
    }).catch (err => console.log(err));
  }
  async doGoogleLogin(){/*
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
  
    this.googlePlus.login({
      'scopes': '', 
      'webClientId': 'webClientId.apps.googleusercontent.com', // T be incl
      'offline': true // Optional, but requires the webCliver
    })
    .then(user =>{
      loading.dismiss();
  
        console.log("name: " + user.displayName + "email: " + user.email);
        this.router.navigate(["/tabs/tab1"]);
        loading.dismiss();
      }, err =>{
      console.log(err);
      loading.dismiss();
    });

    async presentLoading(loading) {
      return await loading.present();
    }*/
  }

  
  onSubmitLoginGoogle2(){
   // this.nativeGoogleLogin();
   console.log("dentro");
   this.googlePlus.login({})
   .then(res => console.log(res))
   .catch(err => console.error(err));
    /*
    console.log ('estas dentro');
    this.googlePlus.login({})
  .then(res => console.log(res))
  .catch(err => console.error(err));
  
    this.authService.onLoginGoogle2().then(auth => {
      this.router.navigate(['/tabs/tab1']);
      console.log (auth);
    }).catch (err => console.log(err)); */
  }
  async login() {
    console.log("Dentro");
    let params;
    if (this.platform.is('android')) {
      console.log("android");
      params = {
        'webClientId': '362970955152-ooucs8cmh1idfech6sc9gno5cd3bfhuo.apps.googleusercontent.com',
        'offline': true
      }
    }
    else {
      params = {}
    }
    this.googlePlus.login(params)
      .then((response) => {
        const { idToken, accessToken } = response
        this.onLoginSuccess(idToken, accessToken);
      }).catch((error) => {
        console.log(error)
        alert('error:' + JSON.stringify(error))
      });
  }
  onLoginSuccess(accessToken, accessSecret) {
    const credential = accessSecret ? firebase.auth.GoogleAuthProvider
        .credential(accessToken, accessSecret) : firebase.auth.GoogleAuthProvider
            .credential(accessToken);
    this.AFauth.auth.signInWithCredential(credential)
      .then((response) => {
        this.router.navigate(["/tabs/tab1"]);
        //this.loading.dismiss();
      })

  }

  onSubmitLoginFacebook(){
    this.authService.onLoginFacebook().then(auth => {
      this.router.navigate(['/tabs/tab1']);
      console.log (auth);
    }).catch (err => console.log(err));
  }

  async alertTelefono() {
    const alert = await this.alertController.create({
      header: 'Formato de número incorrecto',
      subHeader: '',
      message: 'Debe colocar el símbolo + seguido el código del país 58 y el resto del numero ejemplo: + 58 4168180591 ',
      buttons: ['OK'],
      mode:'ios'
    });
    await alert.present();
  }
    

  onSubmitLoginTelephone(){
    if (this.telefono.match(/^\+([0-9]{5,14})$/)){
      console.log("valido");
      this.notificacionSMS();
      this.authService.phoneAuth(this.telefono);
      this.campoSMS = true;
    }else{
      console.log("No match no valido");
      this.alertTelefono();
    }
  }
  
  async notificacionSMS() {
    const toast = await this.toastController.create({
      message: 'Se le ha enviado un mensaje de texto con un código de autenticación.',
      duration: 4000,
      mode: 'ios',
      color: 'dark'
    });
    toast.present();
  }


  async alertCode() {
    const alert = await this.alertController.create({
      header: 'Formato o de código incorrecto',
      subHeader: '',
      message: 'Verifique el código enviado por mensaje de texto',
      buttons: ['OK'],
      mode:'ios'
    });
    await alert.present();
  }

  onSingInWithCode() {
    if (this.code.match(/^([0-9]{6})$/)) {
      console.log("valido");
      console.log("valido");
      console.log(this.code);
      this.authService.singInWithCode(this.code).then (auth => {
        this.router.navigate(['/tabs/tab1']);
        console.log (auth);
      }).catch (err => console.log(err));
    }else{
      console.log("Formato no valido");
      this.alertCode();
    }
    
  }




}
