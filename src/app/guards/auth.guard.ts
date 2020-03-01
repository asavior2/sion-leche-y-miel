import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { Router} from '@angular/router';
import { FirebaseAuthentication } from "@ionic-native/firebase-authentication/ngx";
import {AuthService} from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private AFuath: AngularFireAuth, private router: Router,
              public firebaseAuth: FirebaseAuthentication,
              private authService: AuthService
              ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.authService.ifLogin) { return true; }

      console.log('access denied!')
      this.router.navigate(['/tabs/login']);
      return false
      /*
      //Este es para la autenticacion web la primera que hice que devuelve un objeto
      return this.AFuath.authState.pipe(map(auth =>{
        //console.log("Desde guard auth "+auth);
        if (isNullOrUndefined(auth)){
          this.router.navigate(['/tabs/login']);
          return false;
        } else {
          return true;
        }
      }))*/
    }
}
