/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchCapabilities, WorkbenchMessageBoxLegacyOptions, WorkbenchView} from '@scion/workbench-client';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {stringifyError} from '../../common/stringify-error.util';
import {CssClassComponent} from '../../css-class/css-class.component';
import {IntentClient, mapToBody} from '@scion/microfrontend-platform';

/**
 * Allows testing workbench message box backward compatibility for workbench clients older than version v1.0.0-beta.23.
 *
 * @deprecated since workbench-client version v1.0.0-beta.23;
 */
@Component({
  selector: 'app-legacy-message-box-opener-page',
  templateUrl: './legacy-message-box-opener-page.component.html',
  styleUrls: ['./legacy-message-box-opener-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    CssClassComponent,
  ],
})
export default class LegacyMessageBoxOpenerPageComponent {

  protected form = this._formBuilder.group({
    content: this._formBuilder.control(''),
    title: this._formBuilder.control(''),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  protected openError: string | undefined;
  protected closeAction: string | undefined;

  constructor(view: WorkbenchView,
              private _intentClient: IntentClient,
              private _formBuilder: NonNullableFormBuilder) {
    view.signalReady();
  }

  public onMessageBoxOpen(): void {
    this.openError = undefined;
    this.closeAction = undefined;

    const options: WorkbenchMessageBoxLegacyOptions = {
      title: this.form.controls.title.value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
      content: this.form.controls.content.value.replace(/\\n/g, '\n'), // restore line breaks as sanitized by the user agent
      cssClass: this.form.controls.cssClass.value,
    };

    this._intentClient.request$<string>({type: WorkbenchCapabilities.MessageBox}, options)
      .pipe(mapToBody())
      .subscribe({
        next: closeAction => this.closeAction = closeAction,
        error: error => this.openError = stringifyError(error),
      });
  }
}
