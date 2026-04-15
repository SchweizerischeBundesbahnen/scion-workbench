/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, ChangeDetectionStrategy, Component, ComponentRef, createComponent, DestroyRef, Directive, effect, ElementRef, EnvironmentInjector, inject, Injector, input, inputBinding, Renderer2, untracked} from '@angular/core';
import {coerceSignal, SciAttributesDirective, SciComponentDescriptor} from '@scion/sci-components/common';
import {IconProviders} from './icon-providers';

/**
 * Renders an icon based on registered icon providers.
 *
 * Providers are called in registration order. If a provider does not provide the icon, the next provider is called, and so on.
 *
 * The icon size is relative to the current font size (1em); change it by setting an explicit font-size on the `<sci-icon>` element or by setting the CSS variable `--sci-icon-size`.
 *
 * @see provideIconProvider
 */
@Component({
  selector: 'sci-icon',
  template: '',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.translate]': '"no"',
  },
})
export class SciIconComponent {

  /**
   * Specifies the icon to display.
   *
   * Refer to the icon providers for a list of supported icons.
   */
  public readonly icon = input.required({transform: (icon: string | undefined): SciComponentDescriptor | undefined => this._iconProviders.provide(icon)});

  private readonly _iconProviders = inject(IconProviders);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _renderer = inject(Renderer2);
  private readonly _applicationRef = inject(ApplicationRef);
  private readonly _injector = inject(Injector);

  constructor() {
    // Render icon in an animation frame to capture CSS classes set on the host.
    const animationFrame = requestAnimationFrame(() => this.renderIcon());
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(animationFrame));
  }

  /**
   * Renders the icon, using this element (`sci-icon`) as the host of the icon component.
   */
  private renderIcon(): void {
    effect(onCleanup => {
      const icon = this.icon();

      untracked(() => {
        // Capture CSS classes of the host (before constructing the icon component).
        const previousHostCssClasses = this._host.classList.value;

        // Construct the icon component.
        const componentRef = createIconComponent({icon, host: this._host, injector: this._injector});

        // Bind component to Angular change detection.
        this._applicationRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

        // Destroy the component when the icon is changed.
        onCleanup(() => {
          componentRef.destroy();
          // Destroying the component does not unset host bindings, e.g., CSS classes.
          // Therefore, manually reset CSS classes to the previous CSS classes.
          this._renderer.setAttribute(this._host, 'class', previousHostCssClasses);
        });
      });
    }, {injector: this._injector});
  }
}

function createIconComponent(config: {icon: SciComponentDescriptor | undefined; host: HTMLElement, injector: Injector}): ComponentRef<unknown> {
  const {icon, host, injector} = config;

  // Provide providers via host directive.
  @Directive({providers: icon?.providers ?? []})
  class ProvidersDirective {
  }

  // Provide CSS classes via host directive.
  @Directive({host: {'[class]': 'cssClass?.()'}})
  class CssClassDirective {
    protected readonly cssClass = coerceSignal(icon?.cssClass);
  }

  // Create the icon component and attach it, rendering a placeholder component if no provider
  // is found to effectively remove the previous component (if any) from the DOM.
  return createComponent(icon?.component ?? NullIconComponent, {
    directives: [
      ProvidersDirective,
      CssClassDirective,
      {type: SciAttributesDirective, bindings: [inputBinding('sciAttributes', coerceSignal(icon?.attributes ?? {}))]},
    ],
    bindings: icon?.bindings,
    elementInjector: icon?.injector,
    environmentInjector: injector.get(EnvironmentInjector),
    hostElement: host,
  });
}

/**
 * Acts as placeholder if no icon could be found.
 */
@Component({template: ''})
export class NullIconComponent {
}
