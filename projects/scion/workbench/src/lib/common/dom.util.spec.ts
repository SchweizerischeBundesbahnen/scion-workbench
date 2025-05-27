/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, createEnvironmentInjector, EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Arrays} from '@scion/toolkit/util';
import {positionElement} from './dom.util';
import {waitUntilStable} from '../testing/testing.util';

describe('DOM Util', () => {

  describe('positionElement', () => {

    it('should change position of the element to relative if not positioned', async () => {
      @Component({
        selector: 'spec-testee',
        template: `
          <div class="testee">
            Testee
          </div>`,
      })
      class SpecTesteeComponent {
      }

      const fixture = TestBed.createComponent(SpecTesteeComponent);
      const testee = fixture.debugElement.query(By.css('div.testee')).nativeElement as HTMLElement;
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      // Precondition: Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));

      // Test
      positionElement(testee, {context: 'testee', injector});
      await waitUntilStable();

      // Expect the element to be positioned relative.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'relative'}));

      // Add constructable stylesheet to position the element with low priority.
      const styleSheet = new CSSStyleSheet();
      document.adoptedStyleSheets.push(styleSheet);

      // Position the element absolute.
      styleSheet.insertRule('div.testee {position: absolute;}');

      // Expect the element to be positioned absolute.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'absolute'}));

      // Remove positioning of the element.
      styleSheet.deleteRule(0);

      // Expect the element to be positioned relative.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'relative'}));

      // Destroy injection context.
      injector.destroy();

      // Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));

      // Cleanup
      Arrays.remove(document.adoptedStyleSheets, styleSheet);
    });

    it('should not change position of the element if position is absolute (position: absolute)', async () => {
      @Component({
        selector: 'spec-testee',
        template: `
          <div class="testee">
            Testee
          </div>`,
        styles: `
          div.testee {
            position: absolute;
          }
        `,
      })
      class SpecTesteeComponent {
      }

      const fixture = TestBed.createComponent(SpecTesteeComponent);
      const testee = fixture.debugElement.query(By.css('div.testee')).nativeElement as HTMLElement;
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      // Precondition: Expect the element to be positioned absolute.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'absolute'}));

      // Test
      positionElement(testee, {context: 'testee', injector});
      await waitUntilStable();

      // Expect the element to be positioned absolute.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'absolute'}));

      // Destroy injection context.
      injector.destroy();

      // Expect the element position to not change.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'absolute'}));
    });

    it('should change position of the element to relative if position is unset (position: unset)', async () => {
      @Component({
        selector: 'spec-testee',
        template: `
          <div class="testee">
            Testee
          </div>`,
        styles: `
          div.testee {
            position: unset;
          }
        `,
      })
      class SpecTesteeComponent {
      }

      const fixture = TestBed.createComponent(SpecTesteeComponent);
      const testee = fixture.debugElement.query(By.css('div.testee')).nativeElement as HTMLElement;
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      // Precondition: Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));

      // Test
      positionElement(testee, {context: 'testee', injector});
      await waitUntilStable();

      // Expect the element to be positioned relative.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'relative'}));

      // Destroy injection context.
      injector.destroy();

      // Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));
    });

    it('should change position of the element to relative if position is static (position: static)', async () => {
      @Component({
        selector: 'spec-testee',
        template: `
          <div class="testee">
            Testee
          </div>`,
        styles: `
          div.testee {
            position: static;
          }
        `,
      })
      class SpecTesteeComponent {
      }

      const fixture = TestBed.createComponent(SpecTesteeComponent);
      const testee = fixture.debugElement.query(By.css('div.testee')).nativeElement as HTMLElement;
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      // Precondition: Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));

      // Test
      positionElement(testee, {context: 'testee', injector});
      await waitUntilStable();

      // Expect the element to be positioned relative.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'relative'}));

      // Destroy injection context.
      injector.destroy();

      // Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));
    });

    it('should change position of the element to relative if position is static (via style attribute)', async () => {
      @Component({
        selector: 'spec-testee',
        template: `
          <div class="testee" [style.position]="'static'">
            Testee
          </div>`,
      })
      class SpecTesteeComponent {
      }

      const fixture = TestBed.createComponent(SpecTesteeComponent);
      const testee = fixture.debugElement.query(By.css('div.testee')).nativeElement as HTMLElement;
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      // Precondition: Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));

      // Test
      positionElement(testee, {context: 'testee', injector});
      await waitUntilStable();

      // Expect the element to be positioned relative.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'relative'}));

      // Destroy injection context.
      injector.destroy();

      // Expect the element to be positioned in document element flow.
      expect(getComputedStyle(testee)).toEqual(jasmine.objectContaining({position: 'static'}));
    });
  });
});
