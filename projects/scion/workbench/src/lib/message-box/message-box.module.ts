/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MessageBoxStackComponent} from './message-box-stack.component';
import {MessageBoxComponent} from './message-box.component';
import {TextMessageComponent} from './text-message.component';
import {MessageBoxCssClassesPipe} from './message-box-css-classes.pipe';
import {MessageBoxService} from './message-box.service';
import {A11yModule} from '@angular/cdk/a11y';
import {PortalModule} from '@angular/cdk/portal';
import {MoveDirective} from './move.directive';
import {CoerceObservablePipe} from './coerce-observable.pipe';

/**
 * Provides a message box for the display of a message to the user.
 *
 * A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text
 * message and one or more buttons.
 */
@NgModule({
  imports: [
    CommonModule,
    A11yModule,
    PortalModule,
  ],
  declarations: [
    MessageBoxStackComponent,
    MessageBoxComponent,
    TextMessageComponent,
    MoveDirective,
    MessageBoxCssClassesPipe,
    CoerceObservablePipe,
  ],
  exports: [
    MessageBoxStackComponent,
  ],
  providers: [
    MessageBoxService,
  ],
})
export class MessageBoxModule {
}
