/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, inject, signal} from '@angular/core';

/**
 * Provides a registry for workbench model objects.
 */
export class WorkbenchObjectRegistry<KEY, T> {

  private readonly _objects = signal<T[]>([]);
  private readonly _objectsById = new Map<KEY, T>();

  private readonly _keyFn: (object: T) => KEY;
  private readonly _nullObjectErrorFn: (key: KEY) => Error;
  private readonly _onUnregister: ((object: T) => void) | undefined;

  public readonly objects = this._objects.asReadonly();

  /**
   * Creates an instance of the registry.
   *
   * This registry must be constructed within an injection context. Destroying the injection context will also destroy the registry,
   * invoking the specified `onUnregister` function for each object in the registry.
   *
   * @param config - Controls the creation of the registry.
   * @param config.keyFn - Function to extract the key of an object.
   * @param config.nullObjectErrorFn - Function to provide an error when looking up an object not contained in the registry.
   * @param config.onUnregister - Function invoked when an object is unregistered.
   */
  constructor(config: {keyFn: (object: T) => KEY; nullObjectErrorFn?: (key: KEY) => Error; onUnregister?: (object: T) => void}) {
    this._keyFn = config.keyFn;
    this._nullObjectErrorFn = config.nullObjectErrorFn ?? ((key: KEY) => Error(`[NullObjectError] Object '${key}' not found.`));
    this._onUnregister = config.onUnregister;

    // Clear registry when the current injection context is destroyed.
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  /**
   * Registers given object, replacing any previously registered object with the same key.
   */
  public register(object: T): void {
    const key = this._keyFn(object);
    const prevObject = this._objectsById.get(key);

    // Add to Map.
    this._objectsById.set(key, object);

    // Add to Signal.
    this._objects.update(objects => {
      const copy = [...objects];
      if (prevObject) {
        copy.splice(copy.indexOf(prevObject), 1, object); // Replace object.
      }
      else {
        copy.push(object); // Append object.
      }
      return copy;
    });
  }

  /**
   * Unregisters specified object.
   */
  public unregister(key: KEY): T | null {
    const object = this._objectsById.get(key);
    if (!object) {
      return null;
    }

    // Invoke unregister function.
    this._onUnregister?.(object);

    // Remove from Map.
    this._objectsById.delete(key);
    // Remove from Signal.
    this._objects.update(objects => {
      const copy = [...objects];
      copy.splice(copy.indexOf(object), 1);
      return copy;
    });
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
   * Indicates whether this registry is empty.
   */
  public isEmpty(): boolean {
    return this._objectsById.size === 0;
  }

  /**
   * Clears this registry.
   */
  public clear(): void {
    this._onUnregister && this.objects().forEach(this._onUnregister);
    this._objectsById.clear();
    this._objects.set([]);
  }
}
