import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest } from '@awesome-cordova-plugins/sign-in-with-apple/ngx';
import { Platform } from '@ionic/angular';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth'; // correct v9+ imports used by angularfire compat

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private googlePlus: GooglePlus,
    private signInWithApple: SignInWithApple,
    private platform: Platform
  ) { }

  // ============================
  // EMAIL / PASSWORD
  // ============================

  async loginWithEmail(email: string, pass: string) {
    const credential = await this.afAuth.signInWithEmailAndPassword(email, pass);
    if (credential.user && !credential.user.emailVerified) {
      // Optional: Force verification. For now, we'll let them in but warn in UI.
      // throw new Error('Email not verified');
    }
    return credential;
  }

  async registerWithEmail(email: string, pass: string) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, pass);
    if (credential.user) {
      await credential.user.sendEmailVerification();
    }
    return credential;
  }

  async logout() {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      try {
        await this.googlePlus.logout();
      } catch (e) { } // ignore if not logged in
    }
    return this.afAuth.signOut();
  }

  // ============================
  // GOOGLE LOGIN (HYBRID)
  // ============================

  async loginWithGoogle() {
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      return this.nativeGoogleLogin();
    } else {
      return this.webGoogleLogin();
    }
  }

  private async nativeGoogleLogin() {
    const res = await this.googlePlus.login({
      'webClientId': '362970955152-uhsnv2739ru9f7sdl5jib43obmkpkbjm.apps.googleusercontent.com', // Must match one in Google Cloud Console
      'offline': true
    });

    // Create a Firebase credential with the Google auth token
    const credential = GoogleAuthProvider.credential(res.idToken);
    return this.afAuth.signInWithCredential(credential);
  }

  private async webGoogleLogin() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return this.afAuth.signInWithPopup(provider);
  }

  // ============================
  // APPLE LOGIN (HYBRID)
  // ============================

  async loginWithApple() {
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      return this.nativeAppleLogin();
    } else {
      // NOTE: Web Apple Login requires "Sign In with Apple" configured in Firebase Console 
      // AND Service ID setup in Apple Developer Portal.
      return this.webAppleLogin();
    }
  }

  private async nativeAppleLogin() {
    const appleResponse: AppleSignInResponse = await this.signInWithApple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    });

    const credential = new OAuthProvider('apple.com').credential({
      idToken: appleResponse.identityToken,
      accessToken: appleResponse.authorizationCode // Unlike Google, Apple passes authCode as accessToken often
    });

    return this.afAuth.signInWithCredential(credential);
  }

  private async webAppleLogin() {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    return this.afAuth.signInWithPopup(provider);
  }

  getAuth() {
    return this.afAuth;
  }
}
