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
import {WorkbenchService} from '@scion/workbench';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {ComponentPortal} from '@angular/cdk/portal';
import {undefinedIfEmpty} from '../../common/undefined-if-empty.util';
import {stringifyError} from '../../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

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
  ],
})
export default class RegisterPartActionPageComponent {

  public form = this._formBuilder.group({
    content: this._formBuilder.control('', {validators: Validators.required}),
    align: this._formBuilder.control<'start' | 'end' | ''>(''),
    cssClass: this._formBuilder.control(''),
    target: this._formBuilder.group({
      view: this._formBuilder.control(''),
      part: this._formBuilder.control(''),
      area: this._formBuilder.control<'main' | 'peripheral' | ''>(''),
    }),
  });
  public registerError: string | false | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder, public workbenchService: WorkbenchService) {
  }

  public onRegister(): void {
    this.registerError = undefined;
    try {
      this.workbenchService.registerPartAction({
        portal: new ComponentPortal(TextComponent, undefined, Injector.create({
          providers: [
            {provide: TextComponent.TEXT, useValue: this.form.controls.content},
          ],
        })),
        align: this.form.controls.align.value || undefined,
        target: {
          viewId: undefinedIfEmpty(this.form.controls.target.controls.view.value.split(/\s+/).filter(Boolean)),
          partId: undefinedIfEmpty(this.form.controls.target.controls.part.value.split(/\s+/).filter(Boolean)),
          area: this.form.controls.target.controls.area.value || undefined,
        },
        cssClass: this.form.controls.cssClass.value.split(/\s+/).filter(Boolean),
      });
      this.registerError = false;
      this.form.reset();
    }
    catch (error: unknown) {
      this.registerError = stringifyError(error);
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
