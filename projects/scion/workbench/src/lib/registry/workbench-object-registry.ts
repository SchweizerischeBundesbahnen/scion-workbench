/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

/**
 * Provides a registry for workbench model objects.
 */
export class WorkbenchObjectRegistry<KEY, T> {

  private readonly _objects = new Array<T>();
  private readonly _objectsById = new Map<KEY, T>();

  private readonly _keyFn: (object: T) => KEY;
  private readonly _nullObjectErrorFn: (key: KEY) => Error;
  private readonly _change$ = new Subject<void>();

  public readonly objects$: Observable<T[]>;

  /**
   * Creates an instance of the registry.
   *
   * @param config - Controls the creation of the registry.
   * @param config.keyFn - Function to extract the key of an object.
   * @param config.nullObjectErrorFn - Function to provide an error when looking up an object not contained in the registry.
   */
  constructor(config: {keyFn: (object: T) => KEY; nullObjectErrorFn: (key: KEY) => Error}) {
    this._keyFn = config.keyFn;
    this._nullObjectErrorFn = config.nullObjectErrorFn;
    this.objects$ = this._change$
      .pipe(
        startWith(undefined as void),
        map(() => [...this._objects]),
      );
  }

  /**
   * Registers given object, replacing any previously registered object with the same key.
   */
  public register(object: T): void {
    const key = this._keyFn(object);
    const prevObject = this._objectsById.get(key);
    this._objectsById.set(key, object);
    prevObject ? this._objects.splice(this._objects.indexOf(prevObject), 1, object) : this._objects.push(object);
    this._change$.next();
  }

  /**
   * Unregisters specified object.
   */
  public unregister(key: KEY): T | null {
    const object = this._objectsById.get(key);
    if (!object) {
      return null;
    }

    this._objectsById.delete(key);
    this._objects.splice(this._objects.indexOf(object), 1);
    this._change$.next();
    return object;
  }

  /**
   * Returns the object of the given identity. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public get(key: KEY): T;
  public get(key: KEY, options?: {orElse: null}): T | null;
  public get(key: KEY, options?: {orElse: null}): T | null {
    const object = this._objectsById.get(key);
    if (!object && !options) {
      throw this._nullObjectErrorFn(key);
    }
    return object ?? null;
  }

  /**
   * Indicates whether an object with the specified key exists or not.
   */
  public has(key: KEY): boolean {
    return this._objectsById.has(key);
  }

  /**
   * Returns registered objects.
   */
  public get objects(): T[] {
    return this._objects;
  }

  /**
   * Clears this registry.
   */
  public clear(): void {
    this._objectsById.clear();
    this._objects.length = 0;
    this._change$.next();
  }
}
