import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {TestBed} from '@angular/core/testing';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {Component} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchDialogService} from './workbench-dialog.service';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {toBeActiveCustomMatcher} from '../testing/jasmine/matcher/to-be-active.matcher';

describe('Dialog', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addMatchers(toBeActiveCustomMatcher);
  });

  it('should focus first focusable element', async () => {
    @Component({
      selector: 'spec-dialog',
      template: `
        <input class="spec-input">
      `,
      standalone: true,
    })
    class SpecDialogComponent {
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitForInitialWorkbenchLayout();

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent).then();
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect input field to have focus.
    expect(body.query(By.css('input.spec-input'))).toBeActive();
  });

  it('should focus first focusable element (delayed content)', async () => {
    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showInputField) {
          <input class="spec-input">
        }
      `,
      standalone: true,
    })
    class SpecDialogComponent {
      public showInputField = false;
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitForInitialWorkbenchLayout();

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent).then();
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect input field not to show.
    expect(body).not.toShow(By.css('input.spec-input'));

    // Show input field.
    const dialogDebugElement = body.query(By.directive(SpecDialogComponent));
    dialogDebugElement.componentInstance.showInputField = true;
    fixture.detectChanges();
    await waitUntilStable();

    // Expect input field to have focus.
    expect(body.query(By.css('input.spec-input'))).toBeActive();
  });
});
