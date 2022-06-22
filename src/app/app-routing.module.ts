import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, ExtraOptions } from '@angular/router';



const routes: Routes = [
  { path: '', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },
  // { path: 'plan-lectura', loadChildren: './plan-lectura/plan-lectura.module#PlanLecturaPageModule' },
  { path: 'plan-detalle/:id', loadChildren: () => import('./plan-detalle/plan-detalle.module').then(m => m.PlanDetallePageModule) },
  { path: 'leer-plan/:libro/:capitulo/:versiculo/:versiculoFinal', loadChildren: () => import('./leer-plan/leer-plan.module').then(m => m.LeerPlanPageModule) }
];
const routerOptions: ExtraOptions = {
  scrollPositionRestoration:'enabled',
  anchorScrolling:'enabled'
}
@NgModule({
  imports: [
    RouterModule.forRoot(routes, routerOptions) //eliminado , { preloadingStrategy: PreloadAllModules }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
