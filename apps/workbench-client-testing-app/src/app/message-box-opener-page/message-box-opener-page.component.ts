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
import {ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {WorkbenchMessageBoxService, WorkbenchView} from '@scion/workbench-client';
import {SciParamsEnterComponent, SciParamsEnterModule} from '@scion/components.internal/params-enter';
import {Beans} from '@scion/toolkit/bean-manager';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {NgIf} from '@angular/common';

const QUALIFIER = 'qualifier';
const PARAMS = 'params';
const TITLE = 'title';
const CONTENT = 'content';
const ACTIONS = 'actions';
const SEVERITY = 'severity';
const MODALITY = 'modality';
const CONTENT_SELECTABLE = 'contentSelectable';
const CSS_CLASS = 'cssClass';
const VIEW_CONTEXT = 'viewContext';

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

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly ACTIONS = ACTIONS;
  public readonly SEVERITY = SEVERITY;
  public readonly MODALITY = MODALITY;
  public readonly CONTENT_SELECTABLE = CONTENT_SELECTABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly VIEW_CONTEXT = VIEW_CONTEXT;

  public form: UntypedFormGroup;

  public openError: string;
  public closeAction: string;

  constructor(formBuilder: UntypedFormBuilder, private _messageBoxService: WorkbenchMessageBoxService) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [PARAMS]: formBuilder.array([]),
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [ACTIONS]: formBuilder.array([]),
      [SEVERITY]: formBuilder.control(''),
      [MODALITY]: formBuilder.control(''),
      [CONTENT_SELECTABLE]: formBuilder.control(true),
      [CSS_CLASS]: formBuilder.control(''),
      [VIEW_CONTEXT]: formBuilder.control(true),
    });
  }

  public onMessageBoxOpen(): void {
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);
    const actions = SciParamsEnterComponent.toParamsDictionary(this.form.get(ACTIONS) as UntypedFormArray);

    this.openError = null;
    this.closeAction = null;

    const currentView = Beans.get(WorkbenchView);
    const unsetViewContext = (this.form.get(VIEW_CONTEXT).value === false);

    unsetViewContext && Beans.register(WorkbenchView, {useValue: null});
    try {
      this._messageBoxService.open({
        title: this.form.get(TITLE).value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
        content: this.form.get(CONTENT).value.replace(/\\n/g, '\n') || undefined, // restore line breaks as sanitized by the user agent
        params,
        actions,
        severity: this.form.get(SEVERITY).value || undefined,
        modality: this.form.get(MODALITY).value || undefined,
        contentSelectable: this.form.get(CONTENT_SELECTABLE).value || undefined,
        cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
      }, qualifier)
        .then(closeAction => this.closeAction = closeAction)
        .catch(error => this.openError = error);
    }
    finally {
      unsetViewContext && Beans.register(WorkbenchView, {useValue: currentView});
    }
  }
}
