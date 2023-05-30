/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {ReactiveFormsModule, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {CloseStrategy, PopupOrigin, WorkbenchPopupService} from '@scion/workbench-client';
import {SciParamsEnterComponent, SciParamsEnterModule} from '@scion/components.internal/params-enter';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {PopupPositionLabelPipe} from './popup-position-label.pipe';
import {NgIf} from '@angular/common';

const QUALIFIER = 'qualifier';
const PARAMS = 'params';
const ANCHOR = 'anchor';
const POSITION = 'position';
const CONTEXTUAL_VIEW_ID = 'contextualViewId';
const ALIGN = 'align';
const CSS_CLASS = 'cssClass';
const CLOSE_STRATEGY = 'closeStrategy';
const ON_FOCUS_LOST = 'onFocusLost';
const ON_ESCAPE = 'onEscape';
const HEIGHT = 'height';
const WIDTH = 'width';
const HORIZONTAL_POSITION = 'horizontalPosition';
const VERTICAL_POSITION = 'verticalPosition';

@Component({
  selector: 'app-popup-opener-page',
  templateUrl: './popup-opener-page.component.html',
  styleUrls: ['./popup-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldModule,
    SciParamsEnterModule,
    SciAccordionModule,
    SciCheckboxModule,
    PopupPositionLabelPipe,
  ],
})
export default class PopupOpenerPageComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly ANCHOR = ANCHOR;
  public readonly POSITION = POSITION;
  public readonly CONTEXTUAL_VIEW_ID = CONTEXTUAL_VIEW_ID;
  public readonly ALIGN = ALIGN;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly CLOSE_STRATEGY = CLOSE_STRATEGY;
  public readonly ON_FOCUS_LOST = ON_FOCUS_LOST;
  public readonly ON_ESCAPE = ON_ESCAPE;
  public readonly HEIGHT = HEIGHT;
  public readonly WIDTH = WIDTH;
  public readonly VERTICAL_POSITION = VERTICAL_POSITION;
  public readonly HORIZONTAL_POSITION = HORIZONTAL_POSITION;

  private _popupOrigin$: Observable<PopupOrigin | null>;

  public form: UntypedFormGroup;

  public popupError: string;
  public returnValue: string;

  @ViewChild('open_button', {static: true})
  private _openButton: ElementRef<HTMLButtonElement>;

  constructor(private _popupService: WorkbenchPopupService, formBuilder: UntypedFormBuilder) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([
        new UntypedFormGroup({
          paramName: new UntypedFormControl('component'),
          paramValue: new UntypedFormControl('popup'),
        }),
        new UntypedFormGroup({
            paramName: new UntypedFormControl('app'),
            paramValue: new UntypedFormControl('app1'),
          },
        )], Validators.required),
      [PARAMS]: formBuilder.array([]),
      [ANCHOR]: formBuilder.group({
        [POSITION]: formBuilder.control('element', Validators.required),
        [VERTICAL_POSITION]: formBuilder.control(0, Validators.required),
        [HORIZONTAL_POSITION]: formBuilder.control(0, Validators.required),
        [WIDTH]: formBuilder.control(undefined),
        [HEIGHT]: formBuilder.control(undefined),
      }),
      [CONTEXTUAL_VIEW_ID]: formBuilder.control('<default>', Validators.required),
      [ALIGN]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [CLOSE_STRATEGY]: formBuilder.group({
        [ON_FOCUS_LOST]: formBuilder.control(true),
        [ON_ESCAPE]: formBuilder.control(true),
      }),
    });
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  public async onPopupOpen(): Promise<void> {
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);

    this.popupError = null;
    this.returnValue = null;

    await this._popupService.open<string>(qualifier, {
      params,
      anchor: this.form.get([ANCHOR, POSITION]).value === 'element' ? this._openButton.nativeElement : this._popupOrigin$,
      align: this.form.get(ALIGN).value || undefined,
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: this.form.get([CLOSE_STRATEGY, ON_FOCUS_LOST]).value ?? undefined,
        onEscape: this.form.get([CLOSE_STRATEGY, ON_ESCAPE]).value ?? undefined,
      }),
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
      context: {
        viewId: this.parseContextualViewIdInput(),
      },
    })
      .then(result => this.returnValue = result)
      .catch(error => this.popupError = error ?? 'Popup was closed with an error');
  }

  private parseContextualViewIdInput(): string | null | undefined {
    const viewId = this.form.get(CONTEXTUAL_VIEW_ID).value;
    switch (viewId) {
      case '<default>':
        return undefined;
      case '<null>':
        return null;
      default:
        return viewId;
    }
  }

  private observePopupOrigin$(): Observable<PopupOrigin | null> {
    return this.form.get(ANCHOR).valueChanges
      .pipe(
        startWith(undefined as void),
        map((): PopupOrigin | null => {
          switch (this.form.get([ANCHOR, POSITION]).value) {
            case 'top-left':
              return {
                top: this.form.get([ANCHOR, VERTICAL_POSITION]).value,
                left: this.form.get([ANCHOR, HORIZONTAL_POSITION]).value,
                width: this.form.get([ANCHOR, WIDTH]).value,
                height: this.form.get([ANCHOR, HEIGHT]).value,
              };
            case 'top-right':
              return {
                top: this.form.get([ANCHOR, VERTICAL_POSITION]).value,
                right: this.form.get([ANCHOR, HORIZONTAL_POSITION]).value,
                width: this.form.get([ANCHOR, WIDTH]).value,
                height: this.form.get([ANCHOR, HEIGHT]).value,
              };
            case 'bottom-left':
              return {
                bottom: this.form.get([ANCHOR, VERTICAL_POSITION]).value,
                left: this.form.get([ANCHOR, HORIZONTAL_POSITION]).value,
                width: this.form.get([ANCHOR, WIDTH]).value,
                height: this.form.get([ANCHOR, HEIGHT]).value,
              };
            case 'bottom-right':
              return {
                bottom: this.form.get([ANCHOR, VERTICAL_POSITION]).value,
                right: this.form.get([ANCHOR, HORIZONTAL_POSITION]).value,
                width: this.form.get([ANCHOR, WIDTH]).value,
                height: this.form.get([ANCHOR, HEIGHT]).value,
              };
            case 'point':
              return {
                x: this.form.get([ANCHOR, HORIZONTAL_POSITION]).value,
                y: this.form.get([ANCHOR, VERTICAL_POSITION]).value,
                width: this.form.get([ANCHOR, WIDTH]).value,
                height: this.form.get([ANCHOR, HEIGHT]).value,
              };
            default: {
              return null;
            }
          }
        }),
      );
  }
}
