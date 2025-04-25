/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DebugElement, DestroyRef, EnvironmentProviders, inject, InjectionToken, Injector, input, makeEnvironmentProviders, signal, Type} from '@angular/core';
import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {WORKBENCH_ICON_PROVIDER, WorkbenchIconProviderFn} from './workbench-icon-provider.model';
import {IconComponent, NullIconComponent} from './icon.component';
import {By} from '@angular/platform-browser';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {NgClass} from '@angular/common';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchIconComponent} from './workbench-icon-provider';
import {MaterialIconComponent} from './material-icon-provider';

describe('IconComponent', () => {

  it('should render icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => {
          switch (icon) {
            case 'icon-1':
              return SpecIcon1Component;
            case 'icon-2':
              return SpecIcon2Component;
            default:
              throw Error(`[NullIconError] No icon for ${icon}`);
          }
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({selector: 'spec-icon-1', template: 'icon 1'})
    class SpecIcon1Component {
    }

    @Component({selector: 'spec-icon-2', template: 'icon 2'})
    class SpecIcon2Component {
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon-1.
    fixture.componentInstance.icon.set('icon-1');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIcon1Component, innerText: 'icon 1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIcon2Component, innerText: 'icon 2'});
  });

  it('should render icon with input(s)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({component: SpecIconComponent, inputs: {icon}})),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({selector: 'spec-icon', template: '{{icon()}}'})
    class SpecIconComponent {
      public icon = input.required<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon-1.
    fixture.componentInstance.icon.set('icon-1');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-2'});
  });

  it('should render icon with custom injector', async () => {
    const token = new InjectionToken<string>('DI_TOKEN');

    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          injector: Injector.create({providers: [{provide: token, useValue: icon}]}),
        })),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({selector: 'spec-icon', template: '{{icon}}'})
    class SpecIconComponent {
      public icon = inject(token);
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon-1.
    fixture.componentInstance.icon.set('icon-1');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-2'});
  });

  it('should not render icon if not provided', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(() => undefined),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon (not provided).
    fixture.componentInstance.icon.set('icon');
    await fixture.whenStable();
    expectIcon(fixture, {component: NullIconComponent, innerText: ''});
  });

  it('should not render icon if not configured an icon provider', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon (not provided).
    fixture.componentInstance.icon.set('icon');
    await fixture.whenStable();
    expectIcon(fixture, {component: NullIconComponent, innerText: ''});
  });

  it('should remove and destroy previous icon and associated CSS classes when providing new icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => {
          if (icon === 'icon-1') {
            return SpecIcon1Component;
          }
          if (icon === 'icon-2') {
            return SpecIcon2Component;
          }
          return undefined;
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-icon-1',
      template: 'icon 1',
      host: {
        '[class.a]': 'true',
        '[class.b]': 'true',
      },
    })
    class SpecIcon1Component {
      public destroyed = false;

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    @Component({
      selector: 'spec-icon-2',
      template: 'icon 2',
      host: {
        '[class.b]': 'true',
        '[class.c]': 'true',
      },
    })
    class SpecIcon2Component {
      public destroyed = false;

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Set CSS class on <wb-icon> component.
    fixture.componentInstance.clazz.set('host-attr-class');
    fixture.componentInstance.ngClazz.set('host-ng-class');

    // Render icon-1.
    fixture.componentInstance.icon.set('icon-1');
    await fixture.whenStable();
    const iconComponent1 = fixture.debugElement.query(By.directive(SpecIcon1Component)).componentInstance as SpecIcon1Component;
    expectIcon(fixture, {component: SpecIcon1Component, innerText: 'icon 1', cssClass: ['host-attr-class', 'host-ng-class', 'a', 'b']});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await fixture.whenStable();
    const iconComponent2 = fixture.debugElement.query(By.directive(SpecIcon2Component)).componentInstance as SpecIcon1Component;
    expectIcon(fixture, {component: SpecIcon2Component, innerText: 'icon 2', cssClass: ['host-attr-class', 'host-ng-class', 'b', 'c']});
    expect(iconComponent1.destroyed).toBeTrue();

    // Render icon-3.
    fixture.componentInstance.icon.set('icon-3');
    await fixture.whenStable();
    expectIcon(fixture, {component: NullIconComponent, innerText: '', cssClass: ['host-attr-class', 'host-ng-class']});
    expect(iconComponent2.destroyed).toBeTrue();
  });

  it('should remove previous icon if no new new icon is provided', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => {
          if (icon === 'icon-1') {
            return SpecIconComponent;
          }
          return undefined;
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-icon',
      template: 'icon',
    })
    class SpecIconComponent {
      public destroyed = false;

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon-1 (provided).
    fixture.componentInstance.icon.set('icon-1');
    await fixture.whenStable();
    const iconComponent1 = fixture.debugElement.query(By.directive(SpecIconComponent)).componentInstance as SpecIconComponent;
    expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon'});

    // Render icon-2 (not provided).
    fixture.componentInstance.icon.set('icon-2');
    await fixture.whenStable();
    expectIcon(fixture, {component: NullIconComponent, innerText: ''});
    expect(iconComponent1.destroyed).toBeTrue();
  });

  it('should support multiple icon providers', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(
          icon => provider1[icon] as Type<unknown> | undefined && {component: provider1[icon], inputs: {provider: '1'}},
          icon => provider2[icon] as Type<unknown> | undefined && {component: provider2[icon], inputs: {provider: '2'}},
        ),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({selector: 'spec-icon-1', template: 'icon 1 [provider={{provider()}}]'})
    class SpecIcon1Component {
      public provider = input.required<string>();
    }

    @Component({selector: 'spec-icon-2', template: 'icon 2 [provider={{provider()}}]'})
    class SpecIcon2Component {
      public provider = input.required<string>();
    }

    @Component({selector: 'spec-icon-3', template: 'icon 3 [provider={{provider()}}]'})
    class SpecIcon3Component {
      public provider = input.required<string>();
    }

    @Component({selector: 'spec-icon-4', template: 'icon 4 [provider={{provider()}}]'})
    class SpecIcon4Component {
      public provider = input.required<string>();
    }

    const provider1: Record<string, Type<unknown>> = {
      'icon-a': SpecIcon1Component,
      'icon-b': SpecIcon2Component,
    };

    const provider2: Record<string, Type<unknown>> = {
      'icon-b': SpecIcon3Component,
      'icon-c': SpecIcon4Component,
    };

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon-a (provider 1).
    fixture.componentInstance.icon.set('icon-a');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIcon1Component, innerText: 'icon 1 [provider=1]'});

    // Render icon-b (provider 1 and provider 2).
    fixture.componentInstance.icon.set('icon-b');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIcon2Component, innerText: 'icon 2 [provider=1]'});

    // Render icon-c (provider 2).
    fixture.componentInstance.icon.set('icon-c');
    await fixture.whenStable();
    expectIcon(fixture, {component: SpecIcon4Component, innerText: 'icon 4 [provider=2]'});
  });

  it('should invoke icon provider in injection context', async () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(() => {
          injector = inject(Injector);
          return undefined;
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon.
    fixture.componentInstance.icon.set('icon');
    await fixture.whenStable();
    expect(injector).toBeDefined();
  });
});

