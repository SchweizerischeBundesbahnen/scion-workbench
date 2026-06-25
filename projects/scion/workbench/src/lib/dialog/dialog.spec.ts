import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {Component, DestroyRef, EnvironmentInjector, inject, InjectionToken, Injector, signal, Type} from '@angular/core';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchDialogService} from './workbench-dialog.service';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {WorkbenchDialogHeaderDirective} from './dialog-header/workbench-dialog-header.directive';
import {WorkbenchDialogFooterDirective} from './dialog-footer/workbench-dialog-footer.directive';
import {WorkbenchDialogActionDirective} from './dialog-footer/workbench-dialog-action.directive';
import {WorkbenchDialog} from './workbench-dialog.model';
import {toBeActiveCustomMatcher} from '../testing/jasmine/matcher/to-be-active.matcher';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {throwError} from '../common/throw-error.util';
import {TestComponent} from '../testing/test.component';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog.model';
import {LogLevel} from '../logging';
import {WorkbenchMessageBoxService} from '../message-box/workbench-message-box.service';
import {contributeMenu, SciToolbarComponent, SciToolbarFactoryFn} from '@scion/components/menu';
import {noop} from 'rxjs';
import {ToolbarPO} from '../testing/jasmine/matcher/toolbar.po';
import {toEqualToolbarCustomMatcher} from '../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {Disposable} from '@scion/toolkit/types';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchPopupService} from '../popup/workbench-popup.service';
import {WorkbenchPopupRegistry} from '../popup/workbench-popup.registry';

