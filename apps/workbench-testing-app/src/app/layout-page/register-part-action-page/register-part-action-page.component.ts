/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, input} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchPart, WorkbenchService} from '@scion/workbench';
import {undefinedIfEmpty} from '../../common/undefined-if-empty.util';
import {stringifyError} from '../../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SettingsService} from '../../settings.service';
import {CssClassComponent} from '../../css-class/css-class.component';
import {UUID} from '@scion/toolkit/uuid';
import {Arrays} from '@scion/toolkit/util';

@Component({
  selector: 'app-register-part-action-page',
  templateUrl: './register-part-action-page.component.html',
  styleUrls: ['./register-part-action-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    CssClassComponent,
  ],
})
export default class RegisterPartActionPageComponent {

  public form = this._formBuilder.group({
    content: this._formBuilder.control('', {validators: Validators.required}),
    align: this._formBuilder.control<'start' | 'end' | ''>(''),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    canMatch: this._formBuilder.group({
      view: this._formBuilder.control(''),
      part: this._formBuilder.control(''),
      grid: this._formBuilder.control<'workbench' | 'mainArea' | ''>(''),
    }),
  });
  public registerError: string | false | undefined;

  protected viewList = `view-list-${UUID.randomUUID()}`;
  protected partList = `part-list-${UUID.randomUUID()}`;
  protected gridList = `grid-list-${UUID.randomUUID()}`;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              public workbenchService: WorkbenchService) {
  }

  public onRegister(): void {
    this.registerError = undefined;
    // Capture form values because the action will be constructed asynchronously.
    const canMatchPartIds = undefinedIfEmpty(this.form.controls.canMatch.controls.part.value.split(/\s+/).filter(Boolean));
    const canMatchViewIds = undefinedIfEmpty(this.form.controls.canMatch.controls.view.value.split(/\s+/).filter(Boolean));
    const canMatchGrid = this.form.controls.canMatch.controls.grid.value || undefined;
    const content = this.form.controls.content.value;
    const align = this.form.controls.align.value || undefined;
    const cssClass = this.form.controls.cssClass.value;

    const matchesContext = (part: WorkbenchPart): boolean => {
      if (canMatchPartIds && !Arrays.coerce(canMatchPartIds).includes(part.id)) {
        return false;
      }
      if (canMatchViewIds && (!part.activeViewId() || !Arrays.coerce(canMatchViewIds).includes(part.activeViewId()!))) {
        return false;
      }
      if (canMatchGrid && canMatchGrid !== (part.isInMainArea ? 'mainArea' : 'workbench')) {
        return false;
      }
      return true;
    };

    try {
      this.workbenchService.registerPartAction(part => matchesContext(part) ? {content: TextComponent, inputs: {text: content}, align, cssClass} : null);
      this.registerError = false;
      this.resetForm();
    }
    catch (error) {
      this.registerError = stringifyError(error);
    }
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
    }
  }
}

@Component({
  selector: 'app-text',
  template: '{{text()}}',
})
class TextComponent {

  public readonly text = input.required<string>();
}
