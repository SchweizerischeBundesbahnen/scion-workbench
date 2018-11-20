/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { KeyValue } from '@angular/common';

/**
 * Show the properties of an object.
 */
@Component({
  selector: 'sci-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SciPropertyComponent {

  public flattenedProperties: { [key: string]: any };
  private _keys: string[];

  @Input()
  public set properties(properties: any) {
    this.flattenedProperties = this.flattenObject(properties || {});
    this._keys = Object.keys(this.flattenedProperties || {});
  }

  /**
   * Compares qualifier entries by their position in the object.
   */
  public keyCompareFn = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return this._keys.indexOf(a.key) - this._keys.indexOf(b.key);
  };

  private flattenObject(property: any, path: string[] = []): { [key: string]: any } {
    return Object.keys(property).reduce((acc, key) => {
      const value = property[key];
      if (typeof value === 'object') {
        return {...acc, ...this.flattenObject(value, [...path, key])};
      }
      else {
        const propName = [...path, key].join('.');
        return {...acc, ...{[propName]: value}};
      }
    }, {});
  }
}
