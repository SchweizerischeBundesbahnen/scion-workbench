/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, inject, signal} from '@angular/core';
import {synchronizeCssClasses} from './css-class.util';
import {TestBed} from '@angular/core/testing';

describe('CssClass.synchronizeCssClasses', () => {

  it('should track changes to the provided CSS classes and apply them to the given element', () => {
    @Component({
      selector: 'spec-testee',
      template: '',
    })
    class TestComponent {
      public cssClasses = signal<string[]>([]);

      @HostBinding('class.static')
      public staticCssClass = true;

      constructor() {
        const host = inject(ElementRef<HTMLElement>).nativeElement;
        synchronizeCssClasses(host, this.cssClasses);
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    const cssClasses = fixture.componentRef.instance.cssClasses;

    cssClasses.set(['test-1']);
    fixture.detectChanges();
    expect(fixture.debugElement.classes).toEqual({'static': true, 'test-1': true});

    cssClasses.set(['test-1', 'test-2']);
    fixture.detectChanges();
    expect(fixture.debugElement.classes).toEqual({'static': true, 'test-1': true, 'test-2': true});

    cssClasses.set(['test-3']);
    fixture.detectChanges();
    expect(fixture.debugElement.classes).toEqual({'static': true, 'test-3': true});
  });
});
