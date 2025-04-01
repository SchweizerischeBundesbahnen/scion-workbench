/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, InjectionToken, Injector} from '@angular/core';
import {WorkbenchConfig} from '../workbench-config';
import {ComponentType} from '@angular/cdk/portal';

/**
 * Signature of a function to provide icons to the SCION Workbench.
 *
 * The function takes an icon argument, which is a string, and returns an {@link WorkbenchIconDescriptor}.
 * The icon descriptor specifies the component to render the icon.
 *
 * The function can call `inject` to get any required dependencies.
 */
export type WorkbenchIconProviderFn = (icon: string) => WorkbenchIconDescriptor;

/**
 * Specifies the component to render an icon.
 */
export interface WorkbenchIconDescriptor {
  /**
   * Specifies the component to render an icon.
   */
  component: ComponentType<unknown>;
  /**
   * Optional data to pass to the component. Inputs are available as input properties in the component.
   *
   * ```ts
   * @Component({...})
   * class MyIcon {
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
 * DI token to inject {@link WorkbenchIconProviderFn} to provide icons to the SCION Workbench.
 */
export const WORKBENCH_ICON_PROVIDER = new InjectionToken<WorkbenchIconProviderFn | undefined>('WORKBENCH_ICON_PROVIDER', {
  providedIn: 'root',
  factory: () => inject(WorkbenchConfig, {optional: true})?.iconProvider,
});
