import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'testing-app', loadChildren: (): any => import('../testing-app/testing-routing.module').then(m => m.TestingRoutingModule)},
  {path: 'devtools', loadChildren: (): any => import('../devtools-app/devtools-app.module').then(m => m.DevtoolsAppModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
