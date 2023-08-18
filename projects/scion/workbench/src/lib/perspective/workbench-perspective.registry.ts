/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';
import {ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';

/**
 * Registry for {@link ɵWorkbenchPerspective} model objects.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveRegistry implements OnDestroy {

  private _registry = new WorkbenchObjectRegistry<string, ɵWorkbenchPerspective>({
    keyFn: perspective => perspective.id,
    nullObjectErrorFn: perspectiveId => Error(`[NullPerspectiveError] Perspective '${perspectiveId}' not found.`),
  });

  /**
   * Registers given perspective.
   */
  public register(perspective: ɵWorkbenchPerspective): void {
    this._registry.register(perspective);
  }

  /**
   * Returns the {@link ɵWorkbenchPerspective} of the given identity. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public get(perspectiveId: string): ɵWorkbenchPerspective;
  public get(perspectiveId: string, options: {orElse: null}): ɵWorkbenchPerspective | null;
  public get(perspectiveId: string, options?: {orElse: null}): ɵWorkbenchPerspective | null {
    return this._registry.get(perspectiveId, options);
  }

  public get perspectives(): readonly ɵWorkbenchPerspective[] {
    return this._registry.objects;
  }

  public get perspectives$(): Observable<readonly ɵWorkbenchPerspective[]> {
    return this._registry.objects$;
  }

  public ngOnDestroy(): void {
    this._registry.objects.forEach(perspective => perspective.destroy());
    this._registry.clear();
  }
}
