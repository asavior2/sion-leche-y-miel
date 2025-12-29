import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user$: Observable<firebase.User | null>;

    constructor(private afAuth: AngularFireAuth) {
        this.user$ = this.afAuth.authState;
    }

    async loginAnonymously(): Promise<firebase.auth.UserCredential> {
        return this.afAuth.signInAnonymously();
    }

    async logout(): Promise<void> {
        return this.afAuth.signOut();
    }

    getCurrentUser(): Promise<firebase.User | null> {
        return this.afAuth.currentUser;
    }
}
