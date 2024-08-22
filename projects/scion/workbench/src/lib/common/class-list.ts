/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Arrays} from '@scion/toolkit/util';
import {computed, Signal, signal} from '@angular/core';

/**
 * Container for managing CSS classes set in different scopes.
 */
export class ClassList {

  private readonly _layout = signal<string[]>([], {equal: isEqualArray});
  private readonly _navigation = signal<string[]>([], {equal: isEqualArray});
  private readonly _route = signal<string[]>([], {equal: isEqualArray});
  private readonly _application = signal<string[]>([], {equal: isEqualArray});

  /**
   * CSS classes as list.
   */
  public readonly asList: Signal<string[]>;

  /**
   * CSS classes as {@link Map} grouped by scope.
   */
  public readonly asMap: Signal<ClassListMap>;

  constructor() {
    this.asList = computed(() => Arrays.distinct(new Array<string>()
      .concat(this._layout())
      .concat(this._navigation())
      .concat(this._route())
      .concat(this._application())));

    this.asMap = computed(() => removeEmptyEntries(new Map<ClassListScopes, string[]>()
      .set('layout', this._layout())
      .set('navigation', this._navigation())
      .set('route', this._route())
      .set('application', this._application())));
  }

  /**
   * Specifies CSS classes defined by the layout.
   */
  public set layout(cssClasses: string | string[] | null | undefined) {
    this._layout.set(Arrays.coerce(cssClasses));
  }

  /**
   * Returns CSS classes defined in the scope 'layout'.
   */
  public get layout(): Signal<string[]> {
    return this._layout;
  }

  /**
   * Specifies CSS classes associated with the navigation.
   */
  public set navigation(cssClasses: string | string[] | null | undefined) {
    this._navigation.set(Arrays.coerce(cssClasses));
  }

  /**
   * Returns CSS classes defined in the scope 'navigation'.
   */
  public get navigation(): Signal<string[]> {
    return this._navigation;
  }

  /**
   * Specifies CSS classes defined by the route.
   */
  public set route(cssClasses: string | string[] | null | undefined) {
    this._route.set(Arrays.coerce(cssClasses));
  }

  /**
   * Returns CSS classes defined in the scope 'route'.
   */
  public get route(): Signal<string[]> {
    return this._route;
  }

  /**
   * Specifies CSS classes set by the application.
   */
  public set application(cssClasses: string | string[] | null | undefined) {
    this._application.set(Arrays.coerce(cssClasses));
  }

  /**
   * Returns classes defined in the scope 'application'.
   */
  public get application(): Signal<string[]> {
    return this._application;
  }
}

/**
 * Represents scopes used in {@link ClassList}.
 *
 * `layout`: Use for CSS classes defined on the layout.
 * `navigation`: Use for CSS classes associated with the navigation.
 * `route`: Use for CSS classes defined on the route.
 * `application`: Use for CSS classes set by the application.
 */
export type ClassListScopes = 'layout' | 'navigation' | 'route' | 'application';

/**
 * CSS classes grouped by scope.
 */
export type ClassListMap = ReadonlyMap<ClassListScopes, string[]>;

/**
 * Creates a copy with empty map entries removed.
 */
function removeEmptyEntries<K, V>(map: Map<K, V[]>): Map<K, V[]> {
  const copy = new Map<K, V[]>(map);
  for (const key of copy.keys()) {
    if (!copy.get(key)?.length) {
      copy.delete(key);
    }
  }
  return copy;
}

/**
 * Compares two arrays of strings for equality, ignoring element order.
 */
function isEqualArray(a: string[], b: string[]): boolean {
  return Arrays.isEqual(a, b, {exactOrder: false});
}
