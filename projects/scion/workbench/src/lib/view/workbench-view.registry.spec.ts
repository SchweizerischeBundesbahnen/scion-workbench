/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestBed, waitForAsync } from '@angular/core/testing';
import { WorkbenchViewRegistry } from './workbench-view.registry';
import { ɵWorkbenchView } from './ɵworkbench-view.model';
import { noop } from 'rxjs';

describe('WorkbenchViewRegistry', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [WorkbenchViewRegistry],
    });
  }));

  it('should compute unique ascending identities', () => {
    const testee = TestBed.inject(WorkbenchViewRegistry);

    expect(testee.computeNextViewOutletIdentity()).toEqual('view.1');
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.1');

    testee.register(createWorkbenchView('view.1'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.2');

    testee.register(createWorkbenchView('view.2'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.3');

    testee.register(createWorkbenchView('view.6'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.3');

    testee.register(createWorkbenchView('view.3'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.4');

    testee.register(createWorkbenchView('view.4'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.5');

    testee.register(createWorkbenchView('view.5'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.7');

    testee.remove('view.3');
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.3');

    testee.remove('view.1');
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.1');

    testee.register(createWorkbenchView('view.1'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.3');

    testee.register(createWorkbenchView('view.3'));
    expect(testee.computeNextViewOutletIdentity()).toEqual('view.7');
  });
});

function createWorkbenchView(id: string): ɵWorkbenchView {
  return {
    viewId: id,
    destroy: noop,
  } as ɵWorkbenchView;
}
