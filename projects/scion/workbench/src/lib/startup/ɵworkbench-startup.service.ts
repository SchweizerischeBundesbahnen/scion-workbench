/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, Injectable} from '@angular/core';
import {WorkbenchStartup} from './workbench-startup.service';
import {resolveWhen} from '../common/resolve-when.util';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {LaunchState, ɵWorkbenchLauncher} from './ɵworkbench-launcher.service';

@Injectable(/* DO NOT provide via 'providedIn' metadata as registered under `WorkbenchStartup` DI token. */)
export class ɵWorkbenchStartup implements WorkbenchStartup {

  private readonly _launcher = inject(ɵWorkbenchLauncher);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);

  /** @inheritDoc */
  public readonly done = computed(() => this._launcher.state() === LaunchState.Started && this._workbenchLayoutService.hasLayout());

  /** @inheritDoc */
  public readonly whenDone = resolveWhen(this.done);
}
