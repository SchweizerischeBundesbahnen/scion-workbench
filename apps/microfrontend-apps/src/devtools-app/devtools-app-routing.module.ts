import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevtoolsAppComponent } from './devtools-app.component';

const routes: Routes = [
  {
    path: '', component: DevtoolsAppComponent,
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
export class DevtoolsAppRoutingModule {
}
