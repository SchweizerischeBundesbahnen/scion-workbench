import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { E2eAppComponent } from './e2e-app.component';

const routes: Routes = [
  {
    path: '', component: E2eAppComponent,
    children: [
      {path: 'sashbox', loadChildren: (): any => import('./sashbox/sashbox-routing.e2e.module').then(m => m.SashboxRoutingE2eModule)},
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
export class E2eAppRoutingModule {
}
