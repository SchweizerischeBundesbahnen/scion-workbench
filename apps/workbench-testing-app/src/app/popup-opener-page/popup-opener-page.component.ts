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
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {PopupService, PopupSize, ViewId} from '@scion/workbench';
import {PopupPageComponent} from '../popup-page/popup-page.component';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import BlankTestPageComponent from '../test-pages/blank-test-page/blank-test-page.component';
import {PopupOrigin} from '@scion/workbench-client';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {PopupPositionLabelPipe, Position} from './popup-position-label.pipe';
import {stringifyError} from '../common/stringify-error.util';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import InputFieldTestPageComponent from '../test-pages/input-field-test-page/input-field-test-page.component';
import DialogOpenerPageComponent from '../dialog-opener-page/dialog-opener-page.component';
import {Dictionaries} from '@scion/toolkit/util';
import {parseTypedString} from '../common/parse-typed-value.util';
import {CssClassComponent} from '../css-class/css-class.component';
import SizeTestPageComponent from '../test-pages/size-test-page/size-test-page.component';

@Component({
  selector: 'app-popup-opener-page',
  templateUrl: './popup-opener-page.component.html',
  styleUrls: ['./popup-opener-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciCheckboxComponent,
    PopupPositionLabelPipe,
    CssClassComponent,
  ],
})
export default class PopupOpenerPageComponent {

  private _popupOrigin$: Observable<PopupOrigin>;

  public form = this._formBuilder.group({
    popupComponent: this._formBuilder.control('popup-page', Validators.required),
    anchor: this._formBuilder.group({
      position: this._formBuilder.control<Position | 'element'>('element', Validators.required),
      verticalPosition: this._formBuilder.control(0, Validators.required),
      horizontalPosition: this._formBuilder.control(0, Validators.required),
      width: this._formBuilder.control<number | undefined>(undefined),
      height: this._formBuilder.control<number | undefined>(undefined),
    }),
    contextualViewId: this._formBuilder.control<ViewId | ''>(''),
    align: this._formBuilder.control<'east' | 'west' | 'north' | 'south' | ''>(''),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    input: this._formBuilder.control(''),
    closeStrategy: this._formBuilder.group({
      onFocusLost: this._formBuilder.control(true),
      onEscape: this._formBuilder.control(true),
    }),
    size: this._formBuilder.group({
      minHeight: this._formBuilder.control(''),
      height: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
  });

  public popupError: string | undefined;
  public returnValue: string | undefined;

  @ViewChild('open_button', {static: true})
  private _openButton!: ElementRef<HTMLButtonElement>;

  constructor(private _popupService: PopupService, private _formBuilder: NonNullableFormBuilder) {
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  public async onOpen(): Promise<void> {
    this.popupError = undefined;
    this.returnValue = undefined;

    await this._popupService.open<string>({
      component: this.parsePopupComponentInput(),
      input: this.form.controls.input.value || undefined,
      anchor: this.form.controls.anchor.controls.position.value === 'element' ? this._openButton : this._popupOrigin$,
      align: this.form.controls.align.value || undefined,
      cssClass: this.form.controls.cssClass.value,
      closeStrategy: {
        onFocusLost: this.form.controls.closeStrategy.controls.onFocusLost.value,
        onEscape: this.form.controls.closeStrategy.controls.onEscape.value,
      },
      size: undefinedIfEmpty(Dictionaries.withoutUndefinedEntries({
        width: this.form.controls.size.controls.width.value || undefined,
        height: this.form.controls.size.controls.height.value || undefined,
        minWidth: this.form.controls.size.controls.minWidth.value || undefined,
        maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
        minHeight: this.form.controls.size.controls.minHeight.value || undefined,
        maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
      } satisfies PopupSize)),
      context: {
        viewId: parseTypedString(this.form.controls.contextualViewId.value || undefined),
      },
    })
      .then(result => this.returnValue = result)
      .catch(error => this.popupError = stringifyError(error) || 'Workbench Popup was closed with an error');
  }

  private parsePopupComponentInput(): Type<PopupPageComponent | FocusTestPageComponent | BlankTestPageComponent> {
    switch (this.form.controls.popupComponent.value) {
      case 'popup-page':
        return PopupPageComponent;
      case 'focus-test-page':
        return FocusTestPageComponent;
      case 'blank-test-page':
        return BlankTestPageComponent;
      case 'input-field-test-page':
        return InputFieldTestPageComponent;
      case 'size-test-page':
        return SizeTestPageComponent;
      case 'dialog-opener-page':
        return DialogOpenerPageComponent;
      case 'popup-opener-page':
        return PopupOpenerPageComponent;
      default:
        throw Error(`[IllegalPopupComponent] Popup component not supported: ${this.form.controls.popupComponent.value}`);
    }
  }

  private observePopupOrigin$(): Observable<PopupOrigin> {
    return this.form.controls.anchor.valueChanges
      .pipe(
        startWith(undefined as void),
        map((): PopupOrigin => {
          switch (this.form.controls.anchor.controls.position.value) {
            case 'top-left':
              return {
                top: this.form.controls.anchor.controls.verticalPosition.value,
                left: this.form.controls.anchor.controls.horizontalPosition.value,
                width: this.form.controls.anchor.controls.width.value,
                height: this.form.controls.anchor.controls.height.value,
              };
            case 'top-right':
              return {
                top: this.form.controls.anchor.controls.verticalPosition.value,
                right: this.form.controls.anchor.controls.horizontalPosition.value,
                width: this.form.controls.anchor.controls.width.value,
                height: this.form.controls.anchor.controls.height.value,
              };
            case 'bottom-left':
              return {
                bottom: this.form.controls.anchor.controls.verticalPosition.value,
                left: this.form.controls.anchor.controls.horizontalPosition.value,
                width: this.form.controls.anchor.controls.width.value,
                height: this.form.controls.anchor.controls.height.value,
              };
            case 'bottom-right':
              return {
                bottom: this.form.controls.anchor.controls.verticalPosition.value,
                right: this.form.controls.anchor.controls.horizontalPosition.value,
                width: this.form.controls.anchor.controls.width.value,
                height: this.form.controls.anchor.controls.height.value,
              };
            case 'point':
              return {
                x: this.form.controls.anchor.controls.horizontalPosition.value,
                y: this.form.controls.anchor.controls.verticalPosition.value,
                width: this.form.controls.anchor.controls.width.value,
                height: this.form.controls.anchor.controls.height.value,
              };
            default: {
              throw Error(`Invalid popup origin specified: ${this.form.controls.anchor.controls.position.value}`);
            }
          }
        }),
      );
  }
}
