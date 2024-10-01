/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {WorkbenchComponent} from './workbench.component';
import {WorkbenchLauncher} from './startup/workbench-launcher.service';
import {provideWorkbench} from './workbench.provider';

describe('Workbench', () => {

  it(`should error if not calling 'provideWorkbench()' before adding workbench component`, () => {
    TestBed.configureTestingModule({});
    expect(() => TestBed.createComponent(WorkbenchComponent)).toThrowError(`[WorkbenchError] Missing required workbench providers. Did you forget to call 'provideWorkbench()' in the providers array of 'bootstrapApplication' or the root 'NgModule'?`);
  });

  it(`should error if not calling 'provideWorkbench()' before starting the workbench`, () => {
    TestBed.configureTestingModule({});
    expect(() => TestBed.inject(WorkbenchLauncher).launch()).toThrowError(`[WorkbenchError] Missing required workbench providers. Did you forget to call 'provideWorkbench()' in the providers array of 'bootstrapApplication' or the root 'NgModule'?`);
  });

  it(`should not error if calling 'provideWorkbench()' before adding workbench component`, async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbench()],
    });
    expect(() => TestBed.createComponent(WorkbenchComponent)).not.toThrowError();
  });

  it(`should not error if calling 'provideWorkbench()' before starting the workbench`, async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbench()],
    });
    expect(() => TestBed.inject(WorkbenchLauncher)).not.toThrowError();
  });
});
