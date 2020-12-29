/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MessageBoxService, WorkbenchView } from '@scion/workbench';
import { ActivatedRoute } from '@angular/router';
import { SciParamsEnterComponent } from '@scion/toolkit.internal/widgets';

const TITLE = 'title';
const CONTENT = 'content';
const SEVERITY = 'severity';
const MODALITY = 'modality';
const CONTENT_SELECTABLE = 'contentSelectable';
const CSS_CLASS = 'cssClass';
const ACTIONS = 'actions';

@Component({
  selector: 'app-messagebox-page',
  templateUrl: './messagebox-page.component.html',
  styleUrls: ['./messagebox-page.component.scss'],
})
export class MessageboxPageComponent {

  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly SEVERITY = SEVERITY;
  public readonly MODALITY = MODALITY;
  public readonly CONTENT_SELECTABLE = CONTENT_SELECTABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly ACTIONS = ACTIONS;

  public form: FormGroup;
  public action: string;

  constructor(formBuilder: FormBuilder,
              route: ActivatedRoute,
              view: WorkbenchView,
              private _messageBoxService: MessageBoxService) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];
    view.cssClass = route.snapshot.data['cssClass'];

    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [MODALITY]: formBuilder.control(''),
      [CONTENT_SELECTABLE]: formBuilder.control(false),
      [CSS_CLASS]: formBuilder.control(''),
      [ACTIONS]: formBuilder.array([]),
    });
  }

  public async onOpen(): Promise<void> {
    this.action = await this._messageBoxService.open({
      title: this.form.get(TITLE).value || undefined,
      content: this.form.get(CONTENT).value || undefined,
      severity: this.form.get(SEVERITY).value || undefined,
      modality: this.form.get(MODALITY).value || undefined,
      contentSelectable: this.form.get(CONTENT_SELECTABLE).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
      actions: SciParamsEnterComponent.toParamsDictionary(this.form.get(ACTIONS) as FormArray) || undefined,
    });
  }
}
