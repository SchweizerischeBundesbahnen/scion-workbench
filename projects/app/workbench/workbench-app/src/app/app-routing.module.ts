import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Activity1a90c8d31Component } from './activity-1a90c8d3/activity-1a90c8d3-1.component';
import { Activity1a90c8d32Component } from './activity-1a90c8d3/activity-1a90c8d3-2.component';

const routes: Routes = [
  {path: 'activity-1a90c8d31-1', component: Activity1a90c8d31Component},
  {path: 'activity-1a90c8d31-2', component: Activity1a90c8d32Component},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
