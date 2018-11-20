/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SciPopupShellComponent } from './popup-shell.component';
import { SciPopupShellTitleDirective } from './popup-shell-title.directive';
import { SciPopupShellContentDirective } from './popup-shell-content.directive';
import { SciPopupShellButtonDirective } from './popup-shell-button.directive';
import { SciViewportModule } from '@scion/viewport';

/**
 * Provides the shell for a popup.
 */
@NgModule({
  declarations: [
    SciPopupShellComponent,
    SciPopupShellTitleDirective,
    SciPopupShellContentDirective,
    SciPopupShellButtonDirective,
  ],
  imports: [
    CommonModule,
    SciViewportModule,
  ],
  exports: [
    SciPopupShellComponent,
    SciPopupShellTitleDirective,
    SciPopupShellContentDirective,
    SciPopupShellButtonDirective,
  ],
})
export class SciPopupShellModule {
}
