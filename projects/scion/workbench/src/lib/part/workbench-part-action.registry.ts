/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Disposable} from '../common/disposable';
import {WorkbenchPartAction} from '../workbench.model';
import {Injectable, OnDestroy} from '@angular/core';
import {identity, Observable} from 'rxjs';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';

/**
 * Registry for {@link WorkbenchPartAction} model objects.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPartActionRegistry implements OnDestroy {

  private _registry = new WorkbenchObjectRegistry<WorkbenchPartAction, WorkbenchPartAction>({
    keyFn: identity,
    nullObjectErrorFn: (action: WorkbenchPartAction) => Error(`[NullPartActionError] Part Action '${JSON.stringify(action)}' not found.`),
  });

  /**
   * Registers given part action.
   *
   * @return handle to unregister the part action.
   */
  public register(action: WorkbenchPartAction): Disposable {
    this._registry.register(action);

    return {
      dispose: (): void => {
        this._registry.unregister(action);
      },
    };
  }

  /**
   * Emits registered part actions.
   *
   * Upon subscription, the currently registerd actions are emitted, and then emits continuously
   * when new actions are registered or unregistered. It never completes.
   */
  public get actions$(): Observable<readonly WorkbenchPartAction[]> {
    return this._registry.objects$;
  }

  public ngOnDestroy(): void {
    this._registry.clear();
  }
}
