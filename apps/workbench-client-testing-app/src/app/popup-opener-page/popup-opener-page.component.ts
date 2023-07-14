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
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CloseStrategy, PopupOrigin, WorkbenchPopupService} from '@scion/workbench-client';
import {SciParamsEnterComponent, SciParamsEnterModule} from '@scion/components.internal/params-enter';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {undefinedIfEmpty} from '../common/undefined-if-empty.util';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {PopupPositionLabelPipe, Position} from './popup-position-label.pipe';
import {NgIf} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';

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

  private _popupOrigin$: Observable<PopupOrigin>;

  public form = this._formBuilder.group({
    qualifier: this._formBuilder.array([
      this._formBuilder.group({
        paramName: this._formBuilder.control('component'),
        paramValue: this._formBuilder.control('popup'),
      }),
      this._formBuilder.group({
          paramName: this._formBuilder.control('app'),
          paramValue: this._formBuilder.control('app1'),
        },
      )], Validators.required),
    params: this._formBuilder.array([]),
    anchor: this._formBuilder.group({
      position: this._formBuilder.control<Position | 'element'>('element', Validators.required),
      verticalPosition: this._formBuilder.control(0, Validators.required),
      horizontalPosition: this._formBuilder.control(0, Validators.required),
      width: this._formBuilder.control<number | undefined>(undefined),
      height: this._formBuilder.control<number | undefined>(undefined),
    }),
    contextualViewId: this._formBuilder.control('<default>', Validators.required),
    align: this._formBuilder.control<'east' | 'west' | 'north' | 'south' | ''>(''),
    cssClass: this._formBuilder.control(''),
    closeStrategy: this._formBuilder.group({
      onFocusLost: this._formBuilder.control(true),
      onEscape: this._formBuilder.control(true),
    }),
  });

  public popupError: string | undefined;
  public returnValue: string | undefined;

  @ViewChild('open_button', {static: true})
  private _openButton!: ElementRef<HTMLButtonElement>;

  constructor(private _popupService: WorkbenchPopupService, private _formBuilder: NonNullableFormBuilder) {
    this._popupOrigin$ = this.observePopupOrigin$();
  }

  public async onPopupOpen(): Promise<void> {
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.controls.qualifier)!;
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.controls.params);

    this.popupError = undefined;
    this.returnValue = undefined;

    await this._popupService.open<string>(qualifier, {
      params: params ?? undefined,
      anchor: this.form.controls.anchor.controls.position.value === 'element' ? this._openButton.nativeElement : this._popupOrigin$,
      align: this.form.controls.align.value || undefined,
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: this.form.controls.closeStrategy.controls.onFocusLost.value ?? undefined,
        onEscape: this.form.controls.closeStrategy.controls.onEscape.value ?? undefined,
      }),
      cssClass: this.form.controls.cssClass.value.split(/\s+/).filter(Boolean),
      context: {
        viewId: this.parseContextualViewIdInput(),
      },
    })
      .then(result => this.returnValue = result)
      .catch(error => this.popupError = stringifyError(error) || 'Popup was closed with an error');
  }

  private parseContextualViewIdInput(): string | null | undefined {
    const viewId = this.form.controls.contextualViewId.value;
    switch (viewId) {
      case '<default>':
        return undefined;
      case '<null>':
        return null;
      default:
        return viewId;
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
