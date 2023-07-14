/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {WorkbenchMessageBoxService, WorkbenchView} from '@scion/workbench-client';
import {SciParamsEnterComponent, SciParamsEnterModule} from '@scion/components.internal/params-enter';
import {Beans} from '@scion/toolkit/bean-manager';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {NgIf} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';

@Component({
  selector: 'app-message-box-opener-page',
  templateUrl: './message-box-opener-page.component.html',
  styleUrls: ['./message-box-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldModule,
    SciParamsEnterModule,
    SciCheckboxModule,
  ],
})
export default class MessageBoxOpenerPageComponent {

  public form = this._formBuilder.group({
    qualifier: this._formBuilder.array([]),
    params: this._formBuilder.array([]),
    title: this._formBuilder.control(''),
    content: this._formBuilder.control(''),
    actions: this._formBuilder.array([]),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
    modality: this._formBuilder.control<'application' | 'view' | ''>(''),
    contentSelectable: this._formBuilder.control(true),
    cssClass: this._formBuilder.control(''),
    viewContext: this._formBuilder.control(true),
  });

  public openError: string | undefined;
  public closeAction: string | undefined;

  constructor(private _messageBoxService: WorkbenchMessageBoxService, private _formBuilder: NonNullableFormBuilder) {
  }

  public onMessageBoxOpen(): void {
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.controls.qualifier);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.controls.params);
    const actions = SciParamsEnterComponent.toParamsDictionary(this.form.controls.actions);

    this.openError = undefined;
    this.closeAction = undefined;

    const currentView = Beans.get(WorkbenchView);
    const unsetViewContext = !this.form.controls.viewContext.value;

    unsetViewContext && Beans.register(WorkbenchView, {useValue: null});
    try {
      this._messageBoxService.open({
        title: this.form.controls.title.value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
        content: this.form.controls.content.value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
        params: params ?? undefined,
        actions: actions ?? undefined,
        severity: this.form.controls.severity.value || undefined,
        modality: this.form.controls.modality.value || undefined,
        contentSelectable: this.form.controls.contentSelectable.value || undefined,
        cssClass: this.form.controls.cssClass.value.split(/\s+/).filter(Boolean),
      }, qualifier ?? undefined)
        .then(closeAction => this.closeAction = closeAction)
        .catch(error => this.openError = stringifyError(error));
    }
    finally {
      unsetViewContext && Beans.register(WorkbenchView, {useValue: currentView});
    }
  }
}
