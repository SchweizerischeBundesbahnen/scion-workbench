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
import {computed, createEnvironmentInjector, DestroyRef, EnvironmentInjector, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {text} from './text';
import {Observable, Subscriber} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {WORKBENCH_TEXT_PROVIDER, WorkbenchTextProviderFn} from './workbench-text-provider.model';
import {workbenchTextProvider} from './workbench-text-provider';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('Text Provider', () => {

  it('should provide text for key (signal)', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(key => texts[key]),
      ],
    });

    const texts: Record<string, WritableSignal<string>> = {
      'key-1': signal('text-1'),
      'key-2': signal('text-2'),
    };

    // Get text for key-1.
    const text1 = text('%key-1', {injector: TestBed.inject(Injector)});
    expect(text1()).toEqual('text-1');

    // Update text for key-1.
    texts['key-1'].set('TEXT-1');
    expect(text1()).toEqual('TEXT-1');

    // Get text for key-2.
    const text2 = text('%key-2', {injector: TestBed.inject(Injector)});
    expect(text2()).toEqual('text-2');

    // Update text for key-2.
    texts['key-2'].set('TEXT-2');
    expect(text2()).toEqual('TEXT-2');
  });

  it('should provide text for key (string)', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(key => texts[key]),
      ],
    });

    const texts: Record<string, string> = {
      'key-1': 'text-1',
      'key-2': 'text-2',
    };

    // Get text for key-1.
    const text1 = text('%key-1', {injector: TestBed.inject(Injector)});
    expect(text1()).toEqual('text-1');

    // Get text for key-2.
    const text2 = text('%key-2', {injector: TestBed.inject(Injector)});
    expect(text2()).toEqual('text-2');
  });

  it('should parse key without params', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({});
  });

  it('should parse key with single param', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key;param=value', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({param: 'value'});
  });

  it('should parse key with multiple params', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key;param1=value1;param2=value2;param3=value3', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({param1: 'value1', param2: 'value2', param3: 'value3'});
  });

  it('should support escaped semicolon character in parameter value', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key;param1=v\\;al=ue1;param2=va\\;lue2;pa\\;ram3=val=ue3', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({'param1': 'v;al=ue1', param2: 'va;lue2', 'pa;ram3': 'val=ue3'});
  });

  it('should support regex character in parameter value', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key;p(a.r[am=va(lu.e[', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({'p(a.r[am': 'va(lu.e['});
  });

  it('should support empty param value', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key;param1=;param2=', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({param1: '', param2: ''});
  });

  it('should support empty parameters', () => {
    const capture: {key?: string; params?: Record<string, string>} = {};

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider((key, params) => {
          capture.key = key;
          capture.params = params;
          return key;
        }),
      ],
    });

    text('%key;', {injector: TestBed.inject(Injector)})();
    expect(capture.key).toEqual('key');
    expect(capture.params).toEqual({});
  });

  it('should replace params', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(workbenchTextProvider),
      ],
    });

    // Expect parameters not to be replaced.
    const text1 = text('%workbench.page_not_found.message;a=b', {injector: TestBed.inject(Injector)})();
    expect(text1).toEqual('The requested page <strong>{{path}}</strong> was not found.<br>The URL may have changed. Try to open the page again.');

    // Expect parameters to be replaced.
    const text2 = text('%workbench.page_not_found.message;path=path/to/view', {injector: TestBed.inject(Injector)})();
    expect(text2).toEqual('The requested page <strong>path/to/view</strong> was not found.<br>The URL may have changed. Try to open the page again.');
  });

  it('should support observable as text provider using `toSignal`', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(key => toSignal(texts[key], {requireSync: true})),
      ],
    });

    const textCaptor1: {subscriber?: Subscriber<string>; destroyed?: true} = {};
    const textCaptor2: {subscriber?: Subscriber<string>; destroyed?: true} = {};

    const texts: Record<string, Observable<string>> = {
      'key-1': new Observable(observer => {
        observer.next('text-1a');
        textCaptor1.subscriber = observer;
        return () => textCaptor1.destroyed = true;
      }),
      'key-2': new Observable(observer => {
        observer.next('text-2a');
        textCaptor2.subscriber = observer;
        return () => textCaptor2.destroyed = true;
      }),
    };

    const key = signal('%key-1');

    // Get text-1.
    const translation = text(key, {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('text-1a');
    expect(textCaptor1.destroyed).toBeUndefined();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-1.
    textCaptor1.subscriber!.next('text-1b');
    expect(translation()).toEqual('text-1b');
    expect(textCaptor1.destroyed).toBeUndefined();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-1.
    textCaptor1.subscriber!.next('text-1c');
    expect(translation()).toEqual('text-1c');
    expect(textCaptor1.destroyed).toBeUndefined();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Change key to text-2.
    key.set('%key-2');
    expect(translation()).toEqual('text-2a');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-2.
    textCaptor2.subscriber!.next('text-2b');
    expect(translation()).toEqual('text-2b');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-2.
    textCaptor2.subscriber!.next('text-2c');
    expect(translation()).toEqual('text-2c');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Provide text from previous observable.
    // Update text-1.
    textCaptor1.subscriber!.next('text-1d');
    expect(translation()).toEqual('text-2c');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();
  });

  it('should return text as is if `undefined`', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => 'UNEXPECTED'),
      ],
    });

    const text1 = text(undefined, {injector: TestBed.inject(Injector)});
    expect(text1()).toBeUndefined();

    const text2 = text(signal(undefined), {injector: TestBed.inject(Injector)});
    expect(text2()).toBeUndefined();
  });

  it('should return text as is if not starting with "%"', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => 'UNEXPECTED'),
      ],
    });

    const translation = text('key', {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('key');
  });

  it('should return text as is if \'%\'', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => 'UNEXPECTED'),
      ],
    });

    const translation = text('%', {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('%');
  });

  it('should return text as is if empty', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => 'UNEXPECTED'),
      ],
    });

    const translation = text('', {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('');
  });

  it('should return text as is if not found', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => undefined),
      ],
    });

    const translation = text('%key', {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('%key');
  });

  it('should return text as is if found but empty', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => ''),
      ],
    });

    const translation = text('%key', {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('');
  });

  it('should return text as is if no text provider is configured', () => {
    const translation = text('%key', {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('%key');
  });

  it('should support passing key as signal, invoking function anew only on key change', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(key => {
          textProviderFunctionCallCount++;
          return computed(() => `key=${key}, text=${texts[key as keyof typeof texts]()}`);
        }),
      ],
    });

    const texts = {
      'key-1': signal('text-1'),
      'key-2': signal('text-2'),
    };
    const key = signal<'%key-1' | '%key-2'>('%key-1');

    let textProviderFunctionCallCount = 0;

    // Get text.
    const translation = text(key, {injector: TestBed.inject(Injector)});
    expect(translation()).toEqual('key=key-1, text=text-1');
    expect(textProviderFunctionCallCount).toBe(1);

    // Provide different text.
    texts['key-1'].set('text-1a');
    expect(translation()).toEqual('key=key-1, text=text-1a');
    expect(textProviderFunctionCallCount).toBe(1);

    // Change key.
    key.set('%key-2');
    expect(translation()).toEqual('key=key-2, text=text-2');
    expect(textProviderFunctionCallCount).toBe(2);

    // Provide different text.
    texts['key-2'].set('text-2a');
    expect(translation()).toEqual('key=key-2, text=text-2a');
    expect(textProviderFunctionCallCount).toBe(2);

    // Provide different text on previous signal.
    texts['key-1'].set('text-1b');
    expect(translation()).toEqual('key=key-2, text=text-2a');
    expect(textProviderFunctionCallCount).toBe(2);
  });

  it('should support multiple text providers', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(
          key => texts1[key] && `[provider-1] key=${key}, text=${texts1[key]}`,
          key => texts2[key] && `[provider-2] key=${key}, text=${texts2[key]}`,
        ),
      ],
    });

    const texts1: Record<string, string> = {
      'key-1': 'text-1',
      'key-2': 'text-2',
    };

    const texts2: Record<string, string> = {
      'key-1': 'TEXT-1',
      'key-3': 'TEXT-3',
      'key-4': 'TEXT-4',
    };

    // Get text for key-1.
    const text1 = text('%key-1', {injector: TestBed.inject(Injector)});
    expect(text1()).toEqual('[provider-1] key=key-1, text=text-1');

    // Get text for key-2.
    const text2 = text('%key-2', {injector: TestBed.inject(Injector)});
    expect(text2()).toEqual('[provider-1] key=key-2, text=text-2');

    // Get text for key-3.
    const text3 = text('%key-3', {injector: TestBed.inject(Injector)});
    expect(text3()).toEqual('[provider-2] key=key-3, text=TEXT-3');

    // Get text for key-4.
    const text4 = text('%key-4', {injector: TestBed.inject(Injector)});
    expect(text4()).toEqual('[provider-2] key=key-4, text=TEXT-4');
  });

  it('should invoke text provider in injection context', () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => {
          injector = inject(Injector);
          return undefined;
        }),
      ],
    });

    text('%key', {injector: TestBed.inject(Injector)})();
    expect(injector).toBeDefined();
  });

  it('should destroy injection context', () => {
    let destroyed = false;

    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(() => {
          inject(DestroyRef).onDestroy(() => destroyed = true);
          return undefined;
        }),
      ],
    });

    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    text('%key', {injector})();
    expect(destroyed).toBeFalse();

    // Destroy injection context.
    injector.destroy();
    expect(destroyed).toBeTrue();
  });
});

describe('Workbench Text Provider', () => {

  it('should provide workbench text', () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });

    const translated = text('%workbench.close.action', {injector: TestBed.inject(Injector)});
    expect(translated()).toEqual('Close');
  });

  it('should provide custom text', () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: (key: string) => {
            if (key.startsWith('workbench.')) {
              return undefined;
            }
            return `Custom Text for "${key}"`;
          },
        }),
      ],
    });

    const text1 = text('%custom_text', {injector: TestBed.inject(Injector)});
    expect(text1()).toEqual('Custom Text for "custom_text"');

    const text2 = text('%workbench.close.action', {injector: TestBed.inject(Injector)});
    expect(text2()).toEqual('Close');
  });
});

function provideTextProvider(...textProviders: WorkbenchTextProviderFn[]): EnvironmentProviders {
  return makeEnvironmentProviders(textProviders.map(textProvider => ({
    provide: WORKBENCH_TEXT_PROVIDER,
    useValue: textProvider,
    multi: true,
  })));
}
