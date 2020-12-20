import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { auth } from "firebase/app";
import {Router} from '@angular/router';
import { AngularFirestore} from '@angular/fire/firestore';
import { FirebaseAuthentication } from "@ionic-native/firebase-authentication/ngx";


//import { GooglePlus } from '@ionic-native/google-plus';

//import { Platform } from 'ionic-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  verificationID: string;

  // tslint:disable-next-line: max-line-length
  constructor(private AFauth: AngularFireAuth, 
              private router: Router, 
              private db: AngularFirestore, 
              public firebaseAuth: FirebaseAuthentication
              ) { 
    firebaseAuth.onAuthStateChanged().subscribe((user) =>{
      if (user){
        console.log("Login susses"+user);
        this.router.navigate(['/tabs/tab1']);
      }else{
        console.log("Login fail"+user);
        this.router.navigate(['/tabs/login']);
      }
    })
  }

  
  login(email:string, password:string){
    return new Promise((resolve, reject) => {
      this.AFauth.auth.signInWithEmailAndPassword(email, password).then(user => {
        resolve(user);
      }).catch(err => reject(err));
    });

  }
  logout(){
    this.AFauth.auth.signOut().then(() => {
      this.router.navigate(['/tabs/login']);
    });
    this.firebaseAuth.signOut();
  }
  ifLogin(){
    this.firebaseAuth.onAuthStateChanged().subscribe((userInfo) => {
      if (userInfo) {
        console.log("true onAuthStateChanged");
        return true;
      } else {
        console.log("false onAuthStateChanged");
        return false; 
      }
    });
  }

  register(email: string, password: string, name: string){
    return new Promise ((resolve, reject) =>{
      this.AFauth.auth.createUserWithEmailAndPassword(email, password).then( res =>{
        //console.log(res.user.uid);
        const uid = res.user.uid;
        this.db.collection('users').doc(uid).set({
          name : name,
          uid : uid
        })
        resolve(res)
      }).catch(err => reject(err))
    })
  }
  onLoginGoogle(){
    return new Promise((resolve, reject) =>{
      this.AFauth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then ( res =>{
        console.log (res);
        resolve(res);
      }).catch (err => reject(err))
    })
  }
  onLoginGoogle2(){
     /* return new Promise((resolve, reject) =>{
      this.gplus.login({}).then(res => {
        console.log(res);
        resolve(res);
      }).catch(err => reject(err));
    })*/
  }

  onLoginFacebook(){
    return new Promise((resolve, reject) =>{
      this.AFauth.auth.signInWithPopup(new auth.FacebookAuthProvider()).then ( res => {
        console.log (res);
        resolve(res);
      }).catch (err => reject(err))
    })
  }

  phoneAuth(telefono){
    return new Promise((resolve, reject) =>{
      this.firebaseAuth.verifyPhoneNumber(telefono, 600).then((verificationID) => {
        console.log(verificationID);
        this.verificationID = verificationID;
        resolve (verificationID);
      }).catch(err => reject(err))
    })
  }

  singInWithCode(code){
    return new Promise((resolve, reject)=>{
      this.firebaseAuth.signInWithVerificationId(this.verificationID,code).then( user => {
      console.log(user);
      resolve (user);
      }).catch (err => reject(err))
    })
  }




}
