import {TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchMessageBoxService} from './workbench-message-box.service';

describe('Message Box', () => {

  it('should display translated message', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open message box.
    void TestBed.inject(WorkbenchMessageBoxService).open('%message', {cssClass: 'testee'});
    await waitUntilStable();

    // Expect message to be translated.
    const messageElement = document.querySelector<HTMLElement>('wb-dialog.testee wb-message-box div.e2e-message')!;
    expect(messageElement.innerText).toEqual('MESSAGE (translated)');
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

    // Open message box.
    void TestBed.inject(WorkbenchMessageBoxService).open('message', {title: '%title', cssClass: 'testee'});
    await waitUntilStable();

    // Expect message box title to be translated.
    const titleElement = document.querySelector<HTMLElement>('wb-dialog.testee wb-message-box-header span.e2e-title')!;
    expect(titleElement.innerText).toEqual('TITLE (translated)');
  });

  it('should display translated action', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          textProvider: text => `${text.toUpperCase()} (translated)`,
        }),
      ],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open message box.
    void TestBed.inject(WorkbenchMessageBoxService).open('message', {cssClass: 'testee', actions: {yes: '%yes', no: '%no'}});
    await waitUntilStable();

    // Expect action button to be translated.
    const yesActionElement = document.querySelector<HTMLElement>('wb-dialog.testee wb-message-box-footer button.e2e-action[data-action="yes"]')!;
    expect(yesActionElement.innerText).toEqual('YES (translated)');

    // Expect action button to be translated.
    const noActionElement = document.querySelector<HTMLElement>('wb-dialog.testee wb-message-box-footer button.e2e-action[data-action="no"]')!;
    expect(noActionElement.innerText).toEqual('NO (translated)');
  });
});
