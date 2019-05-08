import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Activity1a90c8d31Component } from './activity-1a90c8d3/activity-1a90c8d3-1.component';
import { Activity1a90c8d32Component } from './activity-1a90c8d3/activity-1a90c8d3-2.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { ViewComponent } from './view/view.component';
import { View4a3a8932Component } from './view-4a3a8932/view-4a3a8932.component';
import { ViewNavigationComponent } from './view-navigation/view-navigation.component';

const routes: Routes = [
  {path: '', component: WelcomePageComponent},
  {path: 'welcome', component: WelcomePageComponent},
  {path: 'activity-1a90c8d31-1', component: Activity1a90c8d31Component},
  {path: 'activity-1a90c8d31-2', component: Activity1a90c8d32Component},
  {path: 'view', component: ViewComponent},
  {path: 'view-4a3a8932', component: View4a3a8932Component},
  {path: 'view-navigation', component: ViewNavigationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
