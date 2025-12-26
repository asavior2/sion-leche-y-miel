import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
//import { auth } from "firebase/app";
import {Router} from '@angular/router';
//import { FirebaseAuthentication } from "@awesome-cordova-plugins/firebase-authentication/ngx";


//import { GooglePlus } from '@awesome-cordova-plugins/google-plus';

//import { Platform } from 'ionic-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  verificationID: string;

  // tslint:disable-next-line: max-line-length
  constructor(private AFauth: AngularFireAuth, 
              private router: Router, 
              //public firebaseAuth: FirebaseAuthentication
              ) { 
    /*firebaseAuth.onAuthStateChanged().subscribe((user) =>{
      if (user){
        console.log("Login susses"+user);
        this.router.navigate(['/tabs/tab1']);
      }else{
        console.log("Login fail"+user);
        this.router.navigate(['/tabs/login']);
      }
    })*/
  }

  
  
 

  onLoginGoogle2(){
     /* return new Promise((resolve, reject) =>{
      this.gplus.login({}).then(res => {
        console.log(res);
        resolve(res);
      }).catch(err => reject(err));
    })*/
  }

  

 





}
