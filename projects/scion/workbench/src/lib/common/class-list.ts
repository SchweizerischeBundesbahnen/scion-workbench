/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {Arrays} from '@scion/toolkit/util';

/**
 * Container for managing CSS classes set in different scopes.
 */
export class ClassList {

  private readonly _cssClasses = new Map<ClassListScopes, string[]>();
  private readonly _change$ = new Subject<void>();

  public readonly value = new Array<string>();
  public readonly value$: Observable<string[]>;

  constructor() {
    this.value$ = this._change$
      .pipe(
        startWith(undefined as void),
        map(() => [...this.value]),
      );
  }

  /**
   * Sets CSS classes for a specific scope.
   */
  public set(cssClasses: string | string[] | null | undefined, options: {scope: ClassListScopes}): void {
    this._cssClasses.set(options.scope, Arrays.coerce(cssClasses));
    this.computeValue();
  }

  /**
   * Retuns CSS classes of a specific scope.
   */
  public get(options: {scope: ClassListScopes}): string[] {
    return this._cssClasses.get(options.scope) ?? [];
  }

  /**
   * Removes CSS classes of a specific scope.
   */
  public remove(options: {scope: ClassListScopes}): void {
    this._cssClasses.delete(options.scope);
    this.computeValue();
  }

  /**
   * Returns the CSS classes as readonly {@link Map} grouped by scope,
   * useful to transfer the class list to a different browsing context.
   */
  public toMap(): ReadonlyMap<ClassListScopes, string[]> {
    return new Map(this._cssClasses.entries());
  }

  /**
   * Computes the aggregated list of CSS classes.
   */
  private computeValue(): void {
    this.value.length = 0;
    const classes = new Set(Array.from(this._cssClasses.values()).flat());
    classes.forEach(clazz => this.value.push(clazz));
    this._change$.next();
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
