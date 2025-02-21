/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchConfig} from '../workbench-config';
import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {provideWorkbench} from '../workbench.provider';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {MAIN_AREA_INITIAL_PART_ID} from '../layout/ɵworkbench-layout';
import {ComponentFixtureAutoDetect} from '@angular/core/testing';
import {Router} from '@angular/router';
import {PartId} from '../part/workbench-part.model';

/**
 * Enables and configures the SCION Workbench in tests., returning a set of dependency-injection providers to be registered in Angular.
 *
 * Does the following:
 * - provides the workbench with given config
 * - installs a sequence for activation instants
 * - configures the testbed to auto-detect changes
 * - disables animations
 * - performs the initial navigation
 *
 * ---
 * Usage:
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     provideWorkbenchForTest(),
 *     provideRouter([])
 *   ],
 * });
 * ```
 */
export function provideWorkbenchForTest(config?: WorkbenchConfig & {mainAreaInitialPartId?: PartId}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbench(config),
    provideNoopAnimations(),
    {provide: ActivationInstantProvider, useClass: SequenceInstantProvider},
    config?.mainAreaInitialPartId ? {provide: MAIN_AREA_INITIAL_PART_ID, useValue: config.mainAreaInitialPartId} : [],
    {provide: ComponentFixtureAutoDetect, useValue: true},
    provideEnvironmentInitializer(() => inject(Router).initialNavigation()),
    provideEnvironmentInitializer(() => localStorage.clear()),
    provideEnvironmentInitializer(() => window.name = ''),
  ]);
}

@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered only if using `WorkbenchTestingModule`. */)
class SequenceInstantProvider implements ActivationInstantProvider {

  private _sequence = 0;

  public now(): number {
    return this._sequence++;
  }
}
