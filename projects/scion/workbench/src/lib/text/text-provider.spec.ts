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
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideText} from './text-provider';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {waitUntilStable} from '../testing/testing.util';
import {toSignal} from '@angular/core/rxjs-interop';
import {WORKBENCH_TEXT_PROVIDER, WorkbenchTextProviderFn} from './workbench-text-provider.model';

describe('Text Provider', () => {

  it('should provide text', async () => {
    provideTextProvider(key => signal(`key=${key}, text=${texts[key as keyof typeof texts]}`));

    const texts = {
      'key-1': 'text-1',
      'key-2': 'text-2',
    };

    // Translate key-1
    const text1 = provideText(signal('%key-1'), {injector: TestBed.inject(Injector)});
    expect(text1()).toEqual('key=key-1, text=text-1');

    // Translate key-2
    const text2 = provideText(signal('%key-2'), {injector: TestBed.inject(Injector)});
    expect(text2()).toEqual('key=key-2, text=text-2');
  });

  it('should return text as is if `undefined`', async () => {
    provideTextProvider(key => signal(key));
    const text = provideText(signal(undefined), {injector: TestBed.inject(Injector)});
    expect(text()).toBeUndefined();
  });

  it('should return text as is if not starting with "%"', async () => {
    provideTextProvider(() => signal('UNEXPECTED'));
    const text = provideText(signal('key'), {injector: TestBed.inject(Injector)});
    expect(text()).toEqual('key');
  });

  it('should return text as is if no text provider configured', async () => {
    const text = provideText(signal('%key'), {injector: TestBed.inject(Injector)});
    expect(text()).toEqual('%key');
  });

  it('should call text provider function only when key changes', async () => {
    const texts = {
      'key-1': new BehaviorSubject('text-1'),
      'key-2': new BehaviorSubject('text-2'),
    };
    const key = signal<'%key-1' | '%key-2'>('%key-1');

    let textProviderFunctionCallCount = 0;
    provideTextProvider(key => {
      textProviderFunctionCallCount++;
      return toSignal(texts[key as keyof typeof texts].pipe(map(text => `key=${key}, text=${text}`)), {requireSync: true});
    });

    // Provide text.
    const text = provideText(key, {injector: TestBed.inject(Injector)});
    expect(text()).toEqual('key=key-1, text=text-1');
    expect(textProviderFunctionCallCount).toBe(1);

    // Provide different text.
    texts['key-1'].next('text-1a');
    TestBed.flushEffects();
    expect(text()).toEqual('key=key-1, text=text-1a');
    expect(textProviderFunctionCallCount).toBe(1);

    // Change key.
    key.set('%key-2');
    await waitUntilStable();
    expect(text()).toEqual('key=key-2, text=text-2');
    expect(textProviderFunctionCallCount).toBe(2);

    // Provide different text.
    texts['key-2'].next('text-2a');
    await waitUntilStable();
    expect(text()).toEqual('key=key-2, text=text-2a');
    expect(textProviderFunctionCallCount).toBe(2);

    // Provide different text on previous observable.
    texts['key-1'].next('text-1b');
    await waitUntilStable();
    expect(text()).toEqual('key=key-2, text=text-2a');
    expect(textProviderFunctionCallCount).toBe(2);
  });
});

function provideTextProvider(textProvider: WorkbenchTextProviderFn): void {
  TestBed.overrideProvider(WORKBENCH_TEXT_PROVIDER, {useValue: textProvider});
}
