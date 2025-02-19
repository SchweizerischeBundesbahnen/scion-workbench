/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Commands, DockingArea, NavigationData, NavigationState, PartId, PartExtras, ReferencePart, WorkbenchLayout, WorkbenchLayoutFactory} from '@scion/workbench';
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

  public activities = new Array<ActivityDescriptor>();
  public parts = new Array<PartDescriptor>();
  public views = new Array<ViewDescriptor>();
  public partNavigations = new Array<PartNavigationDescriptor>();
  public viewNavigations = new Array<ViewNavigationDescriptor>();

  public addInitialPart(id: string | MAIN_AREA, options?: {activate?: boolean}): WorkbenchLayout {
    this.parts.push({id, activate: options?.activate});
    return this;
  }

  public addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, extras?: {activate?: boolean}): WorkbenchLayout;
  public addPart(id: string, dockTo: DockingArea, extras: PartExtras & {cssClass?: string | string[]}): WorkbenchLayout;
  public addPart(id: string, reference: ReferencePart | DockingArea, extras?: {activate?: boolean} | PartExtras & {cssClass?: string | string[]}): WorkbenchLayout {
    if ((reference as Partial<DockingArea>).dockTo) {
      return this.addActivity(id, reference as DockingArea, extras as PartExtras & {cssClass?: string | string[]});
    }
    else {
      return this._addPart(id, reference as ReferencePart, extras as {activate?: boolean});
    }
  }

  private _addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, extras?: {activate?: boolean}): WorkbenchLayout {
    this.parts.push({
      id,
      relativeTo: relativeTo.relativeTo,
      align: relativeTo.align,
      ratio: relativeTo.ratio,
      activate: extras?.activate,
    });
    return this;
  }

  private addActivity(id: string, dockTo: DockingArea, extras: PartExtras & {cssClass?: string | string[]}): WorkbenchLayout {
    this.activities.push({
      id,
      dockTo: dockTo.dockTo,
      icon: extras.icon,
      label: extras.label,
      tooltip: extras.tooltip,
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

  public navigatePart(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): WorkbenchLayout {
    if (extras?.relativeTo) {
      throw Error('[PageObjectError] Property `relativeTo` in `WorkbenchLayout.navigatePart` is not supported.');
    }

    this.partNavigations.push({
      id,
      commands,
      hint: extras?.hint,
      data: extras?.data,
      state: extras?.state,
      cssClass: extras?.cssClass,
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

  public modify(modifyFn: (layout: WorkbenchLayout) => WorkbenchLayout): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.modify` is not supported.');
  }
}

/**
 * Represents an activity to add to the layout.
 */
export interface ActivityDescriptor {
  id: string;
  dockTo: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
  icon: string;
  label: string | `%${string}`;
  tooltip?: string | `%${string}`;
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
  partId: PartId | string;
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  activateView?: boolean;
  activatePart?: boolean;
  cssClass?: string | string[];
}

/**
 * Represents a part navigation in the layout.
 */
export interface PartNavigationDescriptor {
  id: string;
  commands: Commands;
  hint?: string;
  data?: NavigationData;
  state?: NavigationState;
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
