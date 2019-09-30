import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentsAppComponent } from './components-app.component';

const routes: Routes = [
  {
    path: '', component: ComponentsAppComponent,
    children: [
      {path: 'sashbox', loadChildren: (): any => import('./sashbox/sashbox-routing.api.module').then(m => m.SashboxRoutingApiModule)},
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class ComponentsAppRoutingModule {
}
