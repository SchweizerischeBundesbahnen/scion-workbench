/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {withComponentContent} from '../testing/test.component';
import {WorkbenchComponent} from '../workbench.component';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {Component} from '@angular/core';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchDesktopDirective} from './desktop.directive';

describe('Desktop', () => {

  describe('Layout with main area', () => {

    it('should display desktop', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            mainAreaInitialPartId: 'part.initial',
            layout: factory => factory.addPart(MAIN_AREA),
          }),
          provideRouter([
            {
              path: 'test-view',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('View')],
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template wbDesktop>
              <div class="desktop">Desktop</div>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, WorkbenchDesktopDirective],
      })
      class SpecRootComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();
      const wbRouter = TestBed.inject(WorkbenchRouter);

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport > div.desktop')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] wb-part[data-partid="part.initial"]'))).toBeNull();

      // Open view
      await wbRouter.navigate(['/test-view']);
      await waitUntilStable();

      // Expect desktop not to display
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport > div.desktop'))).toBeNull();
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] wb-part[data-partid="part.initial"]'))).not.toBeNull();

      // Close view
      await wbRouter.navigate(['/test-view'], {close: true});
      await waitUntilStable();

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport > div.desktop')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] wb-part[data-partid="part.initial"]'))).toBeNull();
    });

    /** @deprecated since version 19.0.0-beta.2. No longer required with the removal of legacy start page support. */
    it('should display start page [deprecated]', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            mainAreaInitialPartId: 'part.initial',
            layout: factory => factory.addPart(MAIN_AREA),
          }),
          provideRouter([
            {
              path: '',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('Desktop')],
            },
            {
              path: 'test-view',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('View')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();
      const wbRouter = TestBed.inject(WorkbenchRouter);

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] wb-part[data-partid="part.initial"]'))).toBeNull();

      // Open view
      await wbRouter.navigate(['/test-view']);
      await waitUntilStable();

      // Expect desktop not to display
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport > router-outlet'))).toBeNull();
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] wb-part[data-partid="part.initial"]'))).not.toBeNull();

      // Close view
      await wbRouter.navigate(['/test-view'], {close: true});
      await waitUntilStable();

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] wb-part[data-partid="part.initial"]'))).toBeNull();
    });

    it('should overflow desktop if exceeding available vertical space', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            mainAreaInitialPartId: 'part.initial',
            layout: factory => factory.addPart(MAIN_AREA),
          }),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template wbDesktop>
              <div class="desktop">Desktop</div>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, WorkbenchDesktopDirective],
      })
      class SpecRootComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      fixture.debugElement.nativeElement.style.height = '500px';
      await waitUntilWorkbenchStarted();

      // Change height of desktop to 5000px
      fixture.debugElement.query(By.css('div.desktop')).nativeElement.style.height = '5000px';

      // Expect desktop not to exceed 500px
      expect(getComputedStyle(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport')).nativeElement as HTMLElement).height).toEqual('500px');
    });

    /** @deprecated since version 19.0.0-beta.2. No longer required with the removal of legacy start page support. */
    it('should overflow start page if exceeding available vertical space [deprecated]', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory.addPart(MAIN_AREA),
          }),
          provideRouter([
            {
              path: '',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('Desktop')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      fixture.debugElement.nativeElement.style.height = '500px';
      await waitUntilWorkbenchStarted();

      // Change height of desktop to 5000px
      fixture.debugElement.query(By.css('spec-test-component')).nativeElement.style.height = '5000px';

      // Expect desktop not to exceed 500px
      expect(getComputedStyle(fixture.debugElement.query(By.css('wb-part[data-partid="part.main-area"] > sci-viewport')).nativeElement as HTMLElement).height).toEqual('500px');
    });
  });

  describe('Layout without main area', () => {

    it('should display desktop', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory.addPart('part.part'),
          }),
          provideRouter([
            {
              path: 'test-view',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('View')],
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template wbDesktop>
              <div class="desktop">Desktop</div>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, WorkbenchDesktopDirective],
      })
      class SpecRootComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();
      const wbRouter = TestBed.inject(WorkbenchRouter);

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop > div.desktop')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-layout wb-part[data-partid="part.part"]'))).toBeNull();

      // Open view
      await wbRouter.navigate(['/test-view'], {target: 'view.100'});
      await waitUntilStable();

      // Expect desktop not to display
      expect(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop > div.desktop'))).toBeNull();
      expect(fixture.debugElement.query(By.css('wb-layout wb-part[data-partid="part.part"]'))).not.toBeNull();

      // Close view
      await wbRouter.navigate([], {target: 'view.100', close: true});
      await waitUntilStable();

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop > div.desktop')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-layout wb-part[data-partid="part.part"]'))).toBeNull();
    });

    /** @deprecated since version 19.0.0-beta.2. No longer required with the removal of legacy start page support. */
    it('should display start page [deprecated]', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory.addPart('part.part'),
          }),
          provideRouter([
            {
              path: '',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('Desktop')],
            },
            {
              path: 'test-view',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('View')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();
      const wbRouter = TestBed.inject(WorkbenchRouter);

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-layout wb-part[data-partid="part.part"]'))).toBeNull();

      // Open view
      await wbRouter.navigate(['test-view'], {target: 'view.100'});
      await waitUntilStable();

      // Expect desktop not to display
      expect(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop > router-outlet + spec-test-component'))).toBeNull();
      expect(fixture.debugElement.query(By.css('wb-layout wb-part[data-partid="part.part"]'))).not.toBeNull();

      // Close view
      await wbRouter.navigate([], {target: 'view.100', close: true});
      await waitUntilStable();

      // Expect desktop to display
      expect(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Desktop');
      expect(fixture.debugElement.query(By.css('wb-layout wb-part[data-partid="part.part"]'))).toBeNull();
    });

    it('should overflow desktop if exceeding available vertical space ', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory.addPart('part.part'),
          }),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template wbDesktop>
              <div class="desktop">Desktop</div>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, WorkbenchDesktopDirective],
      })
      class SpecRootComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      fixture.debugElement.nativeElement.style.height = '500px';
      await waitUntilWorkbenchStarted();

      // Change height of desktop to 5000px
      fixture.debugElement.query(By.css('div.desktop')).nativeElement.style.height = '5000px';

      // Expect desktop not to exceed 500px
      expect(getComputedStyle(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop')).nativeElement as HTMLElement).height).toEqual('500px');
    });

    /** @deprecated since version 19.0.0-beta.2. No longer required with the removal of legacy start page support. */
    it('should overflow start page if exceeding available vertical space [deprecated]', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory.addPart('part.part'),
          }),
          provideRouter([
            {
              path: '',
              loadComponent: () => import('../testing/test.component'),
              providers: [withComponentContent('Desktop')],
            },
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      fixture.debugElement.nativeElement.style.height = '500px';
      await waitUntilWorkbenchStarted();

      // Change height of desktop to 5000px
      fixture.debugElement.query(By.css('spec-test-component')).nativeElement.style.height = '5000px';

      // Expect desktop not to exceed 500px
      expect(getComputedStyle(fixture.debugElement.query(By.css('wb-layout sci-viewport.e2e-desktop')).nativeElement as HTMLElement).height).toEqual('500px');
    });
  });
});
