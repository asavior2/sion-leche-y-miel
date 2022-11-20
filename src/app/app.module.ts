import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { IonicStorageModule } from '@ionic/storage';
// Services
import { BibliaService} from './services/biblia.service';

import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

//import { AngularFireModule} from "@angular/fire";

//import { FirebaseAuthentication } from "@ionic-native/firebase-authentication/ngx";
//import { GooglePlus } from '@ionic-native/google-plus/ngx';

import { Clipboard } from '@ionic-native/clipboard/ngx';

import {Zip} from '@ionic-native/zip/ngx';
import {File} from '@ionic-native/file/ngx';
import { Httpd, HttpdOptions } from '@ionic-native/httpd/ngx';
//import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: '_myDb',
      driverOrder: ['localstorage']
    }),
    AppRoutingModule,
    RouterModule.forRoot(
			[],
      {
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
			}
		),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    StatusBar,
    BibliaService,
    Clipboard,
    SplashScreen,
    { provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy },
    Zip,
    File,
    FileOpener,
    Httpd,
    HTTP,
    //FileTransfer,
    //FileTransferObject
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
