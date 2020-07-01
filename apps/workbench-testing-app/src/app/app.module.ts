import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkbenchModule } from '@scion/workbench';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Activity1a90c8d31Component } from './activity-1a90c8d3/activity-1a90c8d3-1.component';
import { Activity1a90c8d32Component } from './activity-1a90c8d3/activity-1a90c8d3-2.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { ViewComponent } from './view/view.component';
import { View4a3a8932Component } from './view-4a3a8932/view-4a3a8932.component';
import { ViewNavigationComponent } from './view-navigation/view-navigation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SciParamsEnterModule, SciPropertyModule } from 'app-common';
import { ViewBb9700a6Component } from './view-bb9700a6/view-bb9700a6.component';
import { ViewInterationComponent } from './view-interaction/view-interation.component';

@NgModule({
  declarations: [
    AppComponent,
    Activity1a90c8d31Component,
    Activity1a90c8d32Component,
    WelcomePageComponent,
    ViewComponent,
    View4a3a8932Component,
    ViewBb9700a6Component,
    ViewNavigationComponent,
    ViewInterationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WorkbenchModule.forRoot(),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SciParamsEnterModule,
    SciPropertyModule,
  ],
  providers: [],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule {
}
