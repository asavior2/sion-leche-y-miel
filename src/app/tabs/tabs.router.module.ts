import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';


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
        path: 'lectura',
        children: [
          {
            path: '',
            loadChildren: () => import('../lectura/lectura.module').then(m => m.LecturaPageModule),
            canActivate: []
          }
        ]
      },
      {
        path: 'concordancia',
        children: [
          {
            path: '',
            loadChildren: () => import('../concordancia/concordancia.module').then(m => m.ConcordanciaPageModule),
            canActivate: []
          }
        ]
      },
      {
        path: 'contacto',
        children: [
          {
            path: '',
            loadChildren: () => import('../contacto/contacto.module').then(m => m.ContactoPageModule),
            canActivate: []
          }
        ]
      },
      {
        path: 'plan-lectura',
        children: [
          {
            path: '',
            /*loadChildren: '../tab3/tab3.module#Tab3PageModule',*/
            loadChildren: () => import('../plan-lectura/plan-lectura.module').then(m => m.PlanLecturaPageModule), // este es paraplan de lectura
            canActivate: []
          }
        ]
      },
      {
        path: 'tab4',
        children: [
          {
            path: '',
            loadChildren: () => import('../sobre/sobre.module').then(m => m.SobrePageModule),
            canActivate: []
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/lectura',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/lectura',
    pathMatch: 'full',
    canActivate: []
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
export class TabsPageRoutingModule { }
