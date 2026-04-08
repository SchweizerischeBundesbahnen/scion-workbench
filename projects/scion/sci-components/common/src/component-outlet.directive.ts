/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Binding, ComponentRef, Directive, effect, inject, Injector, input, Provider, untracked, ViewContainerRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';

/**
 * Renders a component, similar to `ngComponentOutlet`, but with input bindings.
 *
 * Usage:
 *
 * ```html
 * <ng-container *sciComponentOutlet="descriptor"/>
 * ````
 *
 * @see WbComponentPortal
 */
@Directive({selector: 'ng-template[sciComponentOutlet]'})
export class SciComponentOutletDirective {

  public readonly descriptor = input.required<SciComponentDescriptor>({alias: 'sciComponentOutlet'});

  constructor() {
    const viewContainerRef = inject(ViewContainerRef);

    effect(onCleanup => {
      const descriptor = this.descriptor();

      untracked(() => {
        const component = createComponent(viewContainerRef, descriptor);
        onCleanup(() => component.destroy());
      });
    });
  }
}

function createComponent(viewContainerRef: ViewContainerRef, descriptor: SciComponentDescriptor): ComponentRef<unknown> {
  // Provide providers via host directive.
  @Directive({providers: descriptor.providers ?? []})
  class ProvidersDirective {
  }

  // Provide CSS classes via host directive.
  @Directive({host: {'[class]': 'descriptor.cssClass'}})
  class CssClassDirective {
    protected readonly descriptor = descriptor;
  }

  return viewContainerRef.createComponent(descriptor.component, {
    directives: [ProvidersDirective, CssClassDirective],
    bindings: descriptor.bindings,
    injector: descriptor.injector,
  });
}

export interface SciComponentDescriptor {
  /** Directive type that should be created. */
  component: ComponentType<unknown>;
  /** Bindings that should be applied to the specific directive. */
  bindings?: Binding[];
  /**
   * Sets the injector for the instantiation of the component, giving control over the objects available for injection.
   *
   * **Example:**
   * ```ts
   * Injector.create({
   *   parent: ...,
   *   providers: [
   *    {provide: <TOKEN>, useValue: <VALUE>}
   *   ],
   * })
   * ```
   */
  injector?: Injector;
  /**
   * Specifies providers available for injection in the component.
   */
  providers?: Provider[];
  /**
   * Specifies CSS class(es) to add to the component, e.g., to locate the component in tests.
   */
  cssClass?: string | string[];
}
