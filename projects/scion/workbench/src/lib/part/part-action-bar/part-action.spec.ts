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
import {styleFixture, waitForInitialWorkbenchLayout} from '../../testing/testing.util';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchService} from '../../workbench.service';
import {Component, effect, inject, InjectionToken, Injector, input, signal, TemplateRef, viewChild} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchPart} from '../workbench-part.model';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {By} from '@angular/platform-browser';

describe('PartAction', () => {

  it('should retain order when updating action', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory.addPart('part.part'),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

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

    const part = TestBed.inject(WorkbenchService).getPart('part.part')!;
    expect(part.actions()).toEqual([
      jasmine.objectContaining({cssClass: 'action-1'}),
      jasmine.objectContaining({cssClass: 'action-2'}),
      jasmine.objectContaining({cssClass: 'action-3'}),
    ]);

    // Change CSS class of action 2.
    cssClassAction2.set('ACTION-2');

    // Expect order to be retained.
    expect(part.actions()).toEqual([
      jasmine.objectContaining({cssClass: 'action-1'}),
      jasmine.objectContaining({cssClass: 'ACTION-2'}),
      jasmine.objectContaining({cssClass: 'action-3'}),
    ]);
  });

  /**
   * This test verifies that a change to tracked signals of an action does not re-create other actions.
   */
  it('should re-construct action only when tracked signals change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'}),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Track actions.
    effect(() => TestBed.inject(WorkbenchService).parts().forEach(part => part.actions()), {injector: TestBed.inject(Injector)});

    const actionConstructCount = {
      'part.left': {
        action1: 0,
        action2: 0,
        action3: 0,
      },
      'part.right': {
        action1: 0,
        action2: 0,
        action3: 0,
      },
    };
    const trackedSignals = {
      'part.left': {
        action1: signal(UUID.randomUUID()),
        action2: signal(UUID.randomUUID()),
        action3: signal(UUID.randomUUID()),
      },
      'part.right': {
        action1: signal(UUID.randomUUID()),
        action2: signal(UUID.randomUUID()),
        action3: signal(UUID.randomUUID()),
      },
    };

    // Register action 1.
    TestBed.inject(WorkbenchService).registerPartAction(part => {
      const partId = part.id as 'part.left' | 'part.right';
      actionConstructCount[partId].action1++;
      trackedSignals[partId].action1();
      return {
        content: SpecActionComponent,
      };
    });

    // Register action 2.
    TestBed.inject(WorkbenchService).registerPartAction(part => {
      const partId = part.id as 'part.left' | 'part.right';
      actionConstructCount[partId].action2++;
      trackedSignals[partId].action2();
      return {
        content: SpecActionComponent,
      };
    });

    TestBed.flushEffects();
    expect(actionConstructCount['part.left']).toEqual({action1: 1, action2: 1, action3: 0});
    expect(actionConstructCount['part.right']).toEqual({action1: 1, action2: 1, action3: 0});

    // Change action 2 contained in the left part.
    trackedSignals['part.left'].action2.set(UUID.randomUUID());
    TestBed.flushEffects();

    // Expect only action 2 in the left part to be re-constructed.
    expect(actionConstructCount['part.left']).toEqual({action1: 1, action2: 2, action3: 0});
    expect(actionConstructCount['part.right']).toEqual({action1: 1, action2: 1, action3: 0});

    // Change action 1 contained in the right part.
    trackedSignals['part.right'].action1.set(UUID.randomUUID());
    TestBed.flushEffects();

    // Expect only action 1 in the right part to be re-constructed.
    expect(actionConstructCount['part.left']).toEqual({action1: 1, action2: 2, action3: 0});
    expect(actionConstructCount['part.right']).toEqual({action1: 2, action2: 1, action3: 0});

    // Register action 3.
    TestBed.inject(WorkbenchService).registerPartAction(() => {
      const partId = inject(WorkbenchPart).id as 'part.left' | 'part.right';
      actionConstructCount[partId].action3++;
      trackedSignals[partId].action3();
      return {
        content: SpecActionComponent,
      };
    });
    TestBed.flushEffects();

    // Expect action 1 and action 2 not to be re-constructed.
    expect(actionConstructCount['part.left']).toEqual({action1: 1, action2: 2, action3: 1});
    expect(actionConstructCount['part.right']).toEqual({action1: 2, action2: 1, action3: 1});
  });

  it('should signal only when actions of a part change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory.addPart('part.part'),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const part = TestBed.inject(WorkbenchService).getPart('part.part')!;
    const actionsRef = part.actions();

    // Register action that matches no part.
    TestBed.inject(WorkbenchService).registerPartAction(() => null);

    // Expect no signal change.
    expect(part.actions()).toBe(actionsRef);
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
    await waitForInitialWorkbenchLayout();

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

    const actionSelector = By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee spec-action');

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
    await waitForInitialWorkbenchLayout();

    const align = signal<'start' | 'end' | undefined>(undefined);

    // Register action.
    TestBed.inject(WorkbenchService).registerPartAction(() => ({
      content: SpecActionComponent,
      cssClass: 'testee',
      align: align(),
    }));
    await fixture.whenStable();

    // Expect default alignment.
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="start"].testee'))).toBeNull();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="end"].testee'))).not.toBeNull();

    // Align action to the left.
    align.set('start');
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="start"].testee'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="end"].testee'))).toBeNull();

    // Align action to the right.
    align.set('end');
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="start"].testee'))).toBeNull();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-action[data-align="end"].testee'))).not.toBeNull();
  });

  it(`should run factory function in the part's injection context`, async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'}),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);
    const leftPart = TestBed.inject(WorkbenchService).getPart('part.left')!;
    const rightPart = TestBed.inject(WorkbenchService).getPart('part.right')!;

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

    // Contribute action to all parts.
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Contribute action to the right part.
    partFilter.set('part.right');
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
  });

  it('should pass the part to the factory function', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'}),
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const partFilter = signal<'part.left' | 'part.right' | undefined>(undefined);
    const leftPart = TestBed.inject(WorkbenchService).getPart('part.left')!;
    const rightPart = TestBed.inject(WorkbenchService).getPart('part.right')!;

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

    // Contribute action to all parts.
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);

    // Contribute action to the left part.
    partFilter.set('part.left');
    expect(leftPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
    expect(rightPart.actions()).toEqual([]);

    // Contribute action to the right part.
    partFilter.set('part.right');
    expect(leftPart.actions()).toEqual([]);
    expect(rightPart.actions()).toEqual([jasmine.objectContaining({cssClass: 'testee'})]);
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
      await waitForInitialWorkbenchLayout();

      // Register action.
      const action1 = TestBed.inject(WorkbenchService).registerPartAction(() => fixture.componentInstance.actionTemplate());
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action')).nativeElement.innerText).toEqual('Template Action');

      // Dispose action.
      action1.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action'))).toBeNull();

      // Register action via object literal.
      const action2 = TestBed.inject(WorkbenchService).registerPartAction(() => ({content: fixture.componentInstance.actionTemplate()}));
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action')).nativeElement.innerText).toEqual('Template Action');

      // Dispose action.
      action2.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action'))).toBeNull();
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
      await waitForInitialWorkbenchLayout();

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
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee')).nativeElement.innerText).toEqual('Template Action [input1="value 1", input2="value 2"]');
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
      await waitForInitialWorkbenchLayout();

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
        content: fixture.componentInstance.actionTemplate(),
        cssClass: 'testee',
        injector,
      }));
      await fixture.whenStable();

      // Expect DI token to be available.
      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee spec-action')).componentInstance as SpecActionComponent;
      expect(actionComponent.injector.get(diToken)).toEqual('value');

      // Expect part can be injected.
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part'));
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
      await waitForInitialWorkbenchLayout();

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: fixture.componentInstance.actionTemplate(),
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee spec-action')).componentInstance as SpecActionComponent;

      // Expect WorkbenchPart to be passed as default local template variable.
      expect(actionComponent.defaultLocalTemplateVariable()).toBe(TestBed.inject(WorkbenchService).getPart('part.part'));

      // Expect WorkbenchPart can be injected.
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part'));
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
      await waitForInitialWorkbenchLayout();

      // Register action.
      const action1 = TestBed.inject(WorkbenchService).registerPartAction(() => SpecActionComponent);
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action')).nativeElement.innerText).toEqual('Component Action');

      // Dispose action.
      action1.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action'))).toBeNull();

      // Register action via object literal.
      const action2 = TestBed.inject(WorkbenchService).registerPartAction(() => ({content: SpecActionComponent}));
      await fixture.whenStable();

      // Expect action to render.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action')).nativeElement.innerText).toEqual('Component Action');

      // Dispose action.
      action2.dispose();
      await fixture.whenStable();

      // Expect action to be disposed.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action'))).toBeNull();
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
      await waitForInitialWorkbenchLayout();

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
      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee spec-action')).componentInstance as SpecActionComponent;
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
      await waitForInitialWorkbenchLayout();

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

      // Expect DI token to be available.
      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee spec-action')).componentInstance as SpecActionComponent;
      expect(actionComponent.injector.get(diToken)).toEqual('value');

      // Expect part can be injected.
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part'));
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
      await waitForInitialWorkbenchLayout();

      // Register action.
      TestBed.inject(WorkbenchService).registerPartAction(() => ({
        content: SpecActionComponent,
        cssClass: 'testee',
      }));
      await fixture.whenStable();

      // Expect WorkbenchPart can be injected.
      const actionComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.part"] wb-part-bar wb-part-action.testee spec-action')).componentInstance as SpecActionComponent;
      expect(actionComponent.injector.get(WorkbenchPart)).toBe(TestBed.inject(WorkbenchService).getPart('part.part'));
    });
  });
});

@Component({
  selector: 'spec-action',
  template: 'Action',
})
class SpecActionComponent {
}
