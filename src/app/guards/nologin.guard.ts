import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { Router} from '@angular/router';
import {AuthService} from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class NologinGuard implements CanActivate {

  constructor(private AFuath: AngularFireAuth, 
              private router: Router,
              private  authService:AuthService
              ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (this.authService.ifLogin) { return true; }

      console.log('access!')
      this.router.navigate(['/tabs/tab1']);
      return false
      /*return this.AFuath.authState.pipe(map(auth =>{
        if (isNullOrUndefined(auth)){
          return true;
        } else {
          this.router.navigate(['/tabs/tab1']);
          return false;
        }
      }))*/

    }
}
