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

import {firebaseConfig} from "../environments/environment";

import { AngularFireModule} from "@angular/fire";
import {AngularFireAuthModule, AngularFireAuth} from "@angular/fire/auth";
import { AngularFirestoreModule} from '@angular/fire/firestore';
import { FirebaseAuthentication } from "@ionic-native/firebase-authentication/ngx";
import { GooglePlus } from '@ionic-native/google-plus/ngx';

import { Clipboard } from '@ionic-native/clipboard/ngx';

import {Zip} from '@ionic-native/zip/ngx';
import {File} from '@ionic-native/file/ngx';
import { Httpd, HttpdOptions } from '@ionic-native/httpd/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [
    StatusBar,
    GooglePlus,
    BibliaService,
    Clipboard,
    SplashScreen,
    FirebaseAuthentication,
    { provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy },
    AngularFireAuth,
    Zip,
    File,
    Httpd,
    HTTP,
    FileTransfer,
    FileTransferObject
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
