/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, createComponent, effect, ElementRef, EnvironmentInjector, inject, Injector, input, Renderer2, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {WORKBENCH_ICON_PROVIDER, WorkbenchIconDescriptor, WorkbenchIconProviderFn} from './workbench-icon-provider.model';

/**
 * Renders an icon based on icon providers registered under the {@link WORKBENCH_ICON_PROVIDER} DI token.
 *
 * Multiple icon providers can be registered. Providers are called in registration order.
 * If a provider does not provide the icon, the next provider is called, and so on.
 */
@Component({
  selector: 'wb-icon',
  template: '',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {

  /**
   * Specifies the icon to display.
   *
   * Refer to the installed icon providers for a list of supported icons.
   */
  public readonly icon = input.required<string | undefined>();

  private readonly _injector = inject(Injector);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _renderer = inject(Renderer2);

  private readonly _iconDescriptor = computeIconDescriptor(this.icon);

  constructor() {
    // Render icon in an animation frame to capture CSS classes set on the host.
    requestAnimationFrame(() => this.renderIcon());
  }

  /**
   * Renders the icon, using this element (`wb-icon`) as the host of the icon component.
   */
  private renderIcon(): void {
    effect(onCleanup => {
      const {component, injector, inputs} = this._iconDescriptor() ?? {};

      untracked(() => {
        // Capture CSS classes of the host (before constructing the icon component).
        const hostCssClass = this._host.classList.value;

        // Create the icon component and attach it, rendering a placeholder component if no provider
        // is found to effectively remove the previous component (if any) from the DOM.
        const componentRef = createComponent(component ?? NullIconComponent, {
          elementInjector: injector ?? this._injector,
          environmentInjector: this._injector.get(EnvironmentInjector),
          hostElement: this._host,
        });

        // Set inputs.
        for (const input in inputs) {
          componentRef.setInput(input, inputs[input]);
        }
        componentRef.changeDetectorRef.detectChanges();

        // Destroy the component when the icon is changed.
        onCleanup(() => {
          componentRef.destroy();
          // Destroying the component does not unset its host bindings, e.g., CSS classes applied to the host element.
          // Therefore, manually reset CSS classes to the CSS classes of the host.
          this._renderer.setAttribute(this._host, 'class', hostCssClass);
        });
      });
    }, {injector: this._injector});
  }
}

/**
 * Computes the icon descriptor for the specified icon based on the installed icon providers.
 */
function computeIconDescriptor(icon: Signal<string | undefined>): Signal<WorkbenchIconDescriptor | undefined> {
  const injector = inject(Injector);
  const iconProviders = inject(WORKBENCH_ICON_PROVIDER, {optional: true}) as WorkbenchIconProviderFn[] | null;
  if (!iconProviders?.length) {
    return signal(undefined);
  }

  return computed(() => {
    if (!icon()) {
      return undefined;
    }

    return untracked(() => {
      for (const iconProvider of iconProviders) {
        const componentOrDescriptor = runInInjectionContext(injector, () => iconProvider(icon()!));
        if (componentOrDescriptor) {
          return typeof componentOrDescriptor === 'function' ? {component: componentOrDescriptor} : componentOrDescriptor;
        }
      }
      return undefined;
    });
  });
}

/**
 * Acts as placeholder if no icon could be found.
 */
@Component({template: ''})
export class NullIconComponent {
}