describe('Workbench Icon Provider', () => {

  it('should render Workbench icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });

    // Render icon.
    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('workbench.close');
    await fixture.whenStable();

    // Expect Material icon to be rendered.
    expectIcon(fixture, {component: WorkbenchIconComponent, innerText: 'close', cssClass: ['scion-workbench-icons']});
  });

  it('should render Material icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });

    // Render icon.
    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('icon');
    await fixture.whenStable();

    // Expect Material icon to be rendered.
    expectIcon(fixture, {
      component: MaterialIconComponent, innerText: 'icon', cssClass: [
        'material-icons',
        'material-icons-outlined',
        'material-icons-round',
        'material-icons-sharp',
        'material-symbols-sharp',
        'material-symbols-outlined',
        'material-symbols-rounded',
      ],
    });
  });

  it('should render custom icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          iconProvider: icon => ({component: SpecCustomIconComponent, inputs: {icon}}),
        }),
      ],
    });

    @Component({
      selector: 'spec-custom-icon',
      template: 'Custom Icon for "{{icon()}}"',
      host: {'[class.custom-icon]': 'true'},
    })
    class SpecCustomIconComponent {
      public icon = input.required<string>();
    }

    // Render icon.
    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('icon');
    await fixture.whenStable();

    // Expect Material icon to be rendered.
    expectIcon(fixture, {component: SpecCustomIconComponent, innerText: 'Custom Icon for "icon"', cssClass: ['custom-icon']});
  });
});

function provideIconProvider(...iconProviders: WorkbenchIconProviderFn[]): EnvironmentProviders {
  return makeEnvironmentProviders(iconProviders.map(iconProvider => ({
    provide: WORKBENCH_ICON_PROVIDER,
    useValue: iconProvider,
    multi: true,
  })));
}

/**
 * Expects the specified icon to display.
 */
function expectIcon(fixture: ComponentFixture<unknown> | DebugElement, expected: {innerText: string; component?: ComponentType<unknown>; cssClass?: string[]}): void {
  const debugElement = fixture instanceof ComponentFixture ? fixture.debugElement : fixture;

  const iconDebugElement = debugElement.query(By.css('wb-icon'));
  const iconHTMLElement = iconDebugElement.nativeElement as HTMLElement;

  // Expect to render icon.
  if (expected.component) {
    expect(iconDebugElement.componentInstance).toBeInstanceOf(expected.component);
  }
  expect(iconHTMLElement.innerText).toEqual(expected.innerText);

  // Expect <wb-icon> to be a leaf element.
  expect(iconDebugElement.children).toHaveSize(0);

  // Expect to render single icon.
  expect(debugElement.queryAll(By.css('wb-icon'))).toHaveSize(1);

  // Expect icon to have specified CSS classes.
  if (expected.cssClass) {
    expect(iconHTMLElement.classList.value).toEqual(expected.cssClass.join(' '));
  }
}

@Component({
  selector: 'spec-root',
  template: '<wb-icon [icon]="icon()" [attr.class]="clazz()" [ngClass]="ngClazz()"/>',
  imports: [IconComponent, NgClass],
})
class SpecRootComponent {
  public icon = signal<string | undefined>(undefined);
  public clazz = signal<string>('');
  public ngClazz = signal<string>('');
}
