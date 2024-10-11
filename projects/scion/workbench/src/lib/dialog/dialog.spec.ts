import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {booleanAttribute, Component, DestroyRef, effect, EnvironmentInjector, inject, InjectionToken, Injector, input, Type} from '@angular/core';
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
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {throwError} from '../common/throw-error.util';
import {TestComponent} from '../testing/test.component';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';

describe('Dialog', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
    jasmine.addMatchers(toBeActiveCustomMatcher);
  });

  it('should destroy handle\'s injector when closing the dialog', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(TestComponent, {cssClass: 'testee'}).then();
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

  it('should allow for custom injector', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: '',
      standalone: true,
    })
    class SpecDialogComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Create custom injector.
    const diToken = new InjectionToken('token');
    const injector = Injector.create({
      parent: TestBed.inject(EnvironmentInjector),
      providers: [
        {provide: diToken, useValue: 'value'},
      ],
    });

    // Open dialog.
    TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {cssClass: 'testee', injector}).then();
    await waitUntilStable();

    // Expect DI token to be found.
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    expect(dialogComponent.injector.get(diToken)).toEqual('value');
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
      standalone: true,
    })
    class SpecDialogComponent {
    }

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
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

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
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showInputField = true;
    fixture.detectChanges();
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
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

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
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showHeader = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
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
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showFooter = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
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
    const dialogComponent = getDialogComponent(fixture, SpecDialogComponent);
    dialogComponent.showAction = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
    await waitUntilStable();

    // Expect action to show.
    expect(body).toShow(By.css('button.spec-action'));

    // Expect not to throw `ExpressionChangedAfterItHasBeenCheckedError`.
    expect(errors).not.toContain(jasmine.stringMatching(`ExpressionChangedAfterItHasBeenCheckedError`));
  });

  it('should allow updating dialog properties in an effect (without enabling `allowSignalWrites`)', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-dialog',
      template: 'dialog',
      standalone: true,
    })
    class SpecDialogComponent {

      public title = input<string>();
      public padding = input(undefined, {transform: booleanAttribute});
      public closable = input(undefined, {transform: booleanAttribute});
      public resizable = input(undefined, {transform: booleanAttribute});
      public cssClass = input<string>();
      public minWidth = input<string>();
      public width = input<string>();
      public maxWidth = input<string>();
      public minHeight = input<string>();
      public height = input<string>();
      public maxHeight = input<string>();

      constructor(dialog: WorkbenchDialog) {
        effect(() => {
          dialog.title = this.title();
          dialog.padding = this.padding() ?? true;
          dialog.closable = this.closable() ?? true;
          dialog.resizable = this.resizable() ?? true;
          dialog.cssClass = this.cssClass() ?? [];
          dialog.size.minWidth = this.minWidth();
          dialog.size.width = this.width();
          dialog.size.maxWidth = this.maxWidth();
          dialog.size.minHeight = this.minHeight();
          dialog.size.height = this.height();
          dialog.size.maxHeight = this.maxHeight();
        });
      }
    }

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    const workbenchDialogService = TestBed.inject(WorkbenchDialogService);

    // Set title.
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {title: 'TITLE'}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).title()).toEqual('TITLE');
    getDialog({cssClass: 'testee'}).close();

    // Set padding.
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {padding: false}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).padding()).toBeFalse();
    getDialog({cssClass: 'testee'}).close();

    // Set closable.
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {closable: false}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).closable()).toBeFalse();
    getDialog({cssClass: 'testee'}).close();

    // Set resizable.
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {resizable: false}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).resizable()).toBeFalse();
    getDialog({cssClass: 'testee'}).close();

    // Set CSS class.
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {cssClass: 'cssclass'}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).cssClass()).toContain('cssclass');
    getDialog({cssClass: 'testee'}).close();

    // Set size (width).
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {minWidth: '100px', width: '200px', maxWidth: '300px'}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).size.minWidth()).toEqual('100px');
    expect(getDialog({cssClass: 'testee'}).size.width()).toEqual('200px');
    expect(getDialog({cssClass: 'testee'}).size.maxWidth()).toEqual('300px');
    getDialog({cssClass: 'testee'}).close();

    // Set size (height).
    workbenchDialogService.open(SpecDialogComponent, {cssClass: 'testee', inputs: {minHeight: '100px', height: '200px', maxHeight: '300px'}}).then();
    await waitUntilStable();
    expect(getDialog({cssClass: 'testee'}).size.minHeight()).toEqual('100px');
    expect(getDialog({cssClass: 'testee'}).size.height()).toEqual('200px');
    expect(getDialog({cssClass: 'testee'}).size.maxHeight()).toEqual('300px');
    getDialog({cssClass: 'testee'}).close();
  });
});

function getDialog(locator: {cssClass: string}): ɵWorkbenchDialog {
  return TestBed.inject(WorkbenchDialogRegistry).dialogs().find(dialog => dialog.cssClass().includes(locator.cssClass)) ?? throwError('[NullDialogError]');
}

function getDialogComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('wb-dialog')).query(By.directive(type)).componentInstance;
}
