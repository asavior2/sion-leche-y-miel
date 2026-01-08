import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    loginForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        public platform: Platform
    ) { }

    ngOnInit() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    async onLogin() {
        if (this.loginForm.invalid) {
            return;
        }

        const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...' });
        await loading.present();

        const { email, password } = this.loginForm.value;

        try {
            await this.authService.loginWithEmail(email, password);
            loading.dismiss();
            this.router.navigate(['/tabs/lectura']);
        } catch (error: any) {
            loading.dismiss();
            let msg = 'Error al iniciar sesión';
            if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
            if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
            if (error.message === 'Email not verified') msg = 'Por favor verifica tu correo antes de entrar.';

            this.presentToast(msg);
        }
    }

    async onGoogleLogin() {
        try {
            await this.authService.loginWithGoogle();
            this.router.navigate(['/tabs/lectura']);
        } catch (error) {
            this.presentToast('Error con Google Login');
        }
    }

    async onAppleLogin() {
        try {
            await this.authService.loginWithApple();
            this.router.navigate(['/tabs/lectura']);
        } catch (error) {
            this.presentToast('Error con Apple Login');
        }
    }

    goToRegister() {
        this.router.navigate(['/register']);
    }

    async presentToast(message: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration: 3000,
            position: 'bottom'
        });
        toast.present();
    }
}
