import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchNotificationService} from './workbench-notification.service';
import {Component, EnvironmentInjector, inject, InjectionToken, Injector, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {contributeMenu, SciToolbarComponent, SciToolbarFactoryFn} from '@scion/components/menu';
import {noop} from 'rxjs';
import {ToolbarPO} from '../testing/jasmine/matcher/toolbar.po';
import {toEqualToolbarCustomMatcher} from '../testing/jasmine/matcher/to-equal-toolbar.matcher';
import {Disposable} from '@scion/toolkit/types';
import {WorkbenchNotification} from './workbench-notification.model';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchNotificationRegistry} from './workbench-notification.registry';
import {WorkbenchService} from '../workbench.service';

describe('Notification', () => {

  beforeEach(() => {
    jasmine.addAsyncMatchers(toEqualToolbarCustomMatcher);
  });

  it('should display translated notification', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Show notification.
    TestBed.inject(WorkbenchNotificationService).show('%notification', {cssClass: 'testee'});
    await waitUntilStable();

    // Expect notification to be translated.
    const notificationElement = document.querySelector<HTMLElement>('wb-notification.testee div.e2e-slot')!;
    expect(notificationElement.innerText).toEqual('NOTIFICATION (translated)');
  });

  it('should display translated title', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Show notification.
    TestBed.inject(WorkbenchNotificationService).show('notification', {title: '%title', cssClass: 'testee'});
    await waitUntilStable();

    // Expect notification title to be translated.
    const titleElement = document.querySelector<HTMLElement>('wb-notification.testee header span.e2e-title')!;
    expect(titleElement.innerText).toEqual('TITLE (translated)');
  });

  it('should allow for custom injector', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-notification',
      template: '',
    })
    class SpecNotificationComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create DI token.
    const TOKEN = new InjectionToken('TOKEN');

    // Open dialog.
    TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {
      injector: Injector.create({
        parent: TestBed.inject(EnvironmentInjector),
        providers: [
          {provide: TOKEN, useValue: 'value'},
        ],
      }),
    });
    await waitUntilStable();

    // Expect DI token to be found.
    const notificationComponent = getNotificationComponent(fixture, SpecNotificationComponent);
    expect(notificationComponent.injector.get(TOKEN)).toEqual('value');
  });

  it('should allow for custom provider', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-notification',
      template: '',
    })
    class SpecNotificationComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create DI token.
    const TOKEN = new InjectionToken('TOKEN');

    // Open notification.
    TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {
      providers: [{provide: TOKEN, useValue: 'value'}],
    });
    await waitUntilStable();

    // Expect DI token to be found.
    const notificationComponent = getNotificationComponent(fixture, SpecNotificationComponent);
    expect(notificationComponent.injector.get(TOKEN)).toEqual('value');
  });

  describe('Toolbar', () => {

    it('should run factory function in notification injection context', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({selector: 'spec-notification', template: ''})
      class SpecNotificationComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();
      TestBed.inject(WorkbenchService).settings.toolbarVisibility.set('always');

      // Contribute to toolbar.
      contributeMenu('toolbar:workbench.notification.toolbar', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, notificationId=${inject(WorkbenchNotification).id}]`, onSelect: noop}), {injector: TestBed.inject(Injector)},
      );

      // Open notification 1.
      TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {cssClass: 'testee-1'});

      // Open notification 2.
      TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {cssClass: 'testee-2'});
      await waitUntilStable();

      const toolbarNotification1 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-1 sci-toolbar[name="toolbar:workbench.notification.toolbar"]'});
      const toolbarNotification2 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-2 sci-toolbar[name="toolbar:workbench.notification.toolbar"]'});

      const notification1 = TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes('testee-1'))!;
      const notification2 = TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes('testee-2'))!;

      // Expect toolbars.
      await expectAsync(toolbarNotification1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${notification1.id}, notificationId=${notification1.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
      await expectAsync(toolbarNotification2).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${notification2.id}, notificationId=${notification2.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
    });

    it('should contribute to toolbar from component', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({selector: 'spec-notification', template: ''})
      class SpecNotificationComponent {

        private readonly _injector = inject(Injector);

        public contributeMenu(location: `toolbar:${string}`, toolbarFactoryFn: SciToolbarFactoryFn): Disposable {
          return contributeMenu(location, toolbarFactoryFn, {injector: this._injector});
        }
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();
      TestBed.inject(WorkbenchService).settings.toolbarVisibility.set('always');

      // Open notification 1.
      TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {cssClass: 'testee-1'});

      // Open notification 2.
      TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {cssClass: 'testee-2'});
      await waitUntilStable();

      const toolbarNotification1 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-1 sci-toolbar[name="toolbar:workbench.notification.toolbar"]'});
      const toolbarNotification2 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-2 sci-toolbar[name="toolbar:workbench.notification.toolbar"]'});

      const specNotificationComponent1 = fixture.debugElement.parent!.query(By.css('wb-notification.testee-1')).query(By.directive(SpecNotificationComponent)).componentInstance as SpecNotificationComponent;
      const specNotificationComponent2 = fixture.debugElement.parent!.query(By.css('wb-notification.testee-2')).query(By.directive(SpecNotificationComponent)).componentInstance as SpecNotificationComponent;

      const notification1 = TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes('testee-1'))!;
      const notification2 = TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes('testee-2'))!;

      // Contribute to toolbar in notification 1.
      specNotificationComponent1.contributeMenu('toolbar:workbench.notification.toolbar', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, notificationId=${inject(WorkbenchNotification).id}]`, onSelect: noop}),
      );
      await expectAsync(toolbarNotification1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${notification1.id}, notificationId=${notification1.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
      await expectAsync(toolbarNotification2).toEqualToolbar([
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);

      // Contribute to toolbar in notification 2.
      specNotificationComponent2.contributeMenu('toolbar:workbench.notification.toolbar', toolbar => toolbar
        .addToolbarButton({label: `[elementId=${inject(WORKBENCH_ELEMENT).id}, notificationId=${inject(WorkbenchNotification).id}]`, onSelect: noop}),
      );
      await expectAsync(toolbarNotification1).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${notification1.id}, notificationId=${notification1.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
      await expectAsync(toolbarNotification2).toEqualToolbar([
        {
          type: 'menu-item',
          label: `[elementId=${notification2.id}, notificationId=${notification2.id}]`,
        },
        {
          type: 'menu-item',
          cssClass: 'e2e-close',
        },
      ]);
    });

    it('should invoke onSelect callback on pressing keystroke', async () => {
      TestBed.configureTestingModule({providers: [provideWorkbenchForTest()]});

      @Component({
        selector: 'spec-notification',
        template: '<sci-toolbar name="toolbar:testee"/>',
        imports: [
          SciToolbarComponent,
        ],
      })
      class SpecNotificationComponent {
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Spy console.
      const spy = spyOn(console, 'log').and.callThrough();

      const toolbarNotificationBuiltIn1 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-1 sci-toolbar[name="toolbar:workbench.notification.toolbar"]'});
      const toolbarNotificationBuiltIn2 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-2 sci-toolbar[name="toolbar:workbench.notification.toolbar"]'});

      const toolbarNotificationComponent1 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-1 spec-notification sci-toolbar'});
      const toolbarNotificationComponent2 = new ToolbarPO(fixture, {selector: 'wb-notification.testee-2 spec-notification sci-toolbar'});

      // Contribute to built-in notification toolbar.
      contributeMenu('toolbar:workbench.notification.toolbar', toolbar => {
        const notification = inject(WorkbenchNotification);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:workbench.notification.toolbar onSelect ${notification.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Contribute to toolbar in notification component.
      contributeMenu('toolbar:testee', toolbar => {
        const notification = inject(WorkbenchNotification);
        toolbar.addToolbarButton({
          label: 'testee', accelerator: {alt: true, key: '1'}, onSelect: () => {
            console.log(`toolbar:testee onSelect ${notification.id}`);
          },
        });
      }, {injector: TestBed.inject(Injector)});

      // Open notification 1.
      TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {cssClass: 'testee-1'});

      // Open notification 2.
      TestBed.inject(WorkbenchNotificationService).show(SpecNotificationComponent, {cssClass: 'testee-2'});
      await waitUntilStable();

      const notification1 = TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes('testee-1'))!;
      const notification2 = TestBed.inject(WorkbenchNotificationRegistry).elements().find(notification => notification.cssClass().includes('testee-2'))!;

      // Press alt-1 on document.
      document.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);

      // Press alt-1 on notification 1.
      const notificationComponent1 = fixture.debugElement.parent!.query(By.css('wb-notification.testee-1'));
      notificationComponent1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);

      // Press alt-1 on built-in toolbar in notification 1.
      toolbarNotificationBuiltIn1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);
      spy.calls.reset();

      // Press alt-1 on toolbar in notification component 1.
      toolbarNotificationComponent1.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);
      spy.calls.reset();

      // Press alt-1 on notification 2.
      const notificationComponent2 = fixture.debugElement.parent!.query(By.css('wb-notification.testee-2'));
      notificationComponent2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);
      spy.calls.reset();

      // Press alt-1 on built-in toolbar in notification 2.
      toolbarNotificationBuiltIn2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);
      spy.calls.reset();

      // Press alt-1 on toolbar in notification component 2.
      toolbarNotificationComponent2.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {altKey: true, key: '1', bubbles: true}));
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification1.id}`);
      expect(console.log).not.toHaveBeenCalledWith(`toolbar:testee onSelect ${notification1.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:workbench.notification.toolbar onSelect ${notification2.id}`);
      expect(console.log).toHaveBeenCalledWith(`toolbar:testee onSelect ${notification2.id}`);
    });
  });
});

function getNotificationComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('wb-notification')).query(By.directive(type)).componentInstance as T;
}
