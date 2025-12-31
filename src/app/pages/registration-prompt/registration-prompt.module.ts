import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrationPromptPageRoutingModule } from './registration-prompt-routing.module';

import { RegistrationPromptPage } from './registration-prompt.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrationPromptPageRoutingModule
  ],
  declarations: [RegistrationPromptPage]
})
export class RegistrationPromptPageModule {}
