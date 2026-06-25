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
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {WorkbenchComponent} from '../../workbench.component';
import {Component, inject, Injector} from '@angular/core';
import {toShowCustomMatcher} from '../../testing/jasmine/matcher/to-show.matcher';
import {toEqualToolbarCustomMatcher} from '../../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {contributeMenu, SciToolbarComponent, SciToolbarFactoryFn} from '@scion/components/menu';
import {noop} from 'rxjs';
import {ToolbarPO} from '../../testing/jasmine/matcher/toolbar.po';
import {WorkbenchPart} from '../workbench-part.model';
import {WorkbenchView} from '../../view/workbench-view.model';
import {provideRouter} from '@angular/router';
import {Disposable} from '@scion/toolkit/types';
import {ɵWorkbenchService} from '../../ɵworkbench.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {WorkbenchDialogService} from '../../dialog/workbench-dialog.service';
import {WorkbenchService} from '../../workbench.service';
import {By} from '@angular/platform-browser';
import {WORKBENCH_ELEMENT} from '../../workbench-element-references';
import {WorkbenchDialogRegistry} from '../../dialog/workbench-dialog.registry';
import {WorkbenchPopupRegistry} from '../../popup/workbench-popup.registry';
import {WorkbenchMessageBoxService} from '../../message-box/workbench-message-box.service';
import {WorkbenchPopupService} from '../../popup/workbench-popup.service';

