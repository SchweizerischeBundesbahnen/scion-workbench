/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SciParamsEnterComponent } from '@scion/app/common';
import { MessageBox, Qualifier } from '@scion/workbench-application-platform.api';
import { MessageBoxService } from '@scion/workbench-application.core';
import { CustomValidators } from '../custom-validators';

const QUALIFIER = 'qualifier';
const ACTIONS = 'actions';
const TITLE = 'title';
const TEXT = 'text';
const SEVERITY = 'severity';
const MODALITY = 'modality';
const CONTENT_SELECTABLE = 'content-selectable';
const CSS_CLASS = 'css-class';
const PAYLOAD = 'payload';

@Component({
  selector: 'app-message-box-panel',
  templateUrl: './message-box-panel.component.html',
  styleUrls: ['./message-box-panel.component.scss'],
})
export class MessageBoxPanelComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly ACTIONS = ACTIONS;
  public readonly TITLE = TITLE;
  public readonly TEXT = TEXT;
  public readonly SEVERITY = SEVERITY;
  public readonly MODALITY = MODALITY;
  public readonly CONTENT_SELECTABLE = CONTENT_SELECTABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly PAYLOAD = PAYLOAD;

  public form: FormGroup;
  public closeAction: string;

  constructor(formBuilder: FormBuilder, private _messageBoxService: MessageBoxService) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [ACTIONS]: formBuilder.array([], Validators.required),
      [TITLE]: formBuilder.control(null),
      [TEXT]: formBuilder.control(null),
      [SEVERITY]: formBuilder.control('info'),
      [MODALITY]: formBuilder.control('view'),
      [CONTENT_SELECTABLE]: formBuilder.control(false),
      [CSS_CLASS]: formBuilder.control([]),
      [PAYLOAD]: formBuilder.control(undefined, CustomValidators.json),
    });
  }

  public onOpen(): void {
    this.closeAction = null;

    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);
    const actions: { [key: string]: string } = SciParamsEnterComponent.toParams(this.form.get(ACTIONS) as FormArray);
    const messageBox: MessageBox = {
      title: this.form.get(TITLE).value,
      text: this.form.get(TEXT).value,
      severity: this.form.get(SEVERITY).value,
      modality: this.form.get(MODALITY).value,
      actions: actions,
      contentSelectable: this.form.get(CONTENT_SELECTABLE).value,
      cssClass: this.form.get(CSS_CLASS).value,
      payload: JSON.parse(this.form.get(PAYLOAD).value || null) || undefined,
    };

    this._messageBoxService.open(messageBox, Object.keys(qualifier).length && qualifier).then(action => {
      this.closeAction = action;
    });
  }
}
