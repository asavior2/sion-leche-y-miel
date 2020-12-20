import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  // { path: 'plan-lectura', loadChildren: './plan-lectura/plan-lectura.module#PlanLecturaPageModule' },
  { path: 'plan-detalle/:id', loadChildren: './plan-detalle/plan-detalle.module#PlanDetallePageModule' },
  { path: 'leer-plan/:libro/:capitulo/:versiculo/:versiculoFinal', loadChildren: './leer-plan/leer-plan.module#LeerPlanPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
