import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, ExtraOptions } from '@angular/router';



const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  // { path: 'plan-lectura', loadChildren: './plan-lectura/plan-lectura.module#PlanLecturaPageModule' },
  { path: 'plan-detalle/:id', loadChildren: './plan-detalle/plan-detalle.module#PlanDetallePageModule' },
  { path: 'leer-plan/:libro/:capitulo/:versiculo/:versiculoFinal', loadChildren: './leer-plan/leer-plan.module#LeerPlanPageModule' }
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