describe('Part Toolbar', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
  });

  it('should contribute to titlebar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .navigatePart('part.testee', ['testee']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to titlebar.
    contributeMenu('toolbar:workbench.part.titlebar', toolbar => toolbar
      .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}]`, onSelect: noop}), {injector: TestBed.inject(Injector)},
    );

    // Expect toolbar.
    const toolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.testee"] sci-toolbar[name="toolbar:workbench.part.titlebar"]'});
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=part.testee, partId=part.testee]',
      },
    ]);
  });

  it('should contribute to tabbar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .navigatePart('part.testee', ['testee']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to tabbar.
    contributeMenu('toolbar:workbench.part.tabbar', toolbar => toolbar
      .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}]`, onSelect: noop}), {injector: TestBed.inject(Injector)},
    );

    // Expect toolbar.
    const toolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.testee"] sci-toolbar[name="toolbar:workbench.part.tabbar"]'});
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=part.testee, partId=part.testee]',
      },
    ]);
  });

  it('should contribute to toolbar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .navigatePart('part.testee', ['testee']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to toolbar.
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => toolbar
      .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}]`, onSelect: noop}), {injector: TestBed.inject(Injector)},
    );

    // Expect toolbar.
    const toolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.testee"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=part.testee, partId=part.testee]',
      },
    ]);
  });

  it('should run factory function in view and part injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .navigatePart('part.testee', ['testee']),
        }),
        provideRouter([
          {
            path: 'testee',
            loadComponent: () => SpecTesteeComponent,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-testee',
      template: '',
    })
    class SpecTesteeComponent {

      private readonly _injector = inject(Injector);

      public contributeMenu(location: `toolbar:${string}`, toolbarFactoryFn: SciToolbarFactoryFn): Disposable {
        return contributeMenu(location, toolbarFactoryFn, {injector: this._injector});
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const spy = spyOn(console, 'log').and.callThrough();

    const part = TestBed.inject(ɵWorkbenchService).getPart('part.testee')!;
    const toolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.testee"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});

    // Contribute to toolbar of part.
    part.getComponent<SpecTesteeComponent>()!.contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
      const element = inject(WORKBENCH_ELEMENT);
      const part = inject(WorkbenchPart);
      toolbar.addToolbarButton({
        label: `[elementId=${element.id}, partId=${part.id}]`,
        accelerator: {alt: true, key: '1'},
        onSelect: () => {
          console.log(`toolbar:workbench.part.toolbar onSelect [elementId=${element.id}, partId=${part.id}]`);
        },
      });
    });
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=part.testee, partId=part.testee]',
      },
    ]);

    // Press alt-1 on part.
    const leftPartComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.testee"]'));
    leftPartComponent.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect [elementId=part.testee, partId=part.testee]');
    spy.calls.reset();

    // Add view 1 to part.
    await TestBed.inject(WorkbenchRouter).navigate(['testee'], {target: 'view.1', partId: 'part.testee'});
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Contribute to toolbar of view 1.
    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.1')!;
    view1.getComponent<SpecTesteeComponent>()!.contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
      const element = inject(WORKBENCH_ELEMENT);
      const part = inject(WorkbenchPart);
      const view = inject(WorkbenchView);
      toolbar.addToolbarButton({
        label: `[elementId=${element.id}, partId=${part.id}, viewId=${view.id}, contribution=1]`,
        accelerator: {alt: true, key: '1'},
        onSelect: () => {
          console.log(`toolbar:workbench.part.toolbar onSelect [elementId=${element.id}, partId=${part.id}, viewId=${view.id}]`);
        },
      });
    });
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.1, partId=part.testee, viewId=view.1, contribution=1]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Press alt-1 on part.
    leftPartComponent.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
    expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect [elementId=part.testee, partId=part.testee]');
    expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect [elementId=view.1, partId=part.testee, viewId=view.1]');
    spy.calls.reset();

    // Add view 2 to part.
    await TestBed.inject(WorkbenchRouter).navigate(['testee'], {target: 'view.2', partId: 'part.testee'});
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Contribute to toolbar of view 2.
    const view2 = TestBed.inject(ɵWorkbenchService).getView('view.2')!;
    view2.getComponent<SpecTesteeComponent>()!.contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
      toolbar.addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}, viewId=${inject(WorkbenchView).id}, contribution=1]`, onSelect: noop});
    });
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.2, partId=part.testee, viewId=view.2, contribution=1]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Contribute to toolbar of view 1 (view inactive).
    view1.getComponent<SpecTesteeComponent>()!.contributeMenu('toolbar:workbench.part.toolbar', toolbar => toolbar
      .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}, viewId=${inject(WorkbenchView).id}, contribution=2]`, onSelect: noop}),
    );
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.2, partId=part.testee, viewId=view.2, contribution=1]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Activate view 1.
    await view1.activate();
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.1, partId=part.testee, viewId=view.1, contribution=1]',
      },
      {
        type: 'menu-item',
        label: '[elementId=view.1, partId=part.testee, viewId=view.1, contribution=2]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Close view 1.
    await view1.close();
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.2, partId=part.testee, viewId=view.2, contribution=1]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Close view 2.
    await view2.close();
    await expectAsync(toolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=part.testee, partId=part.testee]',
      },
    ]);
  });

  it('should move toolbar items when moving view', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addView('view.1', {partId: 'part.left'})
            .navigateView('view.1', ['testee'])
            .addPart('part.right', {align: 'right'})
            .addView('view.2', {partId: 'part.right'}),
        }),
        provideRouter([
          {
            path: 'testee',
            loadComponent: () => SpecTesteeComponent,
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-testee',
      template: '',
    })
    class SpecTesteeComponent {

      private readonly _injector = inject(Injector);

      public contributeMenu(location: `toolbar:${string}`, toolbarFactoryFn: SciToolbarFactoryFn): Disposable {
        return contributeMenu(location, toolbarFactoryFn, {injector: this._injector});
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const leftPartToolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});
    const rightPartToolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.right"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});

    // Contribute to toolbar of view 1.
    const view1 = TestBed.inject(ɵWorkbenchService).getView('view.1')!;
    view1.getComponent<SpecTesteeComponent>()!.contributeMenu('toolbar:workbench.part.toolbar', toolbar => toolbar
      .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, partId=${inject(WorkbenchPart).id}, viewId=${inject(WorkbenchView).id}]`, onSelect: noop}),
    );
    await expectAsync(leftPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.1, partId=part.left, viewId=view.1]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);

    // Move view 1 to right part.
    view1.move('part.right');
    await expectAsync(leftPartToolbar).toEqualToolbar([]);
    await expectAsync(rightPartToolbar).toEqualToolbar([
      {
        type: 'menu-item',
        label: '[elementId=view.1, partId=part.right, viewId=view.1]',
      },
      {
        type: 'menu-item',
        cssClass: 'e2e-view-list',
      },
    ]);
  });

  it('should allow injecting context services in factory function (part)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .navigatePart('part.testee', ['testee']),
        }),
        provideRouter([
          {
            path: 'testee',
            loadComponent: () => SpecTesteeComponent,
          },
        ]),
      ],
    });

    @Component({selector: 'spec-testee', template: ''})
    class SpecTesteeComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to toolbar of part.
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
      const dialogService = inject(WorkbenchDialogService);
      const messageBoxService = inject(WorkbenchMessageBoxService);
      const popupService = inject(WorkbenchPopupService);
      toolbar.addToolbarButton({
        label: 'Dialog',
        cssClass: 'testee-dialog',
        onSelect: () => {
          void dialogService.open(SpecTesteeComponent, {cssClass: 'testee-dialog'});
        },
      });
      toolbar.addToolbarButton({
        label: 'MessageBox',
        cssClass: 'testee-messagebox',
        onSelect: () => {
          void messageBoxService.open(SpecTesteeComponent, {cssClass: 'testee-messagebox'});
        },
      });
      toolbar.addToolbarButton({
        label: 'Popup',
        cssClass: 'testee-popup',
        onSelect: () => {
          void popupService.open(SpecTesteeComponent, {cssClass: 'testee-popup', closeStrategy: {onFocusLost: false}, anchor: {x: 0, y: 0}});
        },
      });
    }, {injector: TestBed.inject(Injector)});
    await waitUntilStable();

    // Open dialog.
    const toolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.testee"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});
    toolbar.button({cssClass: 'testee-dialog'}).nativeElement.click();
    await waitUntilStable();

    // Expect invocation context.
    const dialog = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-dialog'))!;
    expect(dialog.invocationContext!.elementId).toEqual('part.testee');
    dialog.close();
    await waitUntilStable();

    // Open messagebox from dialog.
    toolbar.button({cssClass: 'testee-messagebox'}).nativeElement.click();
    await waitUntilStable();

    // Expect invocation context.
    const messageBox = TestBed.inject(WorkbenchDialogRegistry).elements().find(messageBox => messageBox.cssClass().includes('testee-messagebox'))!;
    expect(messageBox.invocationContext!.elementId).toEqual('part.testee');
    messageBox.close();
    await waitUntilStable();

    // Open popup from dialog.
    toolbar.button({cssClass: 'testee-popup'}).nativeElement.click();
    await waitUntilStable();

    // Expect invocation context.
    const popup = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee-popup'))!;
    expect(popup.invocationContext!.elementId).toEqual('part.testee');
  });

  it('should allow injecting context services in factory function (view)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.1', {partId: 'part.main'})
            .navigateView('view.1', ['testee']),
        }),
        provideRouter([
          {
            path: 'testee',
            loadComponent: () => SpecTesteeComponent,
          },
        ]),
      ],
    });

    @Component({selector: 'spec-testee', template: ''})
    class SpecTesteeComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to toolbar of part.
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
      const dialogService = inject(WorkbenchDialogService);
      const messageBoxService = inject(WorkbenchMessageBoxService);
      const popupService = inject(WorkbenchPopupService);
      toolbar.addToolbarButton({
        label: 'Dialog',
        cssClass: 'testee-dialog',
        onSelect: () => {
          void dialogService.open(SpecTesteeComponent, {cssClass: 'testee-dialog'});
        },
      });
      toolbar.addToolbarButton({
        label: 'MessageBox',
        cssClass: 'testee-messagebox',
        onSelect: () => {
          void messageBoxService.open(SpecTesteeComponent, {cssClass: 'testee-messagebox'});
        },
      });
      toolbar.addToolbarButton({
        label: 'Popup',
        cssClass: 'testee-popup',
        onSelect: () => {
          void popupService.open(SpecTesteeComponent, {cssClass: 'testee-popup', closeStrategy: {onFocusLost: false}, anchor: {x: 0, y: 0}});
        },
      });
    }, {injector: TestBed.inject(Injector)});
    await waitUntilStable();

    // Open dialog.
    const toolbar = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.main"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});
    toolbar.button({cssClass: 'testee-dialog'}).nativeElement.click();
    await waitUntilStable();

    // Expect invocation context.
    const dialog = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-dialog'))!;
    expect(dialog.invocationContext!.elementId).toEqual('view.1');
    dialog.close();
    await waitUntilStable();

    // Open messagebox from dialog.
    toolbar.button({cssClass: 'testee-messagebox'}).nativeElement.click();
    await waitUntilStable();

    // Expect invocation context.
    const messageBox = TestBed.inject(WorkbenchDialogRegistry).elements().find(messageBox => messageBox.cssClass().includes('testee-messagebox'))!;
    expect(messageBox.invocationContext!.elementId).toEqual('view.1');
    messageBox.close();
    await waitUntilStable();

    // Open popup from dialog.
    toolbar.button({cssClass: 'testee-popup'}).nativeElement.click();
    await waitUntilStable();

    // Expect invocation context.
    const popup = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee-popup'))!;
    expect(popup.invocationContext!.elementId).toEqual('view.1');
  });

  it('should construct custom toolbar control in part injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .navigatePart('part.testee', ['testee']),
        }),
        provideRouter([
          {
            path: 'testee',
            loadComponent: () => SpecTesteeComponent,
          },
        ]),
      ],
    });

    @Component({selector: 'spec-toolbar-control', template: 'Toolbar Control'})
    class SpecToolbarControl {
      public part = inject(WorkbenchPart);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to toolbar.
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => toolbar
      .addToolbarControl({component: SpecToolbarControl}), {injector: TestBed.inject(Injector)},
    );
    await fixture.whenStable();

    // Expect control to be constructed in part injection context.
    const toolbarControl = fixture.debugElement.query(By.directive(SpecToolbarControl)).componentInstance as SpecToolbarControl;
    expect(toolbarControl.part.id).toEqual('part.testee');
  });

  it('should construct custom toolbar control in view injection context', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.testee')
            .addView('view.1', {partId: 'part.testee'})
            .navigateView('view.1', ['testee']),
        }),
        provideRouter([
          {
            path: 'testee',
            loadComponent: () => SpecTesteeComponent,
          },
        ]),
      ],
    });

    @Component({selector: 'spec-toolbar-control', template: 'Toolbar Control'})
    class SpecToolbarControl {
      public view = inject(WorkbenchView);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Contribute to toolbar.
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => toolbar
      .addToolbarControl({component: SpecToolbarControl}), {injector: TestBed.inject(Injector)},
    );
    await fixture.whenStable();

    // Expect control to be constructed in view injection context.
    const toolbarControl = fixture.debugElement.query(By.directive(SpecToolbarControl)).componentInstance as SpecToolbarControl;
    expect(toolbarControl.view.id).toEqual('view.1');
  });

  describe('Accelerator', () => {

    it('should invoke onSelect callback on pressing keystroke (part)', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.left')
              .navigatePart('part.left', ['path/to/part'])
              .addPart('part.right', {align: 'right'})
              .navigatePart('part.right', ['path/to/part']),
          }),
          provideRouter([
            {
              path: 'path/to/part',
              loadComponent: () => SpecPartComponent,
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-part',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [
          SciToolbarComponent,
        ],
      })
      class SpecPartComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Spy console.
      const spy = spyOn(console, 'log').and.callThrough();

      // Contribute to titlebar of part.
      contributeMenu('toolbar:workbench.part.titlebar', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.part.titlebar onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to tabbar of part.
      contributeMenu('toolbar:workbench.part.tabbar', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.part.tabbar onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to toolbar of part.
      contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.part.toolbar onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to toolbar in part component.
      contributeMenu('toolbar:testee', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:testee onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      await fixture.whenStable();

      // Press alt-1 on document.
      document.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on left part.
      const leftPartComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"]'));
      leftPartComponent.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on left part slot.
      const leftPartSlotComponent = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-part-slot'));
      leftPartSlotComponent.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on left part bar.
      const leftPartBar = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-part-bar'));
      leftPartBar.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on titlebar in left part.
      const titlebarLeftPart = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.titlebar"]'});
      titlebarLeftPart.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on tabbar in left part.
      const tabbarLeftPart = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.tabbar"]'});
      tabbarLeftPart.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on toolbar in left part.
      const toolbarLeftPart = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.left"] sci-toolbar[name="toolbar:workbench.part.toolbar"]'});
      toolbarLeftPart.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();

      // Press alt-1 on toolbar in left part component.
      const toolbarLeftPartComponent = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.left"] spec-part sci-toolbar'});
      toolbarLeftPartComponent.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:testee onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect part.right');
      spy.calls.reset();
    });

    it('should invoke onSelect callback on pressing keystroke (view)', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.left')
              .addView('view.1', {partId: 'part.left'})
              .navigateView('view.1', ['path/to/view'])
              .addPart('part.right', {align: 'right'})
              .addView('view.2', {partId: 'part.right'})
              .navigateView('view.2', ['path/to/view']),
          }),
          provideRouter([
            {
              path: 'path/to/view',
              loadComponent: () => SpecViewComponent,
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [
          SciToolbarComponent,
        ],
      })
      class SpecViewComponent {

        private readonly _injector = inject(Injector);

        public contributeMenu(location: `toolbar:${string}`, toolbarFactoryFn: SciToolbarFactoryFn): Disposable {
          return contributeMenu(location, toolbarFactoryFn, {injector: this._injector});
        }
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Spy console.
      const spy = spyOn(console, 'log').and.callThrough();

      // Contribute to titlebar of part.
      contributeMenu('toolbar:workbench.part.titlebar', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.part.titlebar onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to tabbar of part.
      contributeMenu('toolbar:workbench.part.tabbar', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.part.tabbar onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to toolbar of part.
      contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
        const part = inject(WorkbenchPart);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.part.toolbar onSelect ${part.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to toolbar in view component.
      contributeMenu('toolbar:testee', toolbar => {
        const view = inject(WorkbenchView);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:testee onSelect ${view.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      await fixture.whenStable();

      // Press alt-1 on document.
      document.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.1');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.2');
      spy.calls.reset();

      // Press alt-1 on view 1 view tab.
      const viewTab1 = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-view-tab[data-viewid="view.1"]'));
      viewTab1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.1');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.2');
      spy.calls.reset();

      // Press alt-1 on view 1 view slot.
      const viewComponent1 = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-view-slot[data-viewid="view.1"]'));
      viewComponent1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:testee onSelect view.1');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.2');
      spy.calls.reset();

      // Press alt-1 on toolbar in view 1.
      const toolbarView1 = new ToolbarPO(fixture, {selector: 'wb-part[data-partid="part.left"] spec-view sci-toolbar'});
      toolbarView1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.left');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.left');
      expect(console.log).toHaveBeenCalledWith('toolbar:testee onSelect view.1');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.titlebar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.tabbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:workbench.part.toolbar onSelect part.right');
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.2');
    });

    it('should not invoke onSelect callback of view toolbar when pressing keystroke on "old" part after moving view', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.left')
              .navigatePart('part.left', ['path/to/part'])
              .addView('view.1', {partId: 'part.left'})
              .navigateView('view.1', ['path/to/view'])
              .addPart('part.right', {align: 'right'}),
          }),
          provideRouter([
            {
              path: 'path/to/view',
              loadComponent: () => SpecViewComponent,
            },
          ]),
        ],
      });

      @Component({
        selector: 'spec-view',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [
          SciToolbarComponent,
        ],
      })
      class SpecViewComponent {

        private readonly _injector = inject(Injector);

        public contributeMenu(location: `toolbar:${string}`, toolbarFactoryFn: SciToolbarFactoryFn): Disposable {
          return contributeMenu(location, toolbarFactoryFn, {injector: this._injector});
        }
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Spy console.
      const spy = spyOn(console, 'log').and.callThrough();

      // Contribute to toolbar in view component.
      contributeMenu('toolbar:testee', toolbar => {
        const view = inject(WorkbenchView);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:testee onSelect ${view.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});
      await fixture.whenStable();

      // Press alt-1 on view 1 view slot.
      const viewSlot1 = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-view-slot[data-viewid="view.1"]'));
      viewSlot1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      spy.calls.reset();

      // Move view 1 to right part.
      const view1 = TestBed.inject(WorkbenchService).getView('view.1')!;
      view1.move('part.right');
      await waitUntilStable();

      // Press alt-1 on left part slot.
      const leftPartSlot = fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-part-slot'));
      leftPartSlot.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith('toolbar:testee onSelect view.1');
    });
  });
});

@Component({
  selector: 'spec-testee',
  template: '',
})
class SpecTesteeComponent {
}
