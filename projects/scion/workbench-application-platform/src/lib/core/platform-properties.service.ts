/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';

/**
 * Allows reading platform properties.
 */
@Injectable()
export class PlatformProperties {

  private _properties = new Map<string, any>();

  /**
   * Registers given properties.
   */
  public registerProperties(properties: Dictionary): void {
    this._properties = Object
      .keys(properties || [])
      .reduce((acc: Map<string, any>, key: string) => {
        return acc.set(key, properties[key]);
      }, new Map<string, any>());
  }

  /**
   * Tests if a property of given key exists.
   */
  public contains(key: string): boolean {
    return this._properties.has(key);
  }

  /**
   * Returns the property of given key, or `defaultValue` if the property does not exist.
   */
  public get<T>(key: string, defaultValue?: T): T {
    return this._properties.has(key) ? this._properties.get(key) : defaultValue;
  }

  /**
   * Returns the property of given key, or `defaultValue` if the property does not exist.
   *
   * Throws an error if `defaultValue` is not specified and the property does not exist.
   */
  public getElseThrow<T>(key: string, defaultValue?: T): T {
    if (!this._properties.has(key) && defaultValue === undefined) {
      throw Error(`[PropertyNotFoundError] No property of given name found [prop=${key}]`);
    }
    return this._properties.has(key) ? this._properties.get(key) : defaultValue;
  }
}

export interface Dictionary {
  [key: string]: any;
}
