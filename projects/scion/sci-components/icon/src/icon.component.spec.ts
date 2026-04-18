/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DebugElement, DestroyRef, inject, InjectionToken, Injector, input, inputBinding, signal, Type} from '@angular/core';
import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {SciIconComponent} from './icon.component';
import {By} from '@angular/platform-browser';
import {ComponentType} from '@angular/cdk/portal';
import {retryOnError} from '../../common/src/testing/testing.util';
import {MaterialIconComponent} from './material-icon-provider';
import {ScionIconComponent} from './scion-icon-provider';
import {provideIconProvider} from './icon.provider';

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
              throw Error(`No icon found: ${icon}`);
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
    await expectIcon(fixture, {component: SpecIcon1Component, innerText: 'icon 1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    await expectIcon(fixture, {component: SpecIcon2Component, innerText: 'icon 2'});
  });

  it('should render icon with input', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          bindings: [inputBinding('icon', signal(icon))],
        })),
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
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-2'});
  });

  it('should render icon with changed input ', async () => {
    const inputSignal = signal<string | undefined>('value');

    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          bindings: [
            inputBinding('icon', signal(icon)),
            inputBinding('input', inputSignal),
          ],
        })),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({selector: 'spec-icon', template: '{{icon()}} - {{input()}}'})
    class SpecIconComponent {
      public icon = input.required<string>();
      public input = input.required<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('icon');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon - value'});

    // Render icon.
    inputSignal.set('value 1');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon - value 1'});

    // Change input.
    inputSignal.set('value 2')
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon - value 2'});
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
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-2'});
  });

  it('should render icon with custom provider', async () => {
    const token = new InjectionToken<string>('DI_TOKEN');

    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          providers: [{provide: token, useValue: icon}],
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
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-1'});

    // Render icon-2.
    fixture.componentInstance.icon.set('icon-2');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-2'});
  });

  it('should render empty icon if no ligature', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(() => undefined),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon (not provided).
    fixture.componentInstance.icon.set(undefined);
    await expectIcon(fixture, {innerText: '', component: null});
  });

  it('should destroy icon when changing ligature', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => {
          return {component: SpecIconComponent, bindings: [inputBinding('ligature', signal(icon))]};
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-icon',
      template: '{{ligature()}}',
    })
    class SpecIconComponent {
      public destroyed = false;
      public ligature = input.required<string>();

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon.
    fixture.componentInstance.icon.set('icon-1');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-1'});
    const iconComponent = fixture.debugElement.query(By.directive(SpecIconComponent)).componentInstance as SpecIconComponent;
    expect(iconComponent.destroyed).toBeFalse();

    // Change icon.
    fixture.componentInstance.icon.set('icon-2');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon-2'});
    expect(iconComponent.destroyed).toBeTrue();
  });

  it('should destroy icon when removing ligature', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => {
          return {component: SpecIconComponent, bindings: [inputBinding('ligature', signal(icon))]};
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-icon',
      template: '{{ligature()}}',
    })
    class SpecIconComponent {
      public destroyed = false;
      public ligature = input.required<string>();

      constructor() {
        inject(DestroyRef).onDestroy(() => this.destroyed = true);
      }
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon.
    fixture.componentInstance.icon.set('icon');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon'});
    const iconComponent = fixture.debugElement.query(By.directive(SpecIconComponent)).componentInstance as SpecIconComponent;
    expect(iconComponent.destroyed).toBeFalse();

    // Remove icon.
    fixture.componentInstance.icon.set(undefined);
    await expectIcon(fixture, {component: null, innerText: ''});
    expect(iconComponent.destroyed).toBeTrue();
  });

  it('should support multiple icon providers', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => provider1[icon] && {component: provider1[icon], bindings: [inputBinding('provider', signal('1'))]}),
        provideIconProvider(icon => provider2[icon] && {component: provider2[icon], bindings: [inputBinding('provider', signal('2'))]}),
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
    await expectIcon(fixture, {component: SpecIcon1Component, innerText: 'icon 1 [provider=1]'});

    // Render icon-b (provider 1 and provider 2).
    fixture.componentInstance.icon.set('icon-b');
    await expectIcon(fixture, {component: SpecIcon2Component, innerText: 'icon 2 [provider=1]'});

    // Render icon-c (provider 2).
    fixture.componentInstance.icon.set('icon-c');
    await expectIcon(fixture, {component: SpecIcon4Component, innerText: 'icon 4 [provider=2]'});
  });

  it('should call icon provider in injection context', async () => {
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
    await expectIcon(fixture, {component: MaterialIconComponent, innerText: 'icon'});
    expect(injector).toBeDefined();
  });

  it('should prevent browser from translating icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          bindings: [inputBinding('icon', signal(icon))],
        })),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({selector: 'spec-icon', template: '{{icon()}}'})
    class SpecIconComponent {
      public icon = input.required<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);

    // Render icon.
    fixture.componentInstance.icon.set('icon');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon'});

    // Expect 'no-translate' HTML attribute to be set on the icon.
    const iconComponent = fixture.debugElement.query(By.directive(SpecIconComponent));
    expect(iconComponent.attributes).toEqual(jasmine.objectContaining({'translate': 'no'}));
  });

  it('should inherit font-size from location', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          bindings: [inputBinding('icon', signal(icon))],
        })),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-icon',
      template: '{{icon()}}',
      styles: `:host {
        font-size: 48px;
      / / fixed font size
      }`,
    })
    class SpecIconComponent {
      public icon = input.required<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);
    const fixtureElement = fixture.debugElement.nativeElement as HTMLElement;

    // Set font-size on 'sci-icon' element
    fixtureElement.style.fontSize = '14px';

    // Render icon.
    fixture.componentInstance.icon.set('icon');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon'});

    // Expect font size to be var(--sci-icon-size, 1em).
    const iconComponent = fixture.debugElement.query(By.directive(SpecIconComponent));
    expect(getComputedStyle(iconComponent.nativeElement).fontSize).toEqual('14px');
  });

  it('should inherit font-size from \'--sci-icon-size\' CSS variable', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => ({
          component: SpecIconComponent,
          bindings: [inputBinding('icon', signal(icon))],
        })),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-icon',
      template: '{{icon()}}',
      styles: `:host {
        font-size: 48px;
      / / fixed font size
      }`,
    })
    class SpecIconComponent {
      public icon = input.required<string>();
    }

    const fixture = TestBed.createComponent(SpecRootComponent);
    const fixtureElement = fixture.debugElement.nativeElement as HTMLElement;
    fixtureElement.style.fontSize = '14px';

    // Set CSS variable to control font-size.
    fixtureElement.style.setProperty('--sci-icon-size', '12px');

    // Render icon.
    fixture.componentInstance.icon.set('icon');
    await expectIcon(fixture, {component: SpecIconComponent, innerText: 'icon'});

    // Expect font size to be var(--sci-icon-size, 1em).
    const iconComponent = fixture.debugElement.query(By.directive(SpecIconComponent));
    expect(getComputedStyle(iconComponent.nativeElement).fontSize).toEqual('12px');
  });
});

