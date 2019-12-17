/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Dictionaries, Dictionary } from '@scion/toolkit/util';

export const PARAM_NAME = 'paramName';
export const PARAM_VALUE = 'paramValue';

/**
 * Allows to enter parameters.
 */
@Component({
  selector: 'sci-params-enter',
  templateUrl: './params-enter.component.html',
  styleUrls: ['./params-enter.component.scss'],
})
export class SciParamsEnterComponent {

  public readonly PARAM_NAME = PARAM_NAME;
  public readonly PARAM_VALUE = PARAM_VALUE;

  @Input()
  public title: string;

  @Input()
  public paramsFormArray: FormArray;

  @Input()
  @HostBinding('class.removable')
  public removable: boolean;

  @Input()
  @HostBinding('class.addable')
  public addable: boolean;

  @HostBinding('attr.tabindex')
  public tabindex = -1;

  constructor(private _formBuilder: FormBuilder, private _host: ElementRef<HTMLElement>) {
  }

  public onRemove(index: number): void {
    this.paramsFormArray.removeAt(index);

    // Focus the component to not loose the focus when the remove button is removed from the DOM.
    // Otherwise, if used in a popup, the popup would be closed because no element is focused anymore.
    this._host.nativeElement.focus({preventScroll: true});
  }

  public onAdd(): void {
    this.paramsFormArray.push(this._formBuilder.group({
      [PARAM_NAME]: this._formBuilder.control(''),
      [PARAM_VALUE]: this._formBuilder.control(''),
    }));
  }

  public onClear(): void {
    this.paramsFormArray.clear();
  }

  /**
   * Creates a dictionary from the form controls in the given `FormArray`.
   *
   * By default, if empty, `null` is returned.
   */
  public static toParamsDictionary(formArray: FormArray, returnNullIfEmpty: boolean = true): Dictionary | null {
    const params: Dictionary = {};
    formArray.controls.forEach(formGroup => {
      const paramName = formGroup.get(PARAM_NAME).value;
      params[paramName] = formGroup.get(PARAM_VALUE).value;
    });

    if (!Object.keys(params).length && returnNullIfEmpty) {
      return null;
    }

    return params;
  }

  /**
   * Creates a {@link Map} from the form controls in the given `FormArray`.
   *
   * By default, if empty, `null` is returned.
   */
  public static toParamsMap(formArray: FormArray, returnNullIfEmpty: boolean = true): Map<string, any> | null {
    const params = SciParamsEnterComponent.toParamsDictionary(formArray, returnNullIfEmpty);
    if (!params) {
      return null;
    }
    return Dictionaries.toMap(params);
  }
}
