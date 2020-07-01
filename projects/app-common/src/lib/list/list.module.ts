/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { SciListComponent } from './list.component';
import { A11yModule } from '@angular/cdk/a11y';
import { SciFilterFieldModule } from '../filter-field/filter-field.module';
import { SciListItemComponent } from './list-item/list-item.component';
import { SciListItemDirective } from './list-item.directive';
import { SciViewportModule } from '@scion/viewport';
import { CommonModule } from '@angular/common';

/**
 * Provides a list component to render a list of items which can be filtered.
 */
@NgModule({
  declarations: [
    SciListComponent,
    SciListItemComponent,
    SciListItemDirective,
  ],
  exports: [
    SciListComponent,
    SciListItemComponent,
    SciListItemDirective,
  ],
  imports: [
    CommonModule,
    SciViewportModule,
    SciFilterFieldModule,
    A11yModule,
  ],
})
export class SciListModule {
}
