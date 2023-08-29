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
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {concat, Observable} from 'rxjs';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';
import {take} from 'rxjs/operators';
import {bufferLatestUntilLayoutChange} from '../common/operators';

/**
 * Registry for {@link WorkbenchPart} model objects.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPartRegistry implements OnDestroy {

  private _registry = new WorkbenchObjectRegistry<string, ɵWorkbenchPart>({
    keyFn: part => part.id,
    nullObjectErrorFn: partId => Error(`[NullPartError] Part '${partId}' not found.`),
  });

  public parts$: Observable<readonly ɵWorkbenchPart[]> = concat(
    this._registry.objects$.pipe(take(1)), // immediate emission upon subscription
    this._registry.objects$.pipe(bufferLatestUntilLayoutChange()),
  );

  /**
   * Registers given part.
   */
  public register(part: ɵWorkbenchPart): void {
    this._registry.register(part);
  }

  /**
   * Unregisters specified part and destroys it.
   */
  public unregister(partId: string): void {
    this._registry.unregister(partId)?.destroy();
  }

  /**
   * Returns the {@link ɵWorkbenchPart} of the given identity. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public get(partId: string): ɵWorkbenchPart;
  public get(partId: string, options: {orElse: null}): ɵWorkbenchPart | null;
  public get(partId: string, options?: {orElse: null}): ɵWorkbenchPart | null {
    return this._registry.get(partId, options);
  }

  public get parts(): readonly ɵWorkbenchPart[] {
    return this._registry.objects;
  }

  public ngOnDestroy(): void {
    this._registry.objects.forEach(part => part.destroy());
    this._registry.clear();
  }
}