describe('Dialog', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addMatchers(toBeActiveCustomMatcher);
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
  });

  it('should destroy handle\'s injector when closing the dialog', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(TestComponent, {cssClass: 'testee'});
    await waitUntilStable();

    // Get reference to the dialog injector.
    const dialog = getDialog({cssClass: 'testee'});
    let injectorDestroyed = false;
    dialog.injector.get(DestroyRef).onDestroy(() => injectorDestroyed = true);

    // Close the dialog.
    dialog.close();

    // Expect the injector to be destroyed.
    expect(injectorDestroyed).toBeTrue();
  });

  it('should destroy component when closing the dialog', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });

    @Component({template: 'Dialog'})
    class SpecDialogComponent {

      public destroyed = false;
      public dialog = inject(WorkbenchDialog);

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Get component.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);

    // Close dialog.
    dialogComponent.dialog.close();
    await waitUntilStable();

    // Expect the component to be destroyed.
    expect(dialogComponent.destroyed).toBeTrue();
  });

  it('should destroy dialog-aware services when closing the dialog', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          logging: {logLevel: LogLevel.DEBUG},
        }),
      ],
    });

    @Component({template: 'Dialog'})
    class SpecDialogComponent {

      public dialog = inject(WorkbenchDialog);

      constructor() {
        inject(WorkbenchMessageBoxService);
        inject(WorkbenchDialogService);
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    spyOn(console, 'debug').and.callThrough();

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    const dialog = getDialogComponent(fixture, SpecDialogComponent).dialog;

    // Expect dialog-aware services to be constructed.
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing WorkbenchMessageBoxService [context=${dialog.id}]`));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Constructing WorkbenchDialogService [context=${dialog.id}]`));

    // Close dialog.
    dialog.close();
    await waitUntilStable();

    // Expect dialog-aware services to be destroyed.
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying WorkbenchMessageBoxService [context=${dialog.id}]`));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining(`Destroying WorkbenchDialogService [context=${dialog.id}]`));
  });

  it('should allow for custom injector', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: '',
    })
    class SpecDialogComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create DI token.
    const TOKEN = new InjectionToken('TOKEN');

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {
      cssClass: 'testee',
      injector: Injector.create({
        parent: TestBed.inject(EnvironmentInjector),
        providers: [
          {provide: TOKEN, useValue: 'value'},
        ],
      }),
    });
    await waitUntilStable();

    // Expect DI token to be found.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    expect(dialogComponent.injector.get(TOKEN)).toEqual('value');
  });

  it('should allow for custom provider', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: '',
    })
    class SpecDialogComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create DI token.
    const TOKEN = new InjectionToken('TOKEN');

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {
      cssClass: 'testee',
      providers: [{provide: TOKEN, useValue: 'value'}],
    });
    await waitUntilStable();

    // Expect DI token to be found.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    expect(dialogComponent.injector.get(TOKEN)).toEqual('value');
  });

  it('should focus first focusable element', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: `
        <input class="spec-input">
      `,
    })
    class SpecDialogComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect input field to have focus.
    expect(body.query(By.css('input.spec-input'))).toBeActive();
  });

  it('should focus first focusable element (delayed content)', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showInputField()) {
          <input class="spec-input">
        }
      `,
    })
    class SpecDialogComponent {
      public showInputField = signal(false);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect input field not to show.
    expect(body).not.toShow(By.css('input.spec-input'));

    // Show input field.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showInputField.set(true);
    await waitUntilStable();

    // Wait an additional animationFrame, because the focus is debounced by an animationFrame.
    await waitUntilStable();

    // Expect input field to have focus.
    expect(body.query(By.css('input.spec-input'))).toBeActive();
  });

  it('should not throw `ExpressionChangedAfterItHasBeenCheckedError` if setting dialog properties during construction', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: `Testee`,
    })
    class SpecDialogComponent {

      constructor() {
        const dialog = inject(WorkbenchDialog);

        dialog.size.width = '200px';
        dialog.size.minWidth = '150px';
        dialog.size.maxWidth = '250px';
        dialog.size.height = '200px';
        dialog.size.minHeight = '150px';
        dialog.size.maxHeight = '250px';
        dialog.title = 'testee';
        dialog.closable = false;
        dialog.padding = false;
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Expect dialog to show.
    expect(fixture.debugElement.parent!).toShow(SpecDialogComponent);

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should show header after one change detection cycle', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showHeader()) {
          <ng-template wbDialogHeader>
            <header class="spec-header">testee</header>
          </ng-template>
        }
      `,
      imports: [WorkbenchDialogHeaderDirective],
    })
    class SpecDialogComponent {
      public showHeader = signal(false);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect header not to show.
    expect(body).not.toShow(By.css('header.spec-header'));

    // Show header.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showHeader.set(true);
    await waitUntilStable();

    // Expect header to show.
    expect(body).toShow(By.css('header.spec-header'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should show footer after one change detection cycle', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showFooter()) {
          <ng-template wbDialogFooter>
            <footer class="spec-footer">testee</footer>
          </ng-template>
        }
      `,
      imports: [WorkbenchDialogFooterDirective],
    })
    class SpecDialogComponent {
      public showFooter = signal(false);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect footer not to show.
    expect(body).not.toShow(By.css('footer.spec-footer'));

    // Show footer.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showFooter.set(true);
    await waitUntilStable();

    // Expect footer to show.
    expect(body).toShow(By.css('footer.spec-footer'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should show action after one change detection cycle', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showAction()) {
          <ng-template wbDialogAction>
            <button class="spec-action">click</button>
          </ng-template>
        }
      `,
      imports: [WorkbenchDialogActionDirective],
    })
    class SpecDialogComponent {
      public showAction = signal(false);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitUntilWorkbenchStarted();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(...args));

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent);
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect action not to show.
    expect(body).not.toShow(By.css('button.spec-action'));

    // Show action.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showAction.set(true);
    await waitUntilStable();

    // Expect action to show.
    expect(body).toShow(By.css('button.spec-action'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should display translated title', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    @Component({selector: 'spec-dialog', template: ''})
    class SpecDialogComponent {

      constructor() {
        const dialog = inject(WorkbenchDialog);
        dialog.title = '%title';
        dialog.size.width = '500px';
      }
    }

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {cssClass: 'testee'});
    await waitUntilStable();

    // Expect dialog title to be translated.
    const titleElement = document.querySelector<HTMLElement>('wb-dialog.testee wb-dialog-header div.e2e-title')!;
    expect(titleElement.innerText).toEqual('TITLE (translated)');
  });

  describe('Toolbar', () => {

    it('should run factory function in dialog injection context', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({selector: 'spec-dialog', template: ''})
      class SpecDialogComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Contribute to toolbar.
      contributeMenu('toolbar:workbench.dialog.toolbar', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, dialogId=${inject(WorkbenchDialog).id}]`, onSelect: noop}), {injector: TestBed.inject(Injector)},
      );

      // Open dialog 1.
      void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {modality: 'none', cssClass: 'testee-1'});
      await waitUntilStable();

      // Open dialog 2.
      void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {modality: 'none', cssClass: 'testee-2'});
      await waitUntilStable();

      const toolbarDialog1 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-1 sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});
      const toolbarDialog2 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-2 sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});

      const dialog1 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-1'))!;
      const dialog2 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-2'))!;

      // Expect toolbars.
      await expectAsync(toolbarDialog1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${dialog1.id}, dialogId=${dialog1.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
      await expectAsync(toolbarDialog2).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${dialog2.id}, dialogId=${dialog2.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
    });

    it('should allow injecting context services in factory function', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({selector: 'spec-dialog', template: ''})
      class SpecTesteeComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Contribute to toolbar.
      contributeMenu('toolbar:workbench.dialog.toolbar', toolbar => {
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

      // Open dialog 1.
      void TestBed.inject(WorkbenchDialogService).open(SpecTesteeComponent, {modality: 'none', cssClass: 'testee'});
      await waitUntilStable();
      const dialog1 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee'))!;

      // Open dialog from dialog.
      const toolbar = new ToolbarPO(fixture, {selector: 'wb-dialog.testee sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});
      toolbar.button({cssClass: 'testee-dialog'}).nativeElement.click();
      await waitUntilStable();

      // Expect invocation context.
      const dialog2 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-dialog'))!;
      expect(dialog2.invocationContext!.elementId).toEqual(dialog1.id);
      dialog2.close();
      await waitUntilStable();

      // Open messagebox from dialog.
      toolbar.button({cssClass: 'testee-messagebox'}).nativeElement.click();
      await waitUntilStable();

      // Expect invocation context.
      const messageBox = TestBed.inject(WorkbenchDialogRegistry).elements().find(messageBox => messageBox.cssClass().includes('testee-messagebox'))!;
      expect(messageBox.invocationContext!.elementId).toEqual(dialog1.id);
      messageBox.close();
      await waitUntilStable();

      // Open popup from dialog.
      toolbar.button({cssClass: 'testee-popup'}).nativeElement.click();
      await waitUntilStable();

      // Expect invocation context.
      const popup = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee-popup'))!;
      expect(popup.invocationContext!.elementId).toEqual(dialog1.id);
    });

    it('should contribute to toolbar from component', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({selector: 'spec-dialog', template: ''})
      class SpecDialogComponent {

        private readonly _injector = inject(Injector);

        public contributeMenu(location: `toolbar:${string}`, toolbarFactoryFn: SciToolbarFactoryFn): Disposable {
          return contributeMenu(location, toolbarFactoryFn, {injector: this._injector});
        }
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Open dialog 1.
      void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {modality: 'none', cssClass: 'testee-1'});

      // Open dialog 2.
      void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {modality: 'none', cssClass: 'testee-2'});
      await waitUntilStable();

      const toolbarDialog1 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-1 sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});
      const toolbarDialog2 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-2 sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});

      const dialog1 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-1'))!;
      const dialog2 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-2'))!;

      const specDialogComponent1 = fixture.debugElement.parent!.query(By.css('wb-dialog.testee-1')).query(By.directive(SpecDialogComponent)).componentInstance as SpecDialogComponent;
      const specDialogComponent2 = fixture.debugElement.parent!.query(By.css('wb-dialog.testee-2')).query(By.directive(SpecDialogComponent)).componentInstance as SpecDialogComponent;

      // Contribute to toolbar in dialog 1.
      specDialogComponent1.contributeMenu('toolbar:workbench.dialog.toolbar', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, dialogId=${inject(WorkbenchDialog).id}]`, onSelect: noop}),
      );
      await expectAsync(toolbarDialog1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${dialog1.id}, dialogId=${dialog1.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
      await expectAsync(toolbarDialog2).toEqualToolbar([
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },

      ]);

      // Contribute to toolbar in dialog 2.
      specDialogComponent2.contributeMenu('toolbar:workbench.dialog.toolbar', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, dialogId=${inject(WorkbenchDialog).id}]`, onSelect: noop}),
      );
      await expectAsync(toolbarDialog1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${dialog1.id}, dialogId=${dialog1.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
      await expectAsync(toolbarDialog2).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${dialog2.id}, dialogId=${dialog2.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
    });

    it('should invoke onSelect callback on pressing keystroke', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest({})]});

      @Component({
        selector: 'spec-dialog',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [SciToolbarComponent],
      })
      class SpecDialogComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Spy console.
      const spy = spyOn(console, 'log').and.callThrough();

      const toolbarDialogBuiltIn1 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-1 sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});
      const toolbarDialogBuiltIn2 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-2 sci-toolbar[name="toolbar:workbench.dialog.toolbar"]'});

      const toolbarDialogComponent1 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-1 spec-dialog sci-toolbar'});
      const toolbarDialogComponent2 = new ToolbarPO(fixture, {selector: 'wb-dialog.testee-2 spec-dialog sci-toolbar'});

      // Contribute to built-in dialog toolbar.
      contributeMenu('toolbar:workbench.dialog.toolbar', toolbar => {
        const dialog = inject(WorkbenchDialog);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.dialog.toolbar onSelect ${dialog.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to toolbar in dialog component.
      contributeMenu('toolbar:testee', toolbar => {
        const dialog = inject(WorkbenchDialog);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:testee onSelect ${dialog.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Open dialog 1.
      void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {modality: 'none', cssClass: 'testee-1'});

      // Open dialog 2.
      void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {modality: 'none', cssClass: 'testee-2'});
      await waitUntilStable();

      const dialog1 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-1'))!;
      const dialog2 = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-2'))!;

      // Press alt-1 on document.
      document.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);

      // Press alt-1 on dialog 1.
      const dialogComponent1 = fixture.debugElement.parent!.query(By.css('wb-dialog.testee-1'));
      dialogComponent1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);
      spy.calls.reset();

      // Press alt-1 on built-in toolbar in dialog 1.
      toolbarDialogBuiltIn1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);
      spy.calls.reset();

      // Press alt-1 on toolbar in dialog component 1.
      toolbarDialogComponent1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);
      spy.calls.reset();

      // Press alt-1 on dialog 2.
      const dialogComponent2 = fixture.debugElement.parent!.query(By.css('wb-dialog.testee-2'));
      dialogComponent2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);
      spy.calls.reset();

      // Press alt-1 on built-in toolbar in dialog 2.
      toolbarDialogBuiltIn2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);
      spy.calls.reset();

      // Press alt-1 on toolbar in dialog component 2.
      toolbarDialogComponent2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog1}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog1}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.dialog.toolbar onSelect ${dialog2.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${dialog2.id}`);
    });
  });
});

function getDialog(locator: {cssClass: string}): ɵWorkbenchDialog {
  return TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes(locator.cssClass)) ?? throwError('[NullDialogError]');
}

function getDialogComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('wb-dialog')).query(By.directive(type)).componentInstance as T;
}
