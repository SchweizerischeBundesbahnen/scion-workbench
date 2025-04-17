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
import {Component, EnvironmentProviders, input, makeEnvironmentProviders, signal, WritableSignal} from '@angular/core';
import {ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {WORKBENCH_TEXT_PROVIDER, WorkbenchTextProviderFn} from './workbench-text-provider.model';
import {TextPipe} from './text.pipe';
import {toSignal} from '@angular/core/rxjs-interop';
import {Observable, Subscriber} from 'rxjs';

describe('Text Pipe', () => {

  it('should provide text', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(key => texts[key as 'key-1' | 'key-2']),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const texts: Record<'key-1' | 'key-2', WritableSignal<string>> = {
      'key-1': signal('text-1'),
      'key-2': signal('text-2'),
    };

    @Component({
      selector: 'spec-testee',
      template: '{{(key() | wbText)()}}',
      imports: [
        TextPipe,
      ],
    })
    class SpecRootComponent {
      public key = input<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Get text for key-1.
    fixture.componentRef.setInput('key', '%key-1');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-1');

    // Update text for key-1.
    texts['key-1'].set('TEXT-1');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('TEXT-1');

    // Get text for key-2.
    fixture.componentRef.setInput('key', '%key-2');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-2');

    // Update text for key-2.
    texts['key-2'].set('TEXT-2');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('TEXT-2');
  });

  it('should support observable as text provider using `toSignal`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTextProvider(key => texts[key] ? toSignal(texts[key], {requireSync: true}) : undefined),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-testee',
      template: '{{(key() | wbText)()}}',
      imports: [
        TextPipe,
      ],
    })
    class SpecRootComponent {
      public key = input<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    const textCaptor1 = {
      subscriber: undefined as unknown as Subscriber<string>,
      destroyed: undefined as true | undefined,
    };
    const textCaptor2 = {
      subscriber: undefined as unknown as Subscriber<string>,
      destroyed: undefined as true | undefined,
    };

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

    fixture.componentRef.setInput('key', '%key-1');
    await fixture.whenStable();

    // Get text-1.
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-1a');
    expect(textCaptor1.destroyed).toBeUndefined();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-1.
    textCaptor1.subscriber.next('text-1b');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-1b');
    expect(textCaptor1.destroyed).toBeUndefined();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-1.
    textCaptor1.subscriber.next('text-1c');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-1c');
    expect(textCaptor1.destroyed).toBeUndefined();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Change key to text-2.
    fixture.componentRef.setInput('key', '%key-2');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-2a');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-2.
    textCaptor2.subscriber.next('text-2b');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-2b');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Update text-2.
    textCaptor2.subscriber.next('text-2c');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-2c');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();

    // Provide text from previous observable.
    // Update text-1.
    textCaptor1.subscriber.next('text-1d');
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement.innerText).toEqual('text-2c');
    expect(textCaptor1.destroyed).toBeTrue();
    expect(textCaptor2.destroyed).toBeUndefined();
  });
});

function provideTextProvider(textProvider: WorkbenchTextProviderFn): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: WORKBENCH_TEXT_PROVIDER,
    useValue: textProvider,
    multi: true,
  }]);
}
