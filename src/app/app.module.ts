import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
// Services
import { BibliaService } from './services/biblia.service';

//import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

//import { AngularFireModule} from "@angular/fire";

//import { FirebaseAuthentication } from "@awesome-cordova-plugins/firebase-authentication/ngx";
//import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';

import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';

import { Zip } from '@awesome-cordova-plugins/zip/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
//import { Httpd, HttpdOptions } from '@awesome-cordova-plugins/httpd/ngx';
//import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';


@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot({
            name: '_myDb'
        }),
        AppRoutingModule,
        RouterModule.forRoot([], {
            // Tell the router to use the hash instead of HTML5 pushstate.
            useHash: true,
            // In order to get anchor / fragment scrolling to work at all, we need to
            // enable it on the router.
            anchorScrolling: "enabled",
            // Once the above is enabled, the fragment link will only work on the
            // first click. This is because, by default, the Router ignores requests
            // to navigate to the SAME URL that is currently rendered. Unfortunately,
            // the fragment scrolling is powered by Navigation Events. As such, we
            // have to tell the Router to re-trigger the Navigation Events even if we
            // are navigating to the same URL.
            onSameUrlNavigation: "reload",
            // Let's enable tracing so that we can see the aforementioned Navigation
            // Events when the fragment is clicked.
            enableTracing: false,
            scrollPositionRestoration: "enabled"
        }),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })], providers: [
            StatusBar,
            BibliaService,
            Clipboard,
            SplashScreen,
            {
                provide: RouteReuseStrategy,
                useClass: IonicRouteStrategy
            },
            Zip,
            File,
            //FileOpener,
            //Httpd,
            HTTP,
            provideHttpClient(withInterceptorsFromDi()),
        ]
})
export class AppModule { }
