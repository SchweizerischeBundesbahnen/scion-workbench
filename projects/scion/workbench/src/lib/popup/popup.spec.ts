import {ComponentFixture, TestBed} from '@angular/core/testing';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {Component, DestroyRef, EnvironmentInjector, inject, InjectionToken, Injector, Type} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {By} from '@angular/platform-browser';
import {PopupService} from './popup.service';
import {ɵPopup} from './popup.config';

describe('Popup', () => {

  it('should destroy handle\'s injector when closing the popup', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-popup',
      template: 'Popup',
      standalone: true,
    })
    class SpecPopupComponent {
      public popup = inject(ɵPopup);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Open popup.
    TestBed.inject(PopupService).open({component: SpecPopupComponent, anchor: {x: 0, y: 0}}).then();
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

  it('should allow for custom injector and providers', async () => {
    TestBed.configureTestingModule({
      providers: [provideWorkbenchForTest()],
    });

    @Component({
      selector: 'spec-popup',
      template: 'Popup',
      standalone: true,
    })
    class SpecPopupComponent {
      public injector = inject(Injector);
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Create custom injector.
    const diToken1 = new InjectionToken('token1');
    const diToken2 = new InjectionToken('token2');
    const injector = Injector.create({
      parent: TestBed.inject(EnvironmentInjector),
      providers: [
        {provide: diToken1, useValue: 'value 1'},
      ],
    });

    // Open popup.
    TestBed.inject(PopupService).open({
      component: SpecPopupComponent,
      anchor: {x: 0, y: 0},
      componentConstructOptions: {
        injector,
        providers: [{provide: diToken2, useValue: 'value 2'}],
      },
    }).then();
    await waitUntilStable();

    // Expect DI token to be found.
    const popupComponent = getPopupComponent(fixture, SpecPopupComponent);
    expect(popupComponent.injector.get(diToken1)).toEqual('value 1');
    expect(popupComponent.injector.get(diToken2)).toEqual('value 2');
  });
});

function getPopupComponent<T>(fixture: ComponentFixture<unknown>, type: Type<T>): T {
  return fixture.debugElement.parent!.query(By.css('div.wb-popup')).query(By.directive(type)).componentInstance;
}
