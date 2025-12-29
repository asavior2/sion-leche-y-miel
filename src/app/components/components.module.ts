import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BadgesCardComponent } from './badges-card/badges-card.component';

@NgModule({
    declarations: [BadgesCardComponent],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [BadgesCardComponent]
})
export class ComponentsModule { }
