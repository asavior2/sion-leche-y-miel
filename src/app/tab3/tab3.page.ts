import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  fontSize;

  constructor(private storage: Storage) {
    this.storage.get('fontSize').then((val) => {
      if (val == null) {
        this.fontSize = 4;
      } else {
        this.fontSize = val;
      }
    });
  }

  
}
