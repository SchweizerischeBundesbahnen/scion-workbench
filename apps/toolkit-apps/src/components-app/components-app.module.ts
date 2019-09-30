import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsAppRoutingModule } from './components-app-routing.module';
import { ComponentsAppComponent } from './components-app.component';

@NgModule({
  imports: [
    CommonModule,
    ComponentsAppRoutingModule,
  ],
  declarations: [
    ComponentsAppComponent,
  ],
})
export class ComponentsAppModule {
}
