/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, InjectionToken, Signal, signal, ViewContainerRef, WritableSignal} from '@angular/core';
import {boundingClientRect} from '@scion/components/dimension';
import {WorkbenchElement} from './workbench.model';

/**
 * DI token to inject the DOM location where to attach iframes.
 */
export const IFRAME_OVERLAY_HOST = new InjectionToken<WritableSignal<ViewContainerRef | undefined>>('IFRAME_OVERLAY_HOST', {
  providedIn: 'root',
  factory: () => signal(undefined),
});

/**
 * DI token to inject the DOM location where to attach the visual placeholder when dragging a view over a drop zone.
 */
export const VIEW_DROP_ZONE_OVERLAY_HOST = new InjectionToken<WritableSignal<ViewContainerRef | undefined>>('VIEW_DROP_ZONE_OVERLAY_HOST', {
  providedIn: 'root',
  factory: () => signal(undefined),
});

/**
 * DI token to inject the DOM location of the {@link WorkbenchComponent} HTML element.
 */
export const WORKBENCH_COMPONENT_REF = new InjectionToken<WritableSignal<ViewContainerRef | undefined>>('WORKBENCH_COMPONENT_REF', {
  providedIn: 'root',
  factory: () => signal(undefined),
});

/**
 * DI token to inject the bounds of the {@link WorkbenchComponent} HTML element.
 */
export const WORKBENCH_COMPONENT_BOUNDS = new InjectionToken<Signal<DOMRect | undefined>>('WORKBENCH_COMPONENT_BOUNDS', {
  providedIn: 'root',
  factory: () => {
    const workbenchElement = inject(WORKBENCH_COMPONENT_REF);
    return boundingClientRect(computed(() => workbenchElement()?.element.nativeElement as HTMLElement | undefined));
  },
});

/**
 * DI token to inject the workbench element available in the current context.
 */
export const WORKBENCH_ELEMENT = new InjectionToken<WorkbenchElement>('WORKBENCH_ELEMENT');
