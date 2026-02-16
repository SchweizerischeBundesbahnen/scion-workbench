import {TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchNotificationService} from './workbench-notification.service';

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
    const notificationElement = document.querySelector<HTMLElement>('wb-notification.testee div.e2e-message')!;
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
});
