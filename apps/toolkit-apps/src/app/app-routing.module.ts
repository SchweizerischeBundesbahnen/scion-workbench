import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'components', loadChildren: (): any => import('../components-app/components-app.module').then(m => m.ComponentsAppModule)},
  {path: 'e2e', loadChildren: (): any => import('../e2e-app/e2e-app.module').then(m => m.E2eAppModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
