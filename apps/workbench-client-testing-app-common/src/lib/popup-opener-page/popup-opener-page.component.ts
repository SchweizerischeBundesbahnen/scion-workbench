/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, viewChild} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CloseStrategy, DialogId, PartId, PopupId, PopupOrigin, ViewId, WORKBENCH_ELEMENT, WorkbenchElement, WorkbenchPopupService} from '@scion/workbench-client';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {PopupPositionLabelPipe, Position} from './popup-position-label.pipe';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {UUID} from '@scion/toolkit/uuid';
import {MultiValueInputComponent, parseTypedString, stringifyError, undefinedIfEmpty} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';

@Component({
  selector: 'app-popup-opener-page',
  templateUrl: './popup-opener-page.component.html',
  styleUrls: ['./popup-opener-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciCheckboxComponent,
    PopupPositionLabelPipe,
    MultiValueInputComponent,
  ],
})
export class PopupOpenerPageComponent {

  private readonly _popupService = inject(WorkbenchPopupService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _openButton = viewChild.required<ElementRef<HTMLButtonElement>>('open_button');
  private readonly _popupOrigin$: Observable<PopupOrigin>;

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([
      this._formBuilder.group({
        key: this._formBuilder.control('component'),
        value: this._formBuilder.control('popup'),
      }),
      this._formBuilder.group({
        key: this._formBuilder.control('app'),
        value: this._formBuilder.control('app1'),
      }),
    ], Validators.required),
    options: this._formBuilder.group({
      params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      anchor: this._formBuilder.group({
        position: this._formBuilder.control<Position | 'element'>('element', Validators.required),
        verticalPosition: this._formBuilder.control(0, Validators.required),
        horizontalPosition: this._formBuilder.control(0, Validators.required),
        width: this._formBuilder.control<number | undefined>(undefined),
        height: this._formBuilder.control<number | undefined>(undefined),
      }),
      align: this._formBuilder.control<'east' | 'west' | 'north' | 'south' | ''>(''),
      context: this._formBuilder.control<ViewId | PartId | DialogId | PopupId | '<null>' | ''>(''),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
      closeStrategy: this._formBuilder.group({
        onFocusLost: this._formBuilder.control(true),
        onEscape: this._formBuilder.control(true),
      }),
    }),
  });

  protected popupError: string | undefined;
  protected returnValue: string | undefined;

  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  protected async onOpen(): Promise<void> {
    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const options = this.form.controls.options.controls;
    const params = SciKeyValueFieldComponent.toDictionary(options.params);

    this.popupError = undefined;
    this.returnValue = undefined;

    await this._popupService.open<string>(qualifier, {
      params: params ?? undefined,
      anchor: options.anchor.controls.position.value === 'element' ? this._openButton().nativeElement : this._popupOrigin$,
      align: options.align.value || undefined,
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: options.closeStrategy.controls.onFocusLost.value,
        onEscape: options.closeStrategy.controls.onEscape.value,
      }),
      cssClass: options.cssClass.value,
      context: parseTypedString(options.context.value, {undefinedIfEmpty: true}),
    })
      .then(result => this.returnValue = result)
      .catch((error: unknown) => this.popupError = stringifyError(error) || 'Popup was closed with an error');
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
