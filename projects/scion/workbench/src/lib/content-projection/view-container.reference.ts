/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, InjectionToken, ViewContainerRef } from '@angular/core';

/**
 * Handle holding a reference to a DOM location.
 */
@Injectable()
export class ViewContainerReference {

  private _resolve: (host: ViewContainerRef) => void;
  private _promise = new Promise<ViewContainerRef>(resolve => this._resolve = resolve);

  /**
   * Sets the given {@link ViewContainerRef}, or throws if already set.
   */
  public set(vcr: ViewContainerRef): void {
    if (!this._resolve) {
      throw Error('[ViewContainerReferenceError] ViewContainer already set.');
    }
    this._resolve(vcr);
    this._resolve = null;
  }

  /**
   * Promise that resolves to the {@link ViewContainerRef}.
   */
  public get(): Promise<ViewContainerRef> {
    return this._promise;
  }
}

/**
 * DI token to inject the DOM location where to insert iframes.
 */
export const IFRAME_HOST = new InjectionToken<string>('IFRAME_HOST');

/**
 * DI token to inject the DOM location where to insert view-modal message boxes.
 */
export const VIEW_LOCAL_MESSAGE_BOX_HOST = new InjectionToken<string>('VIEW_LOCAL_MESSAGE_BOX_HOST');
