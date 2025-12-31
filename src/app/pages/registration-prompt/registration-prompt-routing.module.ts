import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrationPromptPage } from './registration-prompt.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrationPromptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationPromptPageRoutingModule {}
