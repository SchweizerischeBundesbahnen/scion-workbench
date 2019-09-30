import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SashboxE2eComponent } from './sashbox.e2e.component';
import { SashboxE2eModule } from './sashbox.e2e.module';

const routes: Routes = [
  {path: '', component: SashboxE2eComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SashboxE2eModule,
  ],
})
export class SashboxRoutingE2eModule {
}
