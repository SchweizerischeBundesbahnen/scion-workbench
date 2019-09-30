import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SashboxApiComponent } from './sashbox.api.component';
import { SashboxApiModule } from './sashbox.api.module';

const routes: Routes = [
  {path: '', component: SashboxApiComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SashboxApiModule,
  ],
})
export class SashboxRoutingApiModule {
}
