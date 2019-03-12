import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkbenchModule } from '@scion/workbench';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Activity1a90c8d31Component } from './activity-1a90c8d3/activity-1a90c8d3-1.component';
import { Activity1a90c8d32Component } from './activity-1a90c8d3/activity-1a90c8d3-2.component';

@NgModule({
  declarations: [
    AppComponent,
    Activity1a90c8d31Component,
    Activity1a90c8d32Component,
    WelcomePageComponent,
    ViewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WorkbenchModule.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {
}
