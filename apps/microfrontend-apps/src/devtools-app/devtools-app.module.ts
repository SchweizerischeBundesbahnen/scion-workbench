import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevtoolsAppRoutingModule } from './devtools-app-routing.module';
import { DevtoolsAppComponent } from './devtools-app.component';
import { Title } from '@angular/platform-browser';

@NgModule({
  imports: [
    CommonModule,
    DevtoolsAppRoutingModule,
  ],
  declarations: [
    DevtoolsAppComponent,
  ],
})
export class DevtoolsAppModule {

  constructor(title: Title) {
    title.setTitle('SCION Microfrontend Platform - Devtools');
  }
}
