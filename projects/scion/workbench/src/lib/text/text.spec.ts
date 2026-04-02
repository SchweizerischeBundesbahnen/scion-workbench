/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {SciTextProviderFn, text} from '@scion/sci-components/text';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('Workbench Text Provider', () => {

  it('should provide workbench text', () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });

    const translated = text('%scion.workbench.close.action', {injector: TestBed.inject(Injector)});
    expect(translated()).toEqual('Close');
  });

  it('should provide custom text', () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: (key: string) => {
            if (key.startsWith('scion.')) {
              return undefined;
            }
            return `Custom Text for "${key}"`;
          },
        }),
      ],
    });

    const text1 = text('%custom_text', {injector: TestBed.inject(Injector)});
    expect(text1()).toEqual('Custom Text for "custom_text"');

    const text2 = text('%scion.workbench.close.action', {injector: TestBed.inject(Injector)});
    expect(text2()).toEqual('Close');
  });

  it('should not pass internal keys to application text provider', () => {
    const appTextProviderFn = jasmine.createSpy<SciTextProviderFn>('app-text-provider');

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: appTextProviderFn,
        }),
      ],
    });

    text('%text', {injector: TestBed.inject(Injector)})();
    expect(appTextProviderFn).toHaveBeenCalledWith('text', {});
    appTextProviderFn.calls.reset();

    text('%scion.workbench.text', {injector: TestBed.inject(Injector)})();
    expect(appTextProviderFn).toHaveBeenCalledWith('scion.workbench.text', {});
    appTextProviderFn.calls.reset();

    text('%scion.workbench.internal.text', {injector: TestBed.inject(Injector)})();
    expect(appTextProviderFn).not.toHaveBeenCalled();
    appTextProviderFn.calls.reset();
  });
});
