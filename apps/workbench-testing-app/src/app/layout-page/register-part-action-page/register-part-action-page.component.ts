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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchService} from '@scion/workbench';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {ComponentPortal} from '@angular/cdk/portal';
import {undefinedIfEmpty} from '../../common/undefined-if-empty.util';

const CONTENT = 'content';
const ALIGN = 'align';
const CSS_CLASS = 'cssClass';
const TARGET = 'target';
const VIEW = 'view';
const PART = 'part';
const AREA = 'area';

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
    SciFormFieldModule,
  ],
})
export default class RegisterPartActionPageComponent {

  public readonly CONTENT = CONTENT;
  public readonly ALIGN = ALIGN;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly TARGET = TARGET;
  public readonly VIEW = VIEW;
  public readonly PART = PART;
  public readonly AREA = AREA;

  public form: FormGroup;
  public registerError: string | false | undefined;

  constructor(formBuilder: NonNullableFormBuilder, public workbenchService: WorkbenchService) {
    this.form = formBuilder.group({
      [CONTENT]: formBuilder.control('', {validators: Validators.required}),
      [ALIGN]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [TARGET]: formBuilder.group({
        [VIEW]: formBuilder.control(''),
        [PART]: formBuilder.control(''),
        [AREA]: formBuilder.control(''),
      }),
    });
  }

  public onRegister(): void {
    this.registerError = undefined;
    try {
      this.workbenchService.registerPartAction({
        portal: new ComponentPortal(TextComponent, undefined, Injector.create({
          providers: [
            {provide: TextComponent.TEXT, useValue: this.form.get(CONTENT).value},
          ],
        })),
        align: this.form.get(ALIGN).value || undefined,
        target: {
          viewId: undefinedIfEmpty(this.form.get([TARGET, VIEW]).value.split(/\s+/).filter(Boolean)),
          partId: undefinedIfEmpty(this.form.get([TARGET, PART]).value.split(/\s+/).filter(Boolean)),
          area: this.form.get([TARGET, AREA]).value || undefined,
        },
        cssClass: undefinedIfEmpty(this.form.get(CSS_CLASS).value.split(/\s+/).filter(Boolean)),
      });
      this.registerError = false;
      this.form.reset();
    }
    catch (error) {
      this.registerError = error;
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
