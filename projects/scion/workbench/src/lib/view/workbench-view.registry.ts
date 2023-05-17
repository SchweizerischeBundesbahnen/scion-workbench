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
import {Observable} from 'rxjs';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {WorkbenchObjectRegistry} from '../workbench-object-registry';

/**
 * Registry for {@link WorkbenchView} model objects.
 */
@Injectable()
export class WorkbenchViewRegistry implements OnDestroy {

  private _registry = new WorkbenchObjectRegistry<ɵWorkbenchView>({
    keyFn: view => view.id,
    nullObjectErrorFn: viewId => Error(`[NullViewError] View '${viewId}' not found.`),
  });

  /**
   * Registers given view.
   */
  public register(view: ɵWorkbenchView): void {
    this._registry.register(view);
  }

  /**
   * Unregisters specified view and destroys it.
   */
  public unregister(viewId: string): void {
    this._registry.unregister(viewId)?.destroy();
  }

  /**
   * Returns the {@link WorkbenchView} of the given identity. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public get(viewId: string): ɵWorkbenchView;
  public get(viewId: string, options: {orElse: null}): ɵWorkbenchView | null;
  public get(viewId: string, options?: {orElse: null}): ɵWorkbenchView | null {
    return this._registry.get(viewId, options);
  }

  public get views(): readonly ɵWorkbenchView[] {
    return this._registry.objects;
  }

  public get views$(): Observable<readonly ɵWorkbenchView[]> {
    return this._registry.objects$;
  }

  public ngOnDestroy(): void {
    this._registry.objects.forEach(view => view.destroy());
    this._registry.clear();
  }
}
