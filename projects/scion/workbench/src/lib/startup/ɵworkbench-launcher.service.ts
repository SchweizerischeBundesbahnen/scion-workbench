/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchConfig} from '../workbench-config';
import {ApplicationInitStatus, assertNotInReactiveContext, computed, inject, Injectable, Injector, NgZone, signal} from '@angular/core';
import {runWorkbenchInitializers, WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP} from './workbench-initializer';
import {Logger, LoggerNames} from '../logging';
import {WorkbenchLauncher} from './workbench-launcher.service';
import {resolveWhen} from '../common/resolve-when.util';

@Injectable({providedIn: 'root'})
export class ɵWorkbenchLauncher implements WorkbenchLauncher {

  private readonly _logger: Logger;
  private readonly _zone: NgZone;
  private readonly _injector: Injector;
  private readonly _whenStarted = resolveWhen(computed(() => this.state() === LaunchState.Started));

  public readonly state = signal(LaunchState.Stopped);

  constructor() {
    const workbenchConfig = inject(WorkbenchConfig, {optional: true});
    if (!workbenchConfig) {
      throw Error(`[WorkbenchError] Missing required workbench providers. Did you forget to call 'provideWorkbench()' in the providers array of 'bootstrapApplication' or the root 'NgModule'?`);
    }

    // Do not inject dependencies before the above check to avoid `NullInjectorError` error.
    this._logger = inject(Logger);
    this._zone = inject(NgZone);
    this._injector = inject(Injector);
  }

  /** @inheritDoc */
  public async launch(): Promise<true> {
    assertNotInReactiveContext(this.launch, 'Call WorkbenchLauncher.launch() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in the Angular zone to check the workbench for changes even if called from outside the Angular zone, e.g. in unit tests.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.launch());
    }

    switch (this.state()) {
      case LaunchState.Stopped: {
        this._logger.debug(() => `Starting Workbench. Waiting for workbench initializers to complete. [launcher=${this._injector.get(ApplicationInitStatus).done as boolean ? 'LAZY' : 'APP_INITIALIZER'}]`, LoggerNames.LIFECYCLE);
        this.state.set(LaunchState.Starting);
        await runWorkbenchInitializers(WORKBENCH_PRE_STARTUP, this._injector);
        await runWorkbenchInitializers(WORKBENCH_STARTUP, this._injector);
        await runWorkbenchInitializers(WORKBENCH_POST_STARTUP, this._injector);
        this.state.set(LaunchState.Started);
        this._logger.debug(() => 'Workbench started.', LoggerNames.LIFECYCLE);
        return true;
      }
      case LaunchState.Starting:
      case LaunchState.Started: {
        await this._whenStarted;
        return true;
      }
    }
  }
}

export enum LaunchState {
  Stopped, Starting, Started,
}
