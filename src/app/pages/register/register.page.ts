import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
    registerForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController
    ) { }

    ngOnInit() {
        this.registerForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password').value === g.get('confirmPassword').value
            ? null : { 'mismatch': true };
    }

    async onRegister() {
        if (this.registerForm.invalid) {
            return;
        }

        const { email, password } = this.registerForm.value;
        const loading = await this.loadingCtrl.create({ message: 'Creando cuenta...' });
        await loading.present();

        try {
            await this.authService.registerWithEmail(email, password);
            // Wait for auth state to separate logic, assuming authService handles email sending
            loading.dismiss();

            const alert = await this.alertCtrl.create({
                header: 'Verifica tu correo',
                message: 'Hemos enviado un enlace de verificación a tu correo. Por favor, revisa tu bandeja de entrada (y la carpeta de SPAM/Correo no deseado) para confirmar tu cuenta antes de iniciar sesión.',
                buttons: [
                    {
                        text: 'Entendido',
                        handler: () => {
                            this.router.navigate(['/login']);
                        }
                    }
                ],
                backdropDismiss: false
            });
            await alert.present();

        } catch (error: any) {
            loading.dismiss();
            let msg = 'Error al registrar';
            if (error.code === 'auth/email-already-in-use') msg = 'El correo ya está registrado';
            if (error.code === 'auth/invalid-email') msg = 'Correo inválido';
            if (error.code === 'auth/weak-password') msg = 'La contraseña es muy débil';

            this.presentToast(msg);
        }
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
