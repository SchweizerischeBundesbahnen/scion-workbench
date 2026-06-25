import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {Component, DestroyRef, EnvironmentInjector, inject, InjectionToken, Injector, Type} from '@angular/core';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {WorkbenchPopupService} from './workbench-popup.service';
import {ɵWorkbenchPopup} from './ɵworkbench-popup.model';
import {WorkbenchPopup} from './workbench-popup.model';
import {LogLevel} from '../logging';
import {WorkbenchMessageBoxService} from '../message-box/workbench-message-box.service';
import {WorkbenchDialogService} from '../dialog/workbench-dialog.service';
import {WorkbenchPopupRegistry} from './workbench-popup.registry';
import {contributeMenu, SciToolbarComponent} from '@scion/components/menu';
import {noop} from 'rxjs';
import {ToolbarPO} from '../testing/jasmine/matcher/toolbar.po';
import {toEqualToolbarCustomMatcher} from '../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';

describe('Popup', () => {

  beforeEach(() => {
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
  });

  it('should destroy handle\'s injector when closing the popup', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-popup',
      template: 'Popup',
    })
    class SpecPopupComponent {
      public popup = inject(ɵWorkbenchPopup);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open popup.
    void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {anchor: {x: 0, y: 0}});
    await waitUntilStable();

    // Get reference to the popup injector.
    const popupComponent = getPopupComponent(fixture, SpecPopupComponent);
    let injectorDestroyed = false;
    popupComponent.popup.injector.get(DestroyRef).onDestroy(() => injectorDestroyed = true);

    // Close the popup.
    popupComponent.popup.close();

    // Expect the injector to be destroyed.
    expect(injectorDestroyed).toBeTrue();
  });

  it('should destroy component when closing the popup', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });

    @Component({template: 'Popup'})
    class SpecPopupComponent {

      public destroyed = false;
      public popup = inject(WorkbenchPopup);

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open popup.
    void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {anchor: {x: 0, y: 0}});
    await waitUntilStable();

    // Get component.
    const popupComponent = getPopupComponent(fixture, SpecPopupComponent);

    // Close popup.
    popupComponent.popup.close();
    await waitUntilStable();

    // Expect the component to be destroyed.
    expect(popupComponent.destroyed).toBeTrue();
  });

  it('should destroy popup-aware services when closing the popup', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          logging: {logLevel: LogLevel.DEBUG},
        }),
      ],
    });

    @Component({template: 'Popup'})
    class SpecPopupComponent {

      constructor() {
        inject(WorkbenchMessageBoxService);
        inject(WorkbenchDialogService);
      }
    }

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Spy console.
    spyOn(console, 'debug').and.callThrough();

    // Open popup.
    void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {anchor: {x: 0, y: 0}, id: 'popup.1'});
    await waitUntilStable();

    // Expect popup-aware services to be constructed.
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining('Constructing WorkbenchMessageBoxService [context=popup.1]'));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining('Constructing WorkbenchDialogService [context=popup.1]'));

    // Close popup.
    TestBed.inject(WorkbenchPopupRegistry).get('popup.1').close();
    await waitUntilStable();

    // Expect popup-aware services to be destroyed.
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining('Destroying WorkbenchMessageBoxService [context=popup.1]'));
    expect(console.debug).toHaveBeenCalledWith(jasmine.stringContaining('Destroying WorkbenchDialogService [context=popup.1]'));
  });

  it('should allow for custom injector', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-popup',
      template: 'Popup',
    })
    class SpecPopupComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create DI token.
    const TOKEN = new InjectionToken('TOKEN');

    // Open popup.
    void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {
      anchor: {x: 0, y: 0},
      injector: Injector.create({
        parent: TestBed.inject(EnvironmentInjector),
        providers: [
          {provide: TOKEN, useValue: 'value'},
        ],
      }),
    });
    await waitUntilStable();

    // Expect DI token to be found.
    const popupComponent = getPopupComponent(fixture, SpecPopupComponent);
    expect(popupComponent.injector.get(TOKEN)).toEqual('value');
  });

  it('should allow for custom provider', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-popup',
      template: 'Popup',
    })
    class SpecPopupComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create DI token.
    const TOKEN = new InjectionToken('TOKEN');

    // Open popup.
    void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {
      anchor: {x: 0, y: 0},
      providers: [{provide: TOKEN, useValue: 'value'}],
    });
    await waitUntilStable();

    // Expect DI token to be found.
    const popupComponent = getPopupComponent(fixture, SpecPopupComponent);
    expect(popupComponent.injector.get(TOKEN)).toEqual('value');
  });

  describe('Toolbar', () => {

    it('should run factory function in popup injection context', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({
        selector: 'spec-popup',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [
          SciToolbarComponent,
        ],
      })
      class SpecPopupComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, popupId=${inject(WorkbenchPopup).id}]`, onSelect: noop}), {injector: TestBed.inject(Injector)},
      );

      // Open popup 1.
      void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {cssClass: 'testee-1', closeStrategy: {onFocusLost: false}, anchor: {x: 0, y: 0}});

      // Open popup 2.
      void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {cssClass: 'testee-2', closeStrategy: {onFocusLost: false}, anchor: {x: 0, y: 0}});
      await waitUntilStable();

      const toolbar1 = new ToolbarPO(fixture, {selector: 'wb-popup.testee-1 spec-popup sci-toolbar'});
      const toolbar2 = new ToolbarPO(fixture, {selector: 'wb-popup.testee-2 spec-popup sci-toolbar'});

      const popup1 = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee-1'))!;
      const popup2 = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee-2'))!;

      // Expect toolbars.
      await expectAsync(toolbar1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${popup1.id}, popupId=${popup1.id}]`,
        },
      ]);
      await expectAsync(toolbar2).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${popup2.id}, popupId=${popup2.id}]`,
        },
      ]);
    });

    it('should allow injecting context services in factory function', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({selector: 'spec-testee', template: ''})
      class SpecTesteeComponent {
      }

      @Component({
        selector: 'spec-popup',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [SciToolbarComponent],
      })
      class SpecPopupComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Contribute to toolbar.
      contributeMenu('toolbar:testee', toolbar => {
        const popupService = inject(WorkbenchPopupService);
        const dialogService = inject(WorkbenchDialogService);
        const messageBoxService = inject(WorkbenchMessageBoxService);
        toolbar.addToolbarButton({
          label: 'Popup',
          cssClass: 'testee-popup',
          onSelect: () => {
            void popupService.open(SpecTesteeComponent, {cssClass: 'testee-popup', closeStrategy: {onFocusLost: false}, anchor: {x: 0, y: 0}});
          },
        });
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
      }, {injector: TestBed.inject(Injector)});

      // Open popup 1.
      void TestBed.inject(WorkbenchPopupService).open(SpecPopupComponent, {cssClass: 'testee', closeStrategy: {onFocusLost: false}, anchor: {x: 0, y: 0}});
      await waitUntilStable();
      const popup1 = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee'))!;

      // Open popup from popup.
      const toolbar = new ToolbarPO(fixture, {selector: 'wb-popup.testee sci-toolbar'});
      toolbar.button({cssClass: 'testee-popup'}).nativeElement.click();
      await waitUntilStable();

      // Expect invocation context.
      const popup2 = TestBed.inject(WorkbenchPopupRegistry).elements().find(popup => popup.cssClass().includes('testee-popup'))!;
      expect(popup2.invocationContext!.elementId).toEqual(popup1.id);
      popup2.close();

      // Open dialog from popup.
      toolbar.button({cssClass: 'testee-dialog'}).nativeElement.click();
      await waitUntilStable();

      // Expect invocation context.
      const dialog = TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes('testee-dialog'))!;
      expect(dialog.invocationContext!.elementId).toEqual(popup1.id);
      dialog.close();

      // Open messagebox from popup.
      toolbar.button({cssClass: 'testee-messagebox'}).nativeElement.click();
      await waitUntilStable();

      // Expect invocation context.
      const messageBox = TestBed.inject(WorkbenchDialogRegistry).elements().find(messageBox => messageBox.cssClass().includes('testee-messagebox'))!;
      expect(messageBox.invocationContext!.elementId).toEqual(popup1.id);
    });
  });
});

function getPopupComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('div.wb-popup')).query(By.directive(type)).componentInstance as T;
}
