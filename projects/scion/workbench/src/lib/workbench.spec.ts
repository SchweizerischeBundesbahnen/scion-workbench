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
import {provideWorkbenchForTest} from './testing/workbench.provider';
import {waitUntilWorkbenchStarted} from './testing/testing.util';
import {Arrays} from '@scion/toolkit/util';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('Workbench', () => {

  it(`should error if not calling 'provideWorkbench()' before adding workbench component`, () => {
    TestBed.configureTestingModule({});
    expect(() => TestBed.createComponent(WorkbenchComponent)).toThrowError(`[WorkbenchError] Missing required workbench providers. Did you forget to call 'provideWorkbench()' in the providers array of 'bootstrapApplication' or the root 'NgModule'?`);
  });

  it(`should error if not calling 'provideWorkbench()' before starting the workbench`, () => {
    TestBed.configureTestingModule({});
    expect(() => TestBed.inject(WorkbenchLauncher).launch()).toThrowError(`[WorkbenchError] Missing required workbench providers. Did you forget to call 'provideWorkbench()' in the providers array of 'bootstrapApplication' or the root 'NgModule'?`);
  });

  /**
   * This test:
   * - Asserts the document root element to be positioned to support `@scion/toolkit/observable/fromBoundingClientRect$` for observing element bounding boxes.
   * - Asserts the document root to be aligned with the page viewport so the top-level positioning context fills the page viewport (as expected by applications).
   */
  it('should position document root element (html) and fill page viewport', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });
    const fixture = TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    // Expect document root to be positioned and to fill the page viewport.
    expect(getComputedStyle(document.documentElement)).toEqual(jasmine.objectContaining({
      position: 'absolute',
      inset: '0px',
    }));

    // Align workbench element with page viewport.
    const element = fixture.debugElement.nativeElement as HTMLElement;
    element.style.position = 'absolute';
    element.style.inset = '0';

    // Expect workbench element to fill page viewport.
    expect(getComputedStyle(element)).toEqual(jasmine.objectContaining({
      width: `${document.documentElement.clientWidth}px`,
      height: `${document.documentElement.clientHeight}px`,
    }));
  });

  it('should allow overriding positioning of document root element (html)', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });
    const fixture = TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    // Override positioning of root element.
    const styleSheet = new CSSStyleSheet();
    styleSheet.insertRule(`
    html {
      position: relative;
      height: 100%;
    }`);
    document.adoptedStyleSheets.push(styleSheet);

    // Expect overrides to be applied.
    expect(getComputedStyle(document.documentElement)).toEqual(jasmine.objectContaining({
      position: 'relative',
    }));

    // Align workbench element with page viewport.
    const element = fixture.debugElement.nativeElement as HTMLElement;
    element.style.position = 'absolute';
    element.style.inset = '0';

    // Expect workbench element to fill page viewport.
    expect(getComputedStyle(element)).toEqual(jasmine.objectContaining({
      width: `${document.documentElement.clientWidth}px`,
      height: `${document.documentElement.clientHeight}px`,
    }));

    fixture.componentRef.onDestroy(() => Arrays.remove(document.adoptedStyleSheets, styleSheet));
  });

  it('should allow positioning the workbench element', async () => {
    @Component({
      selector: 'spec-testee',
      template: '<wb-workbench/>',
      imports: [WorkbenchComponent],
      styles: `
        wb-workbench {
          position: absolute;
          inset: 10px;
        }`,
    })
    class SpecRootComponent {
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });
    const fixture = TestBed.createComponent(SpecRootComponent);
    await waitUntilWorkbenchStarted();
    const workbenchElement = fixture.debugElement.query(By.directive(WorkbenchComponent)).nativeElement as HTMLElement;

    // Expect the workbench element to be positioned absolute.
    expect(getComputedStyle(workbenchElement)).toEqual(jasmine.objectContaining({
      position: 'absolute',
      inset: '10px',
    }));
  });

  it('should position the workbench element relative by default', async () => {
    @Component({
      selector: 'spec-testee',
      template: '<wb-workbench/>',
      imports: [WorkbenchComponent],
    })
    class SpecRootComponent {
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });
    const fixture = TestBed.createComponent(SpecRootComponent);
    await waitUntilWorkbenchStarted();
    const workbenchElement = fixture.debugElement.query(By.directive(WorkbenchComponent)).nativeElement as HTMLElement;

    // Expect the workbench element to be positioned relative (by default in order to form a positioning context).
    expect(getComputedStyle(workbenchElement)).toEqual(jasmine.objectContaining({
      position: 'relative',
    }));

    // Add constructable stylesheet to position the element with low priority.
    const styleSheet = new CSSStyleSheet();
    document.adoptedStyleSheets.push(styleSheet);

    // Position the workbench element.
    styleSheet.insertRule('wb-workbench { position: absolute');

    // Expect the workbench element to be positioned absolute.
    expect(getComputedStyle(workbenchElement)).toEqual(jasmine.objectContaining({position: 'absolute'}));

    // Remove positioning of the workbench element.
    styleSheet.deleteRule(0);

    // Cleanup
    Arrays.remove(document.adoptedStyleSheets, styleSheet);
  });
});
