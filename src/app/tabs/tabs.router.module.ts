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
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule),
            canActivate: []
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule),
            canActivate: []
          }
        ]
      },
      {
        path: 'contacto',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule),
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
      },{
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule), // Este es para el contacto
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
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
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
export class TabsPageRoutingModule {}
