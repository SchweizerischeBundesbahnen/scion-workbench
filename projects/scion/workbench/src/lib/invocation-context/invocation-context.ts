/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, Injector, Signal, signal} from '@angular/core';
import {DialogId, isDialogId, isPartId, isPopupId, isViewId, PartId, PopupId, ViewId} from '../workbench.identifiers';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {constrainClientRect} from '../common/dom.util';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {WorkbenchPopupRegistry} from '../popup/workbench-popup.registry';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';

/**
 * Creates the invocation context for given element.
 *
 * Passing `undefined` derives the context from the current (or passed) injection context; passing `null` returns `null`.
 *
 * The current invocation context is obtained from the {@link WORKBENCH_ELEMENT} DI token.
 *
 * @see WORKBENCH_ELEMENT
 */
export function createInvocationContext(elementId: PartId | ViewId | DialogId | PopupId | null | undefined, options?: {injector?: Injector}): WorkbenchInvocationContext | null {
  if (elementId === null) {
    return null;
  }

  const injector = options?.injector ?? inject(Injector);
  const contextualElementId = elementId ?? injector.get(WORKBENCH_ELEMENT, null, {optional: true})?.id;
  if (isPartId(contextualElementId)) {
    const part = injector.get(WorkbenchPartRegistry).get(contextualElementId);
    return {
      elementId: part.id,
      attached: part.slot.portal.attached,
      bounds: computed(() => constrainClientRect(part.slot.bounds(), part.bounds())),
      destroyed: part.slot.portal.destroyed,
      peripheral: part.peripheral,
    };
  }
  else if (isViewId(contextualElementId)) {
    const view = injector.get(WorkbenchViewRegistry).get(contextualElementId);
    return {
      elementId: view.id,
      attached: view.slot.portal.attached,
      bounds: computed(() => constrainClientRect(view.slot.bounds(), view.part().bounds())),
      destroyed: view.slot.portal.destroyed,
      peripheral: computed(() => view.part().peripheral()),
    };
  }
  else if (isDialogId(contextualElementId)) {
    const dialog = injector.get(WorkbenchDialogRegistry).get(contextualElementId);
    return {
      elementId: dialog.id,
      attached: dialog.attached,
      bounds: dialog.bounds,
      destroyed: dialog.destroyed,
      peripheral: signal(false),
    };
  }
  else if (isPopupId(contextualElementId)) {
    const popup = injector.get(WorkbenchPopupRegistry).get(contextualElementId);
    return {
      elementId: popup.id,
      attached: popup.attached,
      bounds: popup.bounds,
      destroyed: popup.destroyed,
      peripheral: signal(false),
    };
  }

  return null;
}

/**
 * Information about the source of an invocation.
 */
export interface WorkbenchInvocationContext {
  /**
   * Identifies the element that initiated the interaction.
   */
  elementId: PartId | ViewId | DialogId | PopupId;
  /**
   * Indicates whether the source is attached to the DOM.
   */
  attached: Signal<boolean>;
  /**
   * Tracks the source's bounding box.
   */
  bounds: Signal<DOMRect | undefined>;
  /**
   * Indicates whether the source is located in the peripheral area of the workbench layout.
   */
  peripheral: Signal<boolean>;
  /**
   * Indicates whether the source has been destroyed.
   */
  destroyed: Signal<boolean>;
}
