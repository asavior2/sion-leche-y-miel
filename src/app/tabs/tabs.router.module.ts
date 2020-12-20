import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import {AuthGuard} from '../guards/auth.guard';
import {NologinGuard} from '../guards/nologin.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      /*{
        path: 'login',
        children: [
          {
            path: '',
            loadChildren: '../login/login.module#LoginPageModule',
            canActivate: [NologinGuard]
          }
        ]
      },
      {
        path: 'registro',
        children: [
          {
            path: '',
            loadChildren: '../registro/registro.module#RegistroPageModule',
            canActivate: [NologinGuard]
          }
        ]
      },*/
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: '../tab1/tab1.module#Tab1PageModule',
            canActivate: [NologinGuard]
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: '../tab2/tab2.module#Tab2PageModule',
            canActivate: [NologinGuard]
          }
        ]
      },
      {
        path: 'contacto',
        children: [
          {
            path: '',
            loadChildren: '../tab3/tab3.module#Tab3PageModule',
            canActivate: [NologinGuard]
          }
        ]
      },
      {
        path: 'plan-lectura',
        children: [
          {
            path: '',
            /*loadChildren: '../tab3/tab3.module#Tab3PageModule',*/
            loadChildren: '../plan-lectura/plan-lectura.module#PlanLecturaPageModule', // este es paraplan de lectura
            canActivate: [NologinGuard]
          }
        ]
      },{
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: '../tab3/tab3.module#Tab3PageModule', // Este es para el contacto
            canActivate: [NologinGuard]
          }
        ]
      },
      {
        path: 'tab4',
        children: [
          {
            path: '',
            loadChildren: '../sobre/sobre.module#SobrePageModule',
            canActivate: [NologinGuard]
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
    canActivate: [NologinGuard]
  }
];
/*
 path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: '../tab1/tab1.module#Tab1PageModule',
            canActivate: [AuthGuard]    ---> esto era para la secion 
          }
        ]
      },
*/

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
