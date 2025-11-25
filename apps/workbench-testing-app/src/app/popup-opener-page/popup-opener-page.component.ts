/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, Type, viewChild} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DialogId, PartId, PopupId, PopupOrigin, PopupService, ViewId, WorkbenchPopupService} from '@scion/workbench';
import {PopupPageComponent} from '../popup-page/popup-page.component';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import BlankTestPageComponent from '../test-pages/blank-test-page/blank-test-page.component';
import {PopupPositionLabelPipe, Position} from './popup-position-label.pipe';
import {stringifyError} from '../common/stringify-error.util';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import InputFieldTestPageComponent from '../test-pages/input-field-test-page/input-field-test-page.component';
import DialogOpenerPageComponent from '../dialog-opener-page/dialog-opener-page.component';
import {parseTypedString} from '../common/parse-typed-value.util';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import SizeTestPageComponent from '../test-pages/size-test-page/size-test-page.component';
import {UUID} from '@scion/toolkit/uuid';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {prune} from '../common/prune.util';
import {PopupSizeDirective} from './popup-size.directive';

@Component({
  selector: 'app-popup-opener-page',
  templateUrl: './popup-opener-page.component.html',
  styleUrl: './popup-opener-page.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciCheckboxComponent,
    PopupPositionLabelPipe,
    MultiValueInputComponent,
    SciKeyValueFieldComponent,
  ],
  hostDirectives: [{directive: PopupSizeDirective, inputs: ['size']}],
})
export default class PopupOpenerPageComponent {

  private readonly _popupService = inject(WorkbenchPopupService);
  private readonly _legacyPopupService = inject(PopupService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _openButton = viewChild.required<ElementRef<HTMLButtonElement>>('open_button');
  private readonly _popupOrigin$: Observable<PopupOrigin>;

  protected readonly form = this._formBuilder.group({
    component: this._formBuilder.control('popup-page', Validators.required),
    options: this._formBuilder.group({
      anchor: this._formBuilder.group({
        position: this._formBuilder.control<Position | 'element'>('element', Validators.required),
        verticalPosition: this._formBuilder.control(0, Validators.required),
        horizontalPosition: this._formBuilder.control(0, Validators.required),
        width: this._formBuilder.control<number | undefined>(undefined),
        height: this._formBuilder.control<number | undefined>(undefined),
      }),
      align: this._formBuilder.control<'east' | 'west' | 'north' | 'south' | ''>(''),
      inputs: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      inputLegacy: this._formBuilder.control(''),
      context: this._formBuilder.control<ViewId | PartId | DialogId | PopupId | '<null>' | ''>(''),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
      closeStrategy: this._formBuilder.group({
        onFocusLost: this._formBuilder.control(true),
        onEscape: this._formBuilder.control(true),
      }),
    }),
    size: this._formBuilder.group({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    legacyAPI: this._formBuilder.control(false),
  });

  protected popupError: string | undefined;
  protected returnValue: string | undefined;

  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  constructor() {
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  protected async onOpen(): Promise<void> {
    this.popupError = undefined;
    this.returnValue = undefined;

    if (this.form.controls.legacyAPI.value) {
      const options = this.form.controls.options.controls;
      await this._legacyPopupService.open<string>(prune({
        component: this.readComponentFromUI(),
        input: options.inputLegacy.value || undefined,
        anchor: options.anchor.controls.position.value === 'element' ? this._openButton() : this._popupOrigin$,
        align: options.align.value || undefined,
        cssClass: options.cssClass.value,
        closeStrategy: {
          onFocusLost: options.closeStrategy.controls.onFocusLost.value,
          onEscape: options.closeStrategy.controls.onEscape.value,
        },
        size: {
          width: this.form.controls.size.controls.width.value || undefined,
          height: this.form.controls.size.controls.height.value || undefined,
          minWidth: this.form.controls.size.controls.minWidth.value || undefined,
          maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
          minHeight: this.form.controls.size.controls.minHeight.value || undefined,
          maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
        },
        context: parseTypedString(options.context.value, {undefinedIfEmpty: true}),
      }, {pruneIfEmpty: true})!)
        .then(result => this.returnValue = result)
        .catch((error: unknown) => this.popupError = stringifyError(error) || 'Workbench Popup was closed with an error');
    }
    else {
      const component = this.readComponentFromUI();
      const options = this.form.controls.options.controls;
      await this._popupService.open<string>(component, prune({
        inputs: {
          ...SciKeyValueFieldComponent.toDictionary(options.inputs, false),
          size: {
            width: this.form.controls.size.controls.width.value || undefined,
            height: this.form.controls.size.controls.height.value || undefined,
            minWidth: this.form.controls.size.controls.minWidth.value || undefined,
            maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
            minHeight: this.form.controls.size.controls.minHeight.value || undefined,
            maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
          },
        },
        anchor: options.anchor.controls.position.value === 'element' ? this._openButton() : this._popupOrigin$,
        align: options.align.value || undefined,
        cssClass: options.cssClass.value,
        closeStrategy: {
          onFocusLost: options.closeStrategy.controls.onFocusLost.value,
          onEscape: options.closeStrategy.controls.onEscape.value,
        },
        context: parseTypedString(options.context.value, {undefinedIfEmpty: true}),
      }, {pruneIfEmpty: true})!)
        .then(result => this.returnValue = result)
        .catch((error: unknown) => this.popupError = stringifyError(error) || 'Workbench Popup was closed with an error');
    }
  }

  private readComponentFromUI(): Type<PopupPageComponent | FocusTestPageComponent | BlankTestPageComponent> {
    switch (this.form.controls.component.value) {
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
        throw Error(`[IllegalPopupComponent] Popup component not supported: ${this.form.controls.component.value}`);
    }
  }

  private observePopupOrigin$(): Observable<PopupOrigin> {
    return this.form.controls.options.controls.anchor.valueChanges
      .pipe(
        startWith(undefined as void),
        map((): PopupOrigin => {
          const anchor = this.form.controls.options.controls.anchor.controls;
          switch (anchor.position.value) {
            case 'top-left':
              return {
                top: anchor.verticalPosition.value,
                left: anchor.horizontalPosition.value,
                width: anchor.width.value,
                height: anchor.height.value,
              };
            case 'top-right':
              return {
                top: anchor.verticalPosition.value,
                right: anchor.horizontalPosition.value,
                width: anchor.width.value,
                height: anchor.height.value,
              };
            case 'bottom-left':
              return {
                bottom: anchor.verticalPosition.value,
                left: anchor.horizontalPosition.value,
                width: anchor.width.value,
                height: anchor.height.value,
              };
            case 'bottom-right':
              return {
                bottom: anchor.verticalPosition.value,
                right: anchor.horizontalPosition.value,
                width: anchor.width.value,
                height: anchor.height.value,
              };
            case 'point':
              return {
                x: anchor.horizontalPosition.value,
                y: anchor.verticalPosition.value,
                width: anchor.width.value,
                height: anchor.height.value,
              };
            default: {
              throw Error(`Invalid popup origin specified: ${anchor.position.value}`);
            }
          }
        }),
      );
  }
}
