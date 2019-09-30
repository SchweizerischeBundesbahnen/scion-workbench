import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { E2eAppComponent } from './e2e-app.component';
import { E2eAppRoutingModule } from './e2e-app-routing.module';

@NgModule({
  imports: [
    CommonModule,
    E2eAppRoutingModule,
  ],
  declarations: [
    E2eAppComponent,
  ],
})
export class E2eAppModule {
}
