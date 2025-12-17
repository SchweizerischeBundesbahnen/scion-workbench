import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {Component, DestroyRef, EnvironmentInjector, inject, InjectionToken, Injector, Type} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
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

describe('Popup', () => {

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
});

function getPopupComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('div.wb-popup')).query(By.directive(type)).componentInstance as T;
}
