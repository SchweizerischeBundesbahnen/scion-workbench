/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, OnDestroy} from '@angular/core';
import {WorkbenchStorage} from './workbench-storage';
import {DOCUMENT} from '@angular/common';
import {fromEvent, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {WorkbenchInitializer} from '../startup/workbench-initializer';

/**
 * Provides API to read/write data from/to {@link WorkbenchStorage}.
 */
@Injectable()
export class WorkbenchStorageService implements WorkbenchInitializer, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _data = new Map<string, unknown>();
  private _lastSerializedData: string | null = null;

  constructor(private _storage: WorkbenchStorage) {
    // Store data when the page transitions to hidden, but only if data has changed.
    this.whenDocumentHidden(() => {
      const serializedData = serialize(this._data);
      if (serializedData !== this._lastSerializedData) {
        this._lastSerializedData = serializedData;
        this._storage.store(serializedData);
      }
    });
  }

  public async init(): Promise<void> {
    const serializedData = await this._storage.load();
    this._lastSerializedData = serializedData;
    this._data = deserialize(serializedData);
  }

  /**
   * Reads the value for given key from the storage.
   */
  public get<T>(key: string): T | null {
    return this._data.get(key) as T ?? null;
  }

  /**
   * Writes given value to the storage.
   */
  public set<T>(key: string, value: T): void {
    this._data.set(key, value);
  }

  /**
   * Runs the passed callback when the page transitions to hidden.
   */
  private whenDocumentHidden(callback: () => void): void {
    const document: Document = inject(DOCUMENT);
    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'hidden'),
        takeUntil(this._destroy$),
      )
      .subscribe(() => callback());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Serializes given data to a base64 string.
 */
function serialize(data: Map<string, unknown>): string {
  const dictionary = Object.fromEntries(data);
  const json = JSON.stringify(dictionary);
  return window.btoa(json);
}

/**
 * Deserializes given base64 string.
 */
function deserialize(serialized: string | null): Map<string, unknown> {
  if (!serialized?.length) {
    return new Map<string, unknown>();
  }
  const json = window.atob(serialized);
  const deserialized = JSON.parse(json);
  return new Map(Object.entries(deserialized));
}
