/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, OnDestroy} from '@angular/core';
import {concat, Observable} from 'rxjs';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';
import {take} from 'rxjs/operators';
import {bufferLatestUntilLayoutChange} from '../common/operators';
import {ViewId} from './workbench-view.model';

/**
 * Registry for {@link WorkbenchView} model objects.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewRegistry implements OnDestroy {

  private _registry = new WorkbenchObjectRegistry<string, ɵWorkbenchView>({
    keyFn: view => view.id,
    nullObjectErrorFn: viewId => Error(`[NullViewError] View '${viewId}' not found.`),
  });

  public views$: Observable<readonly ɵWorkbenchView[]> = concat(
    this._registry.objects$.pipe(take(1)), // immediate emission upon subscription
    this._registry.objects$.pipe(bufferLatestUntilLayoutChange()),
  );

  /**
   * Registers given view.
   */
  public register(view: ɵWorkbenchView): void {
    this._registry.register(view);
  }

  /**
   * Unregisters specified view and destroys it.
   */
  public unregister(viewId: ViewId): void {
    this._registry.unregister(viewId)?.destroy();
  }

  /**
   * Returns the {@link WorkbenchView} of the given identity. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public get(viewId: ViewId): ɵWorkbenchView;
  public get(viewId: ViewId, options: {orElse: null}): ɵWorkbenchView | null;
  public get(viewId: ViewId, options?: {orElse: null}): ɵWorkbenchView | null {
    return this._registry.get(viewId, options);
  }

  public get views(): readonly ɵWorkbenchView[] {
    return this._registry.objects;
  }

  public ngOnDestroy(): void {
    this._registry.objects.forEach(view => view.destroy());
    this._registry.clear();
  }
}
