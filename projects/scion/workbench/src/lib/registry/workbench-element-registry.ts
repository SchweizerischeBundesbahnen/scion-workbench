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
 * Registry for workbench model elements.
 */
export class WorkbenchElementRegistry<KEY, T> {

  private readonly _elements = signal<T[]>([]);
  private readonly _elementById = new Map<KEY, T>();

  private readonly _nullElementErrorFn: (key: KEY) => Error;
  private readonly _onUnregister: ((element: T) => void) | undefined;

  public readonly elements = this._elements.asReadonly();

  /**
   * Creates an instance of the registry.
   *
   * This registry must be constructed within an injection context. Destroying the injection context will also destroy the registry,
   * invoking the specified `onUnregister` function for each element in the registry.
   *
   * @param config - Configures the registry.
   * @param config.nullElementErrorFn - Function to provide an error when looking up an element not contained in the registry.
   * @param config.onUnregister - Function invoked when an element is unregistered.
   */
  constructor(config?: {nullElementErrorFn?: (key: KEY) => Error; onUnregister?: (element: T) => void}) {
    this._nullElementErrorFn = config?.nullElementErrorFn ?? ((key: KEY) => Error(`[NullElementError] Element '${key}' not found.`));
    this._onUnregister = config?.onUnregister;

    // Clear registry when the current injection context is destroyed.
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  /**
   * Registers an element under given key, replacing any previously registered element with the same key.
   */
  public register(key: KEY, element: T): void {
    this.replace(key, {key, element});
  }

  /**
   * Registers an element under given key, replacing any previously registered element with the specified key.
   *
   * @param key - Specifies the key of the element to replace by {@link replaceBy}.
   * @param replaceBy - Specifies the element to replace another element.
   */
  public replace(key: KEY, replaceBy: {key: KEY; element: T}): void {
    const prevElement = this._elementById.get(key);

    // Unregister previous element, if any.
    if (prevElement) {
      this._elementById.delete(key);
      this._onUnregister?.(prevElement);
    }

    // Add to Map.
    this._elementById.set(replaceBy.key, replaceBy.element);

    // Add to Signal.
    this._elements.update(elements => {
      const copy = [...elements];
      if (prevElement) {
        copy.splice(copy.indexOf(prevElement), 1, replaceBy.element); // Replace element.
      }
      else {
        copy.push(replaceBy.element); // Append element.
      }
      return copy;
    });
  }

  /**
   * Unregisters specified element.
   */
  public unregister(key: KEY): T | null {
    const element = this._elementById.get(key);
    if (!element) {
      return null;
    }

    // Invoke unregister function.
    this._onUnregister?.(element);

    // Remove from Map.
    this._elementById.delete(key);
    // Remove from Signal.
    this._elements.update(elements => {
      const copy = [...elements];
      copy.splice(copy.indexOf(element), 1);
      return copy;
    });
    return element;
  }

  /**
   * Returns the element of the given identity. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public get(key: KEY): T;
  public get(key: KEY, options?: {orElse: null}): T | null;
  public get(key: KEY, options?: {orElse: null}): T | null {
    const element = this._elementById.get(key);
    if (!element && !options) {
      throw this._nullElementErrorFn(key);
    }
    return element ?? null;
  }

  /**
   * Indicates whether an element with the specified key exists or not.
   */
  public has(key: KEY): boolean {
    return this._elementById.has(key);
  }

  /**
   * Indicates whether this registry is empty.
   */
  public isEmpty(): boolean {
    return this._elementById.size === 0;
  }

  /**
   * Clears this registry.
   */
  public clear(): void {
    this._onUnregister && this.elements().forEach(this._onUnregister);
    this._elementById.clear();
    this._elements.set([]);
  }
}
