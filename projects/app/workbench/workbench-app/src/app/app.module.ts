import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkbenchModule } from '@scion/workbench';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
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
