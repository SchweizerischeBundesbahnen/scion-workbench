/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, InjectionToken, Injector} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchPart, WorkbenchService} from '@scion/workbench';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {ComponentPortal} from '@angular/cdk/portal';
import {undefinedIfEmpty} from '../../common/undefined-if-empty.util';
import {stringifyError} from '../../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {Arrays} from '@scion/toolkit/util';
import {SettingsService} from '../../settings.service';
import {CssClassComponent} from '../../css-class/css-class.component';

@Component({
  selector: 'app-register-part-action-page',
  templateUrl: './register-part-action-page.component.html',
  styleUrls: ['./register-part-action-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
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

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _settingsService: SettingsService,
              public workbenchService: WorkbenchService) {
  }

  public onRegister(): void {
    this.registerError = undefined;
    // Capture form values, since the `canMatch` function is evaluated independently of the form life-cycle
    const canMatchPartIds = undefinedIfEmpty(this.form.controls.canMatch.controls.part.value.split(/\s+/).filter(Boolean));
    const canMatchViewIds = undefinedIfEmpty(this.form.controls.canMatch.controls.view.value.split(/\s+/).filter(Boolean));
    const canMatchGrid = this.form.controls.canMatch.controls.grid.value || undefined;
    try {
      this.workbenchService.registerPartAction({
        portal: new ComponentPortal(TextComponent, undefined, Injector.create({
          providers: [
            {provide: TextComponent.TEXT, useValue: this.form.controls.content.value},
          ],
        })),
        align: this.form.controls.align.value || undefined,
        canMatch: ((part: WorkbenchPart) => {
          if (canMatchPartIds && !Arrays.coerce(canMatchPartIds).includes(part.id)) {
            return false;
          }
          if (canMatchViewIds && (!part.activeViewId || !Arrays.coerce(canMatchViewIds).includes(part.activeViewId))) {
            return false;
          }
          if (canMatchGrid && canMatchGrid !== (part.isInMainArea ? 'mainArea' : 'workbench')) {
            return false;
          }
          return true;
        }),
        cssClass: this.form.controls.cssClass.value,
      });
      this.registerError = false;
      this.resetForm();
    }
    catch (error: unknown) {
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
  template: '{{text}}',
  standalone: true,
})
class TextComponent {

  public static readonly TEXT = new InjectionToken<string>('TEXT');

  public readonly text = inject(TextComponent.TEXT);
}
