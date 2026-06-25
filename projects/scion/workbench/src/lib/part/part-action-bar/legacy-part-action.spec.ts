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
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {styleFixture, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchService} from '../../workbench.service';
import {Component, inject, InjectionToken, Injector, input, signal, TemplateRef, viewChild} from '@angular/core';
import {toShowCustomMatcher} from '../../testing/jasmine/matcher/to-show.matcher';
import {toEqualToolbarCustomMatcher} from '../../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {ToolbarPO} from '../../testing/jasmine/matcher/toolbar.po';
import {By} from '@angular/platform-browser';
import {toBeAttachedCustomMatcher} from '../../testing/jasmine/matcher/to-be-attached.matcher';
import {provideRouter} from '@angular/router';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {toBeVisibleCustomMatcher} from '../../testing/jasmine/matcher/to-be-visible.matcher';
import {WorkbenchDialogService} from '../../dialog/workbench-dialog.service';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {WorkbenchPartActionDirective} from '../../part/part-action-bar/part-action.directive';

describe('LegacyPartAction', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
    jasmine.addAsyncMatchers(toBeAttachedCustomMatcher);
    jasmine.addAsyncMatchers(toBeVisibleCustomMatcher);
  });

  it('should retain order when updating action', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.part')
            .navigatePart('part.part', ['test-part']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Register action 1.
    TestBed.inject(WorkbenchService).registerPartAction(() => ({
      content: SpecActionComponent,
      cssClass: 'action-1',
    }));

    // Register action 2.
    const cssClassAction2 = signal<string>('action-2');
    TestBed.inject(WorkbenchService).registerPartAction(() => ({
      content: SpecActionComponent,
      cssClass: cssClassAction2(),
    }));

    // Register action 3.
    TestBed.inject(WorkbenchService).registerPartAction(() => ({
      content: SpecActionComponent,
      cssClass: 'action-3',
    }));

    const toolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'action-1',
      },
      {
        type: 'menu-item',
        cssClass: 'action-2',
      },
      {
        type: 'menu-item',
        cssClass: 'action-3',
      },
    ]);

    // Change CSS class of action 2.
    cssClassAction2.set('ACTION-2');
    await fixture.whenStable();

    // Expect order to be retained.
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'action-1',
      },
      {
        type: 'menu-item',
        cssClass: 'ACTION-2',
      },
      {
        type: 'menu-item',
        cssClass: 'action-3',
      },
    ]);
  });

  it('should re-construct action when tracked signals change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.part')
            .navigatePart('part.part', ['path/to/part']),
        }),
      ],
    });

    @Component({
      selector: 'spec-action',
      template: 'Component Action',
    })
    class SpecActionComponent {
      public input1 = input.required<string>();
      public input2 = input.required<string>();
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const input1 = signal<string>('value 1');
    const input2 = signal<string>('value 2');

    // Register action.
    TestBed.inject(WorkbenchService).registerPartAction(() => ({
      content: SpecActionComponent,
      inputs: {
        input1: input1(),
        input2: input2(),
      },
      cssClass: 'testee',
    }));
    await fixture.whenStable();

    const actionSelector = By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] sci-toolbar-control.testee spec-action');

    // Expect initial inputs.
    const actionComponent1 = fixture.debugElement.query(actionSelector).componentInstance as SpecActionComponent;
    expect(actionComponent1.input1()).toEqual('value 1');
    expect(actionComponent1.input2()).toEqual('value 2');

    // Change input.
    input1.set('value 3');
    await fixture.whenStable();
    const actionComponent2 = fixture.debugElement.query(actionSelector).componentInstance as SpecActionComponent;
    expect(actionComponent2).not.toBe(actionComponent1);
    expect(actionComponent2.input1()).toEqual('value 3');
    expect(actionComponent2.input2()).toEqual('value 2');

    // Change input.
    input2.set('value 4');
    await fixture.whenStable();
    const actionComponent3 = fixture.debugElement.query(actionSelector).componentInstance as SpecActionComponent;
    expect(actionComponent3).not.toBe(actionComponent2);
    expect(actionComponent3.input1()).toEqual('value 3');
    expect(actionComponent3.input2()).toEqual('value 4');
  });

  it('should align action', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.part')
            .navigatePart('part.part', ['path/to/part']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const align = signal<'start' | 'end' | undefined>(undefined);

    // Register action.
    TestBed.inject(WorkbenchService).registerPartAction(() => ({
      content: SpecActionComponent,
      cssClass: 'testee',
      align: align(),
    }));
    await fixture.whenStable();

    const partTabbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.tabbar"]`});
    const partToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Expect default alignment.
    await expectAsync(partTabbar).toEqualToolbar([]);
    await expectAsync(partToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);

    // Align action to the left.
    align.set('start');
    await expectAsync(partTabbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(partToolbar).toEqualToolbar([]);

    // Align action to the right.
    align.set('end');
    await expectAsync(partTabbar).toEqualToolbar([]);
    await expectAsync(partToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
  });

  it(`should run factory function in the part's injection context`, async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .navigatePart('part.left', ['test-part'])
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.right', ['test-part']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);

    // Register action.
    TestBed.inject(WorkbenchService).registerPartAction(() => {
      const part = inject(WorkbenchPart);
      if (partFilter() && partFilter() !== part.id) {
        return null;
      }

      return {
        content: SpecActionComponent,
        cssClass: 'testee',
      };
    });

    const leftPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Contribute action to all parts.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(() => rightPartToolbar.debugElement).not.toBeVisible();

    // Contribute action to the right part.
    partFilter.set('part.right');
    await expectAsync(() => leftPartToolbar.debugElement).not.toBeVisible();
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
  });

  it('should pass the part to the factory function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .navigatePart('part.left', ['test-part'])
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.right', ['test-part']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);

    // Register action.
    TestBed.inject(WorkbenchService).registerPartAction(part => {
      if (partFilter() && partFilter() !== part.id) {
        return null;
      }

      return {
        content: SpecActionComponent,
        cssClass: 'testee',
      };
    });

    const leftPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

    // Contribute action to all parts.
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
    await expectAsync(() => rightPartToolbar.debugElement).not.toBeVisible();

    // Contribute action to the right part.
    partFilter.set('part.right');
    await expectAsync(() => leftPartToolbar.debugElement).not.toBeVisible();
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'testee',
      },
    ]);
  });

  it('should construct part action in part injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
            .navigatePart('part.activity', ['path/to/part'])
            .activatePart('part.activity'),
        }),
        provideRouter([
          {path: 'path/to/part', loadComponent: () => SpecPartComponent},
        ]),
      ],
    });

    @Component({
      selector: 'spec-dialog',
      template: 'Dialog',
    })
    class SpecDialogComponent {
    }

    @Component({
      selector: 'spec-part-action',
      template: 'Part Action',
      host: {
        '(click)': 'onClick()',
      },
    })
    class SpecPartActionComponent {

      private _dialogService = inject(WorkbenchDialogService);

      protected onClick(): void {
        void this._dialogService.open(SpecDialogComponent);
      }
    }

    @Component({
      selector: 'spec-part',
      template: '<ng-template wbPartAction><spec-part-action/></ng-template>',
      imports: [
        SpecPartActionComponent,
        WorkbenchPartActionDirective,
      ],
    })
    class SpecPartComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Click part action.
    const partActionComponent = fixture.debugElement.query(By.directive(SpecPartActionComponent)).nativeElement as HTMLElement;
    partActionComponent.click();
    await fixture.whenStable();

    // Expect dialog to display.
    expect(body).toShow(SpecDialogComponent);

    // Close docked part.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.1'));
    await fixture.whenStable();

    // Expect dialog not to display.
    expect(body).not.toShow(SpecDialogComponent);

    // Open docked part.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.1'));
    await fixture.whenStable();

    // Expect dialog to display.
    expect(body).toShow(SpecDialogComponent);
  });

  it('should construct part action in view injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.1', {partId: 'part.main'})
            .addView('view.2', {partId: 'part.main'})
            .navigateView('view.1', ['path/to/view'])
            .navigateView('view.2', ['path/to/view'])
            .activateView('view.1'),
        }),
        provideRouter([
          {path: 'path/to/view', loadComponent: () => SpecViewComponent},
        ]),
      ],
    });

    @Component({
      selector: 'spec-dialog',
      template: 'Dialog',
    })
    class SpecDialogComponent {
    }

    @Component({
      selector: 'spec-part-action',
      template: 'Part Action',
      host: {
        '(click)': 'onClick()',
      },
    })
    class SpecPartActionComponent {

      private _dialogService = inject(WorkbenchDialogService);

      protected onClick(): void {
        void this._dialogService.open(SpecDialogComponent);
      }
    }

    @Component({
      selector: 'spec-view',
      template: '<ng-template wbPartAction><spec-part-action/></ng-template>',
      imports: [
        SpecPartActionComponent,
        WorkbenchPartActionDirective,
      ],
    })
    class SpecViewComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Click part action.
    const partActionComponent = fixture.debugElement.query(By.directive(SpecPartActionComponent)).nativeElement as HTMLElement;
    partActionComponent.click();
    await fixture.whenStable();

    // Expect dialog to display.
    expect(body).toShow(SpecDialogComponent);

    // Activate view.2.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await fixture.whenStable();

    // Expect dialog not to display.
    expect(body).not.toShow(SpecDialogComponent);

    // Activate view.1.
    await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await fixture.whenStable();

    // Expect dialog to display.
    expect(body).toShow(SpecDialogComponent);
  });

  describe('Template PartAction', () => {

    it('should render action provided as template', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #action>
              Template Action
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent],
      })
      class SpecRootComponent {
        public actionTemplate = viewChild.required<TemplateRef<void>>('action');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Register action.
      const action1 = TestBed.inject(WorkbenchService).registerPartAction(() => fixture.componentInstance.actionTemplate());
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] wb-part-action')).nativeElement.innerText).toEqual('Template Action');

      // Dispose action.
      action1.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] wb-part-action'))).toBeNull();

      // Register action via object literal.
      const action2 = TestBed.inject(WorkbenchService).registerPartAction(() => ({content: fixture.componentInstance.actionTemplate()}));
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action')).nativeElement.innerText).toEqual('Template Action');

      // Dispose action.
      action2.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] wb-part-action'))).toBeNull();
    });

    it('should pass inputs to template action', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #action let-input1="input1" let-input2="input2">
              Template Action [input1="{{input1}}", input2="{{input2}}"]
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent],
      })
      class SpecRootComponent {
        public actionTemplate = viewChild.required<TemplateRef<void>>('action');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: fixture.componentInstance.actionTemplate(),
        cssClass: 'testee',
        inputs: {
          input1: 'value 1',
          input2: 'value 2',
        },
      }));
      await fixture.whenStable();

      // Expect inputs to be available as local template let declarations.
      const partActionSelector = By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] sci-toolbar-control.testee wb-part-action');
      expect(fixture.debugElement.query(partActionSelector).nativeElement.innerText).toEqual('Template Action [input1="value 1", input2="value 2"]');
    });

    it('should allow for custom injector for template action', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-action',
        template: 'Component Action',
      })
      class SpecActionComponent {
        public injector = inject(Injector);
      }

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #action>
              <spec-action/>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, SpecActionComponent],
      })
      class SpecRootComponent {
        public actionTemplate = viewChild.required<TemplateRef<void>>('action');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Create custom injector.
      const diToken = new InjectionToken('token');
      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          {provide: diToken, useValue: 'value'},
        ],
      });

      const toolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: fixture.componentInstance.actionTemplate(),
        cssClass: 'testee',
        injector,
      }));
      await fixture.whenStable();

      // Expect DI token to be available.
      const actionComponent = toolbar.control({cssClass: 'testee'}).component('wb-part-action')!.query(By.css('spec-action')).componentInstance as SpecActionComponent;
      expect(actionComponent.injector.get(diToken)).toEqual('value');

      // Expect part can be injected.
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part')!);
    });

    it('should provide `WorkbenchPart` as default template-local variable in template action', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-action',
        template: 'Component Action',
      })
      class SpecActionComponent {
        public injector = inject(Injector);
        public defaultLocalTemplateVariable = input<unknown>();
      }

      @Component({
        selector: 'spec-root',
        template: `
          <wb-workbench>
            <ng-template #action let-part>
              <spec-action [defaultLocalTemplateVariable]="part"/>
            </ng-template>
          </wb-workbench>
        `,
        styles: `
          :host {
            display: grid;
          }
        `,
        imports: [WorkbenchComponent, SpecActionComponent],
      })
      class SpecRootComponent {
        public actionTemplate = viewChild.required<TemplateRef<void>>('action');
      }

      const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));
      await waitUntilWorkbenchStarted();

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: fixture.componentInstance.actionTemplate(),
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] sci-toolbar-control.testee wb-part-action spec-action')).componentInstance as SpecActionComponent;

      // Expect WorkbenchPart to be passed as default local template variable.
      expect(actionComponent.defaultLocalTemplateVariable()).toBe(TestBed.inject(WorkbenchService).getPart('part.part'));

      // Expect WorkbenchPart can be injected.
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part')!);
    });
  });

  describe('Component PartAction', () => {

    it('should render action provided as component', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-action',
        template: 'Component Action',
      })
      class SpecActionComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register action.
      const action1 = TestBed.inject(WorkbenchService).registerPartAction(() => SpecActionComponent);
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] spec-action')).nativeElement.innerText).toEqual('Component Action');

      // Dispose action.
      action1.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] spec-action'))).toBeNull();

      // Register action via object literal.
      const action2 = TestBed.inject(WorkbenchService).registerPartAction(() => ({content: SpecActionComponent}));
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] spec-action')).nativeElement.innerText).toEqual('Component Action');

      // Dispose action.
      action2.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] spec-action'))).toBeNull();
    });

    it('should pass inputs to component action', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-action',
        template: 'Component Action',
      })
      class SpecActionComponent {
        public input1 = input.required<string>();
        public input2 = input.required<string>();
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: SpecActionComponent,
        cssClass: 'testee',
        inputs: {
          input1: 'value 1',
          input2: 'value 2',
        },
      }));
      await fixture.whenStable();

      // Expect action to render.
      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] sci-toolbar-control.testee spec-action')).componentInstance as SpecActionComponent;
      expect(actionComponent.input1()).toEqual('value 1');
      expect(actionComponent.input2()).toEqual('value 2');
    });

    it('should allow for custom injector for component action', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-action',
        template: 'Component Action',
      })
      class SpecActionComponent {
        public injector = inject(Injector);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Create custom injector.
      const diToken = new InjectionToken('token');
      const injector = Injector.create({
        parent: TestBed.inject(Injector),
        providers: [
          {provide: diToken, useValue: 'value'},
        ],
      });

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: SpecActionComponent,
        cssClass: 'testee',
        injector,
      }));
      await fixture.whenStable();

      const toolbar = new ToolbarPO(fixture, {selector: `wb-part[data-partid="part.part"] sci-toolbar[name="toolbar:workbench.part.toolbar"]`});

      // Expect DI token to be available.
      const actionComponent = toolbar.control({cssClass: 'testee'}).component('spec-action')!.componentInstance as SpecActionComponent;
      expect(actionComponent.injector.get(diToken)).toEqual('value');

      // Expect part can be injected.
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part')!);
    });

    it('should provide `WorkbenchPart` for injection in component action', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.part')
              .navigatePart('part.part', ['path/to/part']),
          }),
        ],
      });

      @Component({
        selector: 'spec-action',
        template: 'Component Action',
      })
      class SpecActionComponent {
        public injector = inject(Injector);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: SpecActionComponent,
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      // Expect WorkbenchPart can be injected.
      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar sci-toolbar[name="toolbar:workbench.part.toolbar"] sci-toolbar-control.testee spec-action')).componentInstance as SpecActionComponent;
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part')!);
    });
  });
});

@Component({
  selector: 'spec-action',
  template: 'Action',
})
class SpecActionComponent {
}