describe('Built-in Icon Providers', () => {

  it('should render Material icon if no providers', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    fixture.componentInstance.icon.set('ligature');
    await expectIcon(fixture, {innerText: 'ligature', component: MaterialIconComponent});
  });

  it('should render Material icon if not provided by application provider', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(() => undefined),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    const fixture = TestBed.createComponent(SpecRootComponent);

    fixture.componentInstance.icon.set('ligature');
    await expectIcon(fixture, {innerText: 'ligature', component: MaterialIconComponent});
  });

  it('should render Material icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    // Render icon.
    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('icon');

    // Expect Material icon to be rendered.
    await expectIcon(fixture, {
      component: MaterialIconComponent, innerText: 'icon',
    });

    // Expect icon to have Material CSS classes.
    const materialIconComponent = fixture.debugElement.query(By.directive(MaterialIconComponent));
    expect(materialIconComponent.classes).toEqual({
      'material-icons': true,
      'material-icons-outlined': true,
      'material-icons-round': true,
      'material-icons-sharp': true,
      'material-symbols-sharp': true,
      'material-symbols-outlined': true,
      'material-symbols-rounded': true,
    });
  });

  it('should render SCION icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    // Render icon.
    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('scion.close');

    // Expect SCION icon to be rendered.
    await expectIcon(fixture, {component: ScionIconComponent, innerText: 'close'});

    // Expect icon to have SCION CSS classes.
    const materialIconComponent = fixture.debugElement.query(By.directive(ScionIconComponent));
    expect(materialIconComponent.classes).toEqual({'scion-icons': true});
  });

  it('should render custom icon', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideIconProvider(icon => {
          return {component: SpecCustomIconComponent, bindings: [inputBinding('ligature', signal(icon))]};
        }),
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    @Component({
      selector: 'spec-custom-icon',
      template: 'Custom Icon for "{{ligature()}}"',
      host: {'[class.custom-icon]': 'true'},
    })
    class SpecCustomIconComponent {
      public ligature = input.required<string>();
    }

    // Render icon.
    const fixture = TestBed.createComponent(SpecRootComponent);
    fixture.componentInstance.icon.set('icon');

    // Expect custom icon to be rendered.
    await expectIcon(fixture, {component: SpecCustomIconComponent, innerText: 'Custom Icon for "icon"'});

    // Expect custom icon to have specified CSS classes.
    const customIconComponent = fixture.debugElement.query(By.directive(SpecCustomIconComponent));
    expect(customIconComponent.classes).toEqual({'custom-icon': true});
  });
});

/**
 * Expects the specified icon to display.
 */
async function expectIcon(fixture: ComponentFixture<unknown> | DebugElement, expected: {innerText: string; component?: ComponentType<unknown> | null}): Promise<void> {
  const debugElement = fixture instanceof ComponentFixture ? fixture.debugElement : fixture;

  // TODO [menu]: Remove fake assertion.
  expect(true).toBe(true);

  await retryOnError(() => {
    const actualIconDebugElement = debugElement.query(By.css('sci-icon'));
    const actualIconHtmlElement = actualIconDebugElement.nativeElement as HTMLElement;

    // Expect icon to be in the DOM.
    if (!actualIconDebugElement) {
      throw Error(`Expected 'sci-icon' element to be in the DOM, but was not.`);
    }

    // Expect icon ligature.
    if (actualIconHtmlElement.innerText !== expected.innerText) {
      throw Error(`Expected icon ligature '${actualIconHtmlElement.innerText}' to equal '${expected.innerText}'.`);
    }

    // Expect icon component.
    if (expected.component && !actualIconDebugElement.query(By.directive(expected.component))) {
      throw Error(`Expected '${expected.component.name}' element to be in the DOM, but was not.`);
    }

    if (expected.component === null && actualIconDebugElement.children.length) {
      throw Error(`Expected 'sci-icon' element to be empty, but was not.`);
    }
  });
}

@Component({
  selector: 'spec-root',
  template: '<sci-icon>{{icon()}}</sci-icon>',
  imports: [SciIconComponent],
})
class SpecRootComponent {
  public icon = signal<string | undefined>(undefined);
}
