/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, Injector} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';

/**
 * Signature of a function to provide icons to the SCION Workbench.
 *
 * An icon provider is a function that returns the component for an icon. The component renders the icon.
 *
 * Alternatively, the icon provider can return a descriptor, allowing for additional configuration such as inputs.
 * Inputs are available as input properties in the component. The component can use the inputs to render the icon.
 *
 * Icon keys used by the SCION Workbench start with the `workbench.` prefix. To not replace built-in workbench icons,
 * the icon provider can return `undefined` for icons starting with the `workbench.` prefix.
 *
 * An icon provider can be registered via configuration passed to the {@link provideWorkbench} function.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * @param icon - The key of the icon for which to provide the icon component.
 * @return ComponentType or {@link WorkbenchIconDescriptor} to render the icon, or `undefined` if not found.
 */
export type WorkbenchIconProviderFn = (icon: string) => ComponentType<unknown> | WorkbenchIconDescriptor | undefined;

/**
 * Controls rendering of a workbench icon.
 */
export interface WorkbenchIconDescriptor {
  /**
   * Specifies the component to render the icon.
   */
  component: ComponentType<unknown>;
  /**
   * Specifies data to pass to the component. Inputs are available as input properties in the component.
   *
   * ```ts
   * @Component({...})
   * class SomeIconComponent {
   *   icon = input.required<string>();
   * }
   * ```
   */
  inputs?: {[name: string]: unknown};
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
}

/**
 * DI token for injecting icon providers to provide icons to the SCION Workbench.
 *
 * Multiple icon providers can be registered. Providers are called in registration order.
 * If a provider does not provide the icon, the next provider is called, and so on.
 */
export const WORKBENCH_ICON_PROVIDER = new InjectionToken<WorkbenchIconProviderFn>('WORKBENCH_ICON_PROVIDER');
