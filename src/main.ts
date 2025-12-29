import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment, firebaseConfig } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.log('Firebase Config:', firebaseConfig); // DEBUG LINE

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
