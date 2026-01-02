import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BadgesCardComponent } from './badges-card/badges-card.component';
import { BibleViewerComponent } from './bible-viewer/bible-viewer.component';

@NgModule({
    declarations: [BadgesCardComponent, BibleViewerComponent],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [BadgesCardComponent, BibleViewerComponent]
})
export class ComponentsModule { }
