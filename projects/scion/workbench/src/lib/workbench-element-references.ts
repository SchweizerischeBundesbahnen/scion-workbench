/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, signal, TemplateRef, ViewContainerRef, WritableSignal} from '@angular/core';

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
export const WORKBENCH_ELEMENT_REF = new InjectionToken<WritableSignal<ViewContainerRef | undefined>>('WORKBENCH_ELEMENT_REF', {
  providedIn: 'root',
  factory: () => signal(undefined),
});

/**
 * DI token to inject the template for the desktop, if any.
 */
export const DESKTOP = new InjectionToken<WritableSignal<TemplateRef<void> | undefined>>('DESKTOP', {
  providedIn: 'root',
  factory: () => signal(undefined),
});
