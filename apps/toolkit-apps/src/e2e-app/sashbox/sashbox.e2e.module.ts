import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SashboxE2eComponent } from './sashbox.e2e.component';
import { SciSashboxModule } from '@scion/toolkit/sashbox';
import { SciCheckboxModule, SciFormFieldModule } from '@scion/ɵtoolkit/widgets';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SciSashboxModule,
    SciFormFieldModule,
    SciCheckboxModule,
    FormsModule,
  ],
  declarations: [
    SashboxE2eComponent,
  ],
})
export class SashboxE2eModule {
}
