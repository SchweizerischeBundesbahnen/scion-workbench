/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivityId, Commands, DockedPartExtras, DockingArea, NavigationData, NavigationState, PartExtras, PartId, ReferencePart, Translatable, WorkbenchLayout, WorkbenchLayoutFactory} from '@scion/workbench';
import {MAIN_AREA} from '../../../workbench.model';
import {ActivatedRoute} from '@angular/router';

/**
 * Implementation of {@link WorkbenchLayoutFactory} that can be used in page objects.
 */
export class ɵWorkbenchLayoutFactory implements WorkbenchLayoutFactory {

  public addPart(id: string | MAIN_AREA, extras?: PartExtras): WorkbenchLayout {
    return new ɵWorkbenchLayout().addInitialPart(id, extras);
  }
}

/**
 * Implementation of {@link WorkbenchLayout} that can be used in page objects.
 */
export class ɵWorkbenchLayout implements WorkbenchLayout {

  public dockedParts = new Array<DockedPartDescriptor>();
  public parts = new Array<PartDescriptor>();
  public views = new Array<ViewDescriptor>();
  public partNavigations = new Array<PartNavigationDescriptor>();
  public viewNavigations = new Array<ViewNavigationDescriptor>();
  public activeParts = new Array<string>();
  public activeViews = new Array<string>();
  public removeParts = new Array<string>();

  public addInitialPart(id: string | MAIN_AREA, extras?: PartExtras): WorkbenchLayout {
    this.parts.push({id, title: extras?.title, activate: extras?.activate, cssClass: extras?.cssClass});
    return this;
  }

  public addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, extras?: PartExtras): WorkbenchLayout;
  public addPart(id: string, dockTo: DockingArea, extras: DockedPartExtras): WorkbenchLayout;
  public addPart(id: string, reference: ReferencePart | DockingArea, extras?: PartExtras | DockedPartExtras): WorkbenchLayout {
    if ('dockTo' in reference) {
      return this.addDockedPart(id, reference, extras as DockedPartExtras);
    }
    else {
      return this._addPart(id, reference, extras as PartExtras);
    }
  }

  private _addPart(id: string | MAIN_AREA, relativeTo: ReferencePart, extras?: PartExtras): WorkbenchLayout {
    this.parts.push({
      id,
      relativeTo: relativeTo.relativeTo,
      align: relativeTo.align,
      ratio: relativeTo.ratio,
      title: extras?.title,
      cssClass: extras?.cssClass,
      activate: extras?.activate,
    });
    return this;
  }

  private addDockedPart(id: string, dockTo: DockingArea, extras: DockedPartExtras): WorkbenchLayout {
    this.dockedParts.push({
      id,
      dockTo: dockTo.dockTo,
      icon: extras.icon,
      label: extras.label,
      tooltip: extras.tooltip,
      title: extras.title,
      cssClass: extras.cssClass,
      activate: extras.activate,
      ɵactivityId: extras.ɵactivityId,
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
    this.removeParts.push(id);
    return this;
  }

  public activateView(id: string, options?: {activatePart?: boolean}): WorkbenchLayout {
    this.activeViews.push(id);
    if (options?.activatePart) {
      throw Error('[PageObjectError] Option `activatePart` in `WorkbenchLayout.activateView` is not supported.');
    }
    return this;
  }

  public activatePart(id: string): WorkbenchLayout {
    this.activeParts.push(id);
    return this;
  }

  public moveView(id: string, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): WorkbenchLayout {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.moveView` is not supported.');
  }

  public hasPart(id: string): boolean {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.hasPart` is not supported.');
  }

  public hasView(id: string): boolean {
    throw Error('[PageObjectError] Operation `WorkbenchLayout.hasView` is not supported.');
  }

  public modify(modifyFn: (layout: WorkbenchLayout) => WorkbenchLayout): WorkbenchLayout {
    return modifyFn(this);
  }
}

/**
 * Represents a docked part to add to the layout.
 */
export interface DockedPartDescriptor {
  id: string;
  dockTo: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
  icon: string;
  label: Translatable;
  tooltip?: Translatable;
  title?: Translatable | false;
  cssClass?: string | string[];
  activate?: boolean;
  ɵactivityId?: ActivityId;
}

/**
 * Represents a part to add to the layout.
 */
export interface PartDescriptor {
  id: string | MAIN_AREA;
  relativeTo?: string;
  align?: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  title?: Translatable;
  activate?: boolean;
  cssClass?: string | string[];
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
