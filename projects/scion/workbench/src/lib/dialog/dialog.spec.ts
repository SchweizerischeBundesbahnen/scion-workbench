import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {Component, DestroyRef, EnvironmentInjector, inject, InjectionToken, Injector, Type} from '@angular/core';
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
import {LogLevel} from '../logging';
import {WorkbenchMessageBoxService} from '../message-box/workbench-message-box.service';

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

    // Create custom injector.
    const diToken = new InjectionToken('token');
    const injector = Injector.create({
      parent: void TestBed.inject(EnvironmentInjector),
      providers: [
        {provide: diToken, useValue: 'value'},
      ],
    });

    // Open dialog.
    void TestBed.inject(WorkbenchDialogService).open(SpecDialogComponent, {cssClass: 'testee', injector});
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
        @if (showInputField) {
          <input class="spec-input">
        }
      `,
    })
    class SpecDialogComponent {
      public showInputField = false;
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
        @if (showHeader) {
          <ng-template wbDialogHeader>
            <header class="spec-header">testee</header>
          </ng-template>
        }
      `,
      imports: [WorkbenchDialogHeaderDirective],
    })
    class SpecDialogComponent {
      public showHeader = false;
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
      imports: [WorkbenchDialogFooterDirective],
    })
    class SpecDialogComponent {
      public showFooter = false;
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
      imports: [WorkbenchDialogActionDirective],
    })
    class SpecDialogComponent {
      public showAction = false;
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
    dialogComponent.showAction = true;
    fixture.detectChanges(); // Only trigger one change detection cycle.
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

      constructor(dialog: WorkbenchDialog) {
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
});

function getDialog(locator: {cssClass: string}): ɵWorkbenchDialog {
  return TestBed.inject(WorkbenchDialogRegistry).elements().find(dialog => dialog.cssClass().includes(locator.cssClass)) ?? throwError('[NullDialogError]');
}

function getDialogComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('wb-dialog')).query(By.directive(type)).componentInstance as T;
}
