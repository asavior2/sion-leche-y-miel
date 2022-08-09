import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
})
export class SobrePage implements OnInit {

  fontSize;
  constructor(private storage: Storage) {
    this.storage.get('fontSize').then((val) => {
      if (val == null || val < 15) {
        this.fontSize = 20;
      } else {
        this.fontSize = val;
      }
    });
   }

  

  ngOnInit() {
  }

}
