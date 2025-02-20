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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CloseStrategy, PopupOrigin, ViewId, WorkbenchPopupService, WorkbenchView} from '@scion/workbench-client';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {PopupPositionLabelPipe, Position} from './popup-position-label.pipe';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {parseTypedString} from '../common/parse-typed-value.util';
import {CssClassComponent} from '../css-class/css-class.component';

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
    CssClassComponent,
  ],
})
export default class PopupOpenerPageComponent {

  private _popupOrigin$: Observable<PopupOrigin>;

  public form = this._formBuilder.group({
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
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
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
    closeStrategy: this._formBuilder.group({
      onFocusLost: this._formBuilder.control(true),
      onEscape: this._formBuilder.control(true),
    }),
  });

  public popupError: string | undefined;
  public returnValue: string | undefined;

  @ViewChild('open_button', {static: true})
  private _openButton!: ElementRef<HTMLButtonElement>;

  constructor(view: WorkbenchView,
              private _popupService: WorkbenchPopupService,
              private _formBuilder: NonNullableFormBuilder) {
    view.signalReady();
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  public async onPopupOpen(): Promise<void> {
    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const params = SciKeyValueFieldComponent.toDictionary(this.form.controls.params);

    this.popupError = undefined;
    this.returnValue = undefined;

    await this._popupService.open<string>(qualifier, {
      params: params ?? undefined,
      anchor: this.form.controls.anchor.controls.position.value === 'element' ? this._openButton.nativeElement : this._popupOrigin$,
      align: this.form.controls.align.value || undefined,
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: this.form.controls.closeStrategy.controls.onFocusLost.value,
        onEscape: this.form.controls.closeStrategy.controls.onEscape.value,
      }),
      cssClass: this.form.controls.cssClass.value,
      context: {
        viewId: parseTypedString(this.form.controls.contextualViewId.value || undefined),
      },
    })
      .then(result => this.returnValue = result)
      .catch((error: unknown) => this.popupError = stringifyError(error) || 'Popup was closed with an error');
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
