import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {TestBed} from '@angular/core/testing';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {Component} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchDialogService} from './workbench-dialog.service';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {WorkbenchDialogHeaderDirective} from './dialog-header/workbench-dialog-header.directive';
import {WorkbenchDialogFooterDirective} from './dialog-footer/workbench-dialog-footer.directive';
import {WorkbenchDialogActionDirective} from './dialog-footer/workbench-dialog-action.directive';
import {WorkbenchDialog} from './workbench-dialog';
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

  it('should not throw `ExpressionChangedAfterItHasBeenCheckedError` if setting dialog properties during construction', async () => {
    @Component({
      selector: 'spec-dialog',
      template: `Testee`,
      standalone: true,
    })
    class SpecDialogComponent {
      constructor(public dialog: WorkbenchDialog) {
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

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent).then();
    await waitUntilStable();

    // Expect dialog to show.
    expect(fixture.debugElement.parent!).toShow(SpecDialogComponent);

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should show header after one change detection cycle', async () => {
    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showHeader) {
          <ng-template wbDialogHeader>
            <header class="spec-header">testee</header>
          </ng-template>
        }
      `,
      standalone: true,
      imports: [WorkbenchDialogHeaderDirective],
    })
    class SpecDialogComponent {
      public showHeader = false;
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent).then();
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect header not to show.
    expect(body).not.toShow(By.css('header.spec-header'));

    // Show header.
    const dialogDebugElement = body.query(By.directive(SpecDialogComponent));
    dialogDebugElement.componentInstance.showHeader = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
    await waitUntilStable();

    // Expect header to show.
    expect(body).toShow(By.css('header.spec-header'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should show footer after one change detection cycle', async () => {
    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showFooter) {
          <ng-template wbDialogFooter>
            <footer class="spec-footer">testee</footer>
          </ng-template>
        }
      `,
      standalone: true,
      imports: [WorkbenchDialogFooterDirective],
    })
    class SpecDialogComponent {
      public showFooter = false;
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent).then();
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect footer not to show.
    expect(body).not.toShow(By.css('footer.spec-footer'));

    // Show footer.
    const dialogDebugElement = body.query(By.directive(SpecDialogComponent));
    dialogDebugElement.componentInstance.showFooter = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
    await waitUntilStable();

    // Expect footer to show.
    expect(body).toShow(By.css('footer.spec-footer'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should show action after one change detection cycle', async () => {
    @Component({
      selector: 'spec-dialog',
      template: `
        @if (showAction) {
          <ng-template wbDialogAction>
            <button class="spec-action">click</button>
          </ng-template>
        }
      `,
      standalone: true,
      imports: [WorkbenchDialogActionDirective],
    })
    class SpecDialogComponent {
      public showAction = false;
    }

    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const body = fixture.debugElement.parent!;
    await waitForInitialWorkbenchLayout();

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake(args => errors.push(...args));

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent).then();
    await waitUntilStable();

    // Expect dialog to show.
    expect(body).toShow(SpecDialogComponent);

    // Expect action not to show.
    expect(body).not.toShow(By.css('button.spec-action'));

    // Show action.
    const dialogDebugElement = body.query(By.directive(SpecDialogComponent));
    dialogDebugElement.componentInstance.showAction = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
    await waitUntilStable();

    // Expect action to show.
    expect(body).toShow(By.css('button.spec-action'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });
});
