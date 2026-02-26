import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchNotificationService} from './workbench-notification.service';
import {Component, EnvironmentInjector, inject, InjectionToken, Injector, Type} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('Notification', () => {

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
    const titleElement = document.querySelector<HTMLElement>('wb-notification.testee header.e2e-title')!;
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
});

function getNotificationComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('wb-notification')).query(By.directive(type)).componentInstance as T;
}
