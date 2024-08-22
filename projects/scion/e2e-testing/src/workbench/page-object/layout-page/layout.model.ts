/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Commands, NavigationData, NavigationState, ReferencePart, WorkbenchLayout, WorkbenchLayoutFactory} from '@scion/workbench';
import {MAIN_AREA} from '../../../workbench.model';
import {ActivatedRoute} from '@angular/router';

/**
 * Implementation of {@link WorkbenchLayoutFactory} that can be used in page objects.
 */
export class ɵWorkbenchLayoutFactory implements WorkbenchLayoutFactory {

  public addPart(id: string | MAIN_AREA, options?: {activate?: boolean}): WorkbenchLayout {
    return new ɵWorkbenchLayout().addInitialPart(id, options);
  }
}

/**
 * Implementation of {@link WorkbenchLayout} that can be used in page objects.
 */
export class ɵWorkbenchLayout implements WorkbenchLayout {

  public parts = new Array<PartDescriptor>();
  public views = new Array<ViewDescriptor>();
  public viewNavigations = new Array<ViewNavigationDescriptor>();

  public addInitialPart(id: string | MAIN_AREA, options?: {activate?: boolean}): WorkbenchLayout {
    this.parts.push({id, activate: options?.activate});
    return this;
  }

  public addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout {
    this.parts.push({
      id,
      relativeTo: relativeTo.relativeTo,
      align: relativeTo.align,
      ratio: relativeTo.ratio,
      activate: options?.activate,
    });
    return this;
  }

  public addView(id: string, options: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): WorkbenchLayout {
    this.views.push({
      id,
      partId: options.partId,
      position: options.position,
      cssClass: options.cssClass,
      activatePart: options.activatePart,
      activateView: options.activateView,
    });
    return this;
  }

  public navigateView(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): WorkbenchLayout {
    if (extras?.relativeTo) {
      throw Error('[PageObjectError] Property `relativeTo` in `WorkbenchLayout.navigateView` is not supported.');
    }

    this.viewNavigations.push({
      id,
      commands,
      hint: extras?.hint,
      data: extras?.data,
      state: extras?.state,
      cssClass: extras?.cssClass,
    });
    return this;
  }

  public removeView(id: string): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.removeView` is not supported.');
  }

  public removePart(id: string): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.removePart` is not supported.');
  }

  public activateView(id: string, options?: {activatePart?: boolean}): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.activateView` is not supported.');
  }

  public activatePart(id: string): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.activatePart` is not supported.');
  }

  public moveView(id: string, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.moveView` is not supported.');
  }
}

/**
 * Represents a part to add to the layout.
 */
export interface PartDescriptor {
  id: string | MAIN_AREA;
  relativeTo?: string;
  align?: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  activate?: boolean;
}

/**
 * Represents a view to add to the layout.
 */
export interface ViewDescriptor {
  id: string;
  partId: string;
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  activateView?: boolean;
  activatePart?: boolean;
  cssClass?: string | string[];
}

/**
 * Represents a view navigation in the layout.
 */
export interface ViewNavigationDescriptor {
  id: string;
  commands: Commands;
  hint?: string;
  data?: NavigationData;
  state?: NavigationState;
  cssClass?: string | string[];
}
