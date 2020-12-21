/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { VIEW_REF_PREFIX } from '../workbench.constants';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ɵWorkbenchView } from './ɵworkbench-view.model';

/**
 * Registry for {@link WorkbenchView} model objects.
 */
@Injectable()
export class WorkbenchViewRegistry implements OnDestroy {

  private readonly _destroy$ = new Subject<void>();
  private readonly _viewRegistry = new Map<string, ɵWorkbenchView>();
  private readonly _viewRegistryChange$ = new Subject<void>();

  public register(view: ɵWorkbenchView): void {
    this._viewRegistry.set(view.viewId, view);
    this._viewRegistryChange$.next();
  }

  /**
   * Destroys the view of the given view reference and removes it from this registry.
   */
  public remove(viewId: string): void {
    this._viewRegistry.get(viewId).portal.destroy();
    this._viewRegistry.delete(viewId);
    this._viewRegistryChange$.next();
  }

  /**
   * Computes a view outlet identity which is unique in this application.
   */
  public computeNextViewOutletIdentity(): string {
    const ids = this.viewIds
      .map(viewId => Number(viewId.substring(VIEW_REF_PREFIX.length)))
      .reduce((set, viewId) => set.add(viewId), new Set<number>());

    for (let i = 1; i <= ids.size; i++) {
      if (!ids.has(i)) {
        return `${VIEW_REF_PREFIX}${i}`;
      }
    }
    return `${VIEW_REF_PREFIX}${ids.size + 1}`;
  }

  /**
   * Returns the {@link WorkbenchView} of the given identity, or throws an Error if not found.
   */
  public getElseThrow(viewId: string): ɵWorkbenchView {
    const view = this._viewRegistry.get(viewId);
    if (!view) {
      throw Error(`[NullViewError] No view for '${viewId}' found.`);
    }
    return view;
  }

  /**
   * Returns the {@link WorkbenchView} of the given identity, or returns `null` if not found.
   */
  public getElseNull(viewId: string): ɵWorkbenchView | null {
    return this._viewRegistry.get(viewId) || null;
  }

  public get viewIds(): string[] {
    return Array.from(this._viewRegistry.keys());
  }

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public get viewIds$(): Observable<string[]> {
    return this._viewRegistryChange$
      .pipe(
        startWith(undefined as void),
        map(() => this.viewIds),
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
