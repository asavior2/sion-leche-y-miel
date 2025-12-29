import { Component, Input, OnInit } from '@angular/core';
import { Badge } from 'src/app/core/services/gamification.service';

@Component({
  selector: 'app-badges-card',
  templateUrl: './badges-card.component.html',
  styleUrls: ['./badges-card.component.scss'],
})
export class BadgesCardComponent implements OnInit {

  @Input() badges: Badge[] = [];

  constructor() { }

  ngOnInit() { }

}
