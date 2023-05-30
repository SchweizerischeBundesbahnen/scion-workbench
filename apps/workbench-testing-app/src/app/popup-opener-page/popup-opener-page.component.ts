/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, Type, ViewChild} from '@angular/core';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CloseStrategy, PopupService, PopupSize} from '@scion/workbench';
import {PopupPageComponent} from '../popup-page/popup-page.component';
import {FocusTestPageComponent} from '../test-pages/focus-test-page/focus-test-page.component';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import BlankTestPageComponent from '../test-pages/blank-test-page/blank-test-page.component';
import {PopupOrigin} from '@scion/workbench-client';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {NgIf} from '@angular/common';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {PopupPositionLabelPipe} from './popup-position-label.pipe';

const POPUP_COMPONENT = 'popupComponent';
const ANCHOR = 'anchor';
const POSITION = 'position';
const CONTEXTUAL_VIEW_ID = 'contextualViewId';
const ALIGN = 'align';
const INPUT = 'input';
const CSS_CLASS = 'cssClass';
const CLOSE_STRATEGY = 'closeStrategy';
const ON_FOCUS_LOST = 'onFocusLost';
const ON_ESCAPE = 'onEscape';
const SIZE = 'size';
const MIN_HEIGHT = 'minHeight';
const HEIGHT = 'height';
const MAX_HEIGHT = 'maxHeight';
const MIN_WIDTH = 'minWidth';
const WIDTH = 'width';
const MAX_WIDTH = 'maxWidth';
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
    SciAccordionModule,
    SciCheckboxModule,
    PopupPositionLabelPipe,
  ],
})
export default class PopupOpenerPageComponent {

  public readonly POPUP_COMPONENT = POPUP_COMPONENT;
  public readonly ANCHOR = ANCHOR;
  public readonly POSITION = POSITION;
  public readonly CONTEXTUAL_VIEW_ID = CONTEXTUAL_VIEW_ID;
  public readonly ALIGN = ALIGN;
  public readonly INPUT = INPUT;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly CLOSE_STRATEGY = CLOSE_STRATEGY;
  public readonly ON_FOCUS_LOST = ON_FOCUS_LOST;
  public readonly ON_ESCAPE = ON_ESCAPE;
  public readonly SIZE = SIZE;
  public readonly MIN_HEIGHT = MIN_HEIGHT;
  public readonly HEIGHT = HEIGHT;
  public readonly MAX_HEIGHT = MAX_HEIGHT;
  public readonly MIN_WIDTH = MIN_WIDTH;
  public readonly WIDTH = WIDTH;
  public readonly MAX_WIDTH = MAX_WIDTH;
  public readonly VERTICAL_POSITION = VERTICAL_POSITION;
  public readonly HORIZONTAL_POSITION = HORIZONTAL_POSITION;

  private _popupOrigin$: Observable<PopupOrigin | null>;

  public form: UntypedFormGroup;

  public popupError: string;
  public returnValue: string;

  @ViewChild('open_button', {static: true})
  private _openButton: ElementRef<HTMLButtonElement>;

  constructor(private _popupService: PopupService, formBuilder: UntypedFormBuilder) {
    this.form = formBuilder.group({
      [POPUP_COMPONENT]: formBuilder.control('popup-page', Validators.required),
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
      [INPUT]: formBuilder.control(''),
      [CLOSE_STRATEGY]: formBuilder.group({
        [ON_FOCUS_LOST]: formBuilder.control(true),
        [ON_ESCAPE]: formBuilder.control(true),
      }),
      [SIZE]: formBuilder.group({
        [MIN_HEIGHT]: formBuilder.control(''),
        [HEIGHT]: formBuilder.control(''),
        [MAX_HEIGHT]: formBuilder.control(''),
        [MIN_WIDTH]: formBuilder.control(''),
        [WIDTH]: formBuilder.control(''),
        [MAX_WIDTH]: formBuilder.control(''),
      }),
    });
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  public async onOpen(): Promise<void> {
    this.popupError = null;
    this.returnValue = null;

    await this._popupService.open<string>({
      component: this.parsePopupComponentInput(),
      input: this.form.get(INPUT).value || undefined,
      anchor: this.form.get([ANCHOR, POSITION]).value === 'element' ? this._openButton : this._popupOrigin$,
      align: this.form.get(ALIGN).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: this.form.get([CLOSE_STRATEGY, ON_FOCUS_LOST]).value ?? undefined,
        onEscape: this.form.get([CLOSE_STRATEGY, ON_ESCAPE]).value ?? undefined,
      }),
      size: undefinedIfEmpty<PopupSize>({
        width: this.form.get([SIZE, WIDTH]).value || undefined,
        height: this.form.get([SIZE, HEIGHT]).value || undefined,
        minWidth: this.form.get([SIZE, MIN_WIDTH]).value || undefined,
        maxWidth: this.form.get([SIZE, MAX_WIDTH]).value || undefined,
        minHeight: this.form.get([SIZE, MIN_HEIGHT]).value || undefined,
        maxHeight: this.form.get([SIZE, MAX_HEIGHT]).value || undefined,
      }),
      context: {
        viewId: this.parseContextualViewIdInput(),
      },
    })
      .then(result => this.returnValue = result)
      .catch((error: Error) => this.popupError = error.message ?? 'Popup was closed with an error');
  }

  private parsePopupComponentInput(): Type<any> {
    switch (this.form.get(POPUP_COMPONENT).value) {
      case 'popup-page':
        return PopupPageComponent;
      case 'focus-test-page':
        return FocusTestPageComponent;
      case 'blank-test-page':
        return BlankTestPageComponent;
      default:
        throw Error(`[IllegalPopupComponent] Popup component not supported: ${this.form.get(POPUP_COMPONENT).value}`);
    }
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
