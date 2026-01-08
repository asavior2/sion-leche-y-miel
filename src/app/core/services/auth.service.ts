import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user$: Observable<firebase.User | null>;

    constructor(
        private afAuth: AngularFireAuth,
        private googlePlus: GooglePlus
    ) {
        this.user$ = this.afAuth.authState;
    }

    async loginAnonymously(): Promise<firebase.auth.UserCredential> {
        return this.afAuth.signInAnonymously();
    }

    async loginWithGoogle(): Promise<firebase.auth.UserCredential> {
        try {
            // 1. Native Login
            const gplusUser = await this.googlePlus.login({
                'webClientId': '362970955152-uhsnv2739ru9f7sdl5jib43obmkpkbjm.apps.googleusercontent.com', // Optional for Android, required for iOS to return idToken
                'offline': true
            });

            console.log('GooglePlus Login SUCCESS. User:', JSON.stringify(gplusUser));
            if (!gplusUser.idToken) {
                console.error('GooglePlus Error: idToken is missing!');
            }

            // 2. Create Credential
            const credential = firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken);
            console.log('Firebase Credential created. Signing in...');

            // 3. Firebase Sign In
            return await this.afAuth.signInWithCredential(credential);

        } catch (error) {
            console.error('Google Auth Error:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        return this.afAuth.signOut();
    }

    getCurrentUser(): Promise<firebase.User | null> {
        return this.afAuth.currentUser;
    }
}
