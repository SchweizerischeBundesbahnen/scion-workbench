/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, inject, Injectable} from '@angular/core';
import {WorkbenchPartActionFn, WorkbenchViewMenuItemFn} from './workbench.model';
import {Disposable} from './common/disposable';
import {WorkbenchService} from './workbench.service';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {WorkbenchViewRegistry} from './view/workbench-view.registry';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WorkbenchPartRegistry} from './part/workbench-part.registry';
import {ɵWorkbenchView} from './view/ɵworkbench-view.model';
import {ɵWorkbenchPart} from './part/ɵworkbench-part.model';
import {ɵWorkbenchPerspective} from './perspective/ɵworkbench-perspective.model';
import {WorkbenchPerspectiveRegistry} from './perspective/workbench-perspective.registry';
import {WorkbenchPartActionRegistry} from './part/workbench-part-action.registry';
import {WorkbenchThemeSwitcher} from './theme/workbench-theme-switcher.service';
import {DialogId, PartId, PopupId, ViewId} from './workbench.identifiers';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {WorkbenchViewMenuItemRegistry} from './view/workbench-view-menu-item.registry';
import {WorkbenchFocusMonitor} from './focus/workbench-focus-tracker.service';
import {WorkbenchDialogRegistry} from './dialog/workbench-dialog.registry';
import {WorkbenchPopupRegistry} from './popup/workbench-popup.registry';
import {ɵWorkbenchPopup} from './popup/ɵworkbench-popup.model';
import {ɵWorkbenchDialog} from './dialog/ɵworkbench-dialog.model';

@Injectable({providedIn: 'root'})
export class ɵWorkbenchService implements WorkbenchService {

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _perspectiveRegistry = inject(WorkbenchPerspectiveRegistry);
  private readonly _partRegistry = inject(WorkbenchPartRegistry);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _dialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _popupRegistry = inject(WorkbenchPopupRegistry);
  private readonly _partActionRegistry = inject(WorkbenchPartActionRegistry);
  private readonly _viewMenuItemRegistry = inject(WorkbenchViewMenuItemRegistry);
  private readonly _perspectiveService = inject(WorkbenchPerspectiveService);

  public readonly layout = inject(WorkbenchLayoutService).layout;
  public readonly perspectives = inject(WorkbenchPerspectiveRegistry).elements;
  public readonly parts = inject(WorkbenchPartRegistry).elements;
  public readonly views = inject(WorkbenchViewRegistry).elements;
  public readonly dialogs = inject(WorkbenchDialogRegistry).elements;
  public readonly popups = inject(WorkbenchPopupRegistry).elements;
  public readonly activePerspective = inject(WorkbenchPerspectiveService).activePerspective;
  public readonly activeElement = inject(WorkbenchFocusMonitor).activeElement;
  public readonly settings = {
    theme: inject(WorkbenchThemeSwitcher).theme,
    panelAlignment: inject(WorkbenchLayoutService).panelAlignment,
    panelAnimation: inject(WorkbenchLayoutService).panelAnimation,
  };

  /** @inheritDoc */
  public getPerspective(perspectiveId: string): ɵWorkbenchPerspective | null {
    return this._perspectiveRegistry.get(perspectiveId, {orElse: null});
  }

  /** @inheritDoc */
  public getPart(partId: PartId): ɵWorkbenchPart | null {
    return this._partRegistry.get(partId, {orElse: null});
  }

  /** @inheritDoc */
  public getView(viewId: ViewId): ɵWorkbenchView | null {
    return this._viewRegistry.get(viewId, {orElse: null});
  }

  /** @inheritDoc */
  public getDialog(dialogId: DialogId): ɵWorkbenchDialog | null {
    return this._dialogRegistry.get(dialogId, {orElse: null});
  }

  /** @inheritDoc */
  public getPopup(popupId: PopupId): ɵWorkbenchPopup | null {
    return this._popupRegistry.get(popupId, {orElse: null});
  }

  /** @inheritDoc */
  public registerPerspective(perspective: WorkbenchPerspectiveDefinition): Promise<void> {
    assertNotInReactiveContext(this.registerPerspective, 'Call WorkbenchService.registerPerspective() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    return this._perspectiveService.registerPerspective(perspective);
  }

  /** @inheritDoc */
  public switchPerspective(id: string): Promise<boolean> {
    assertNotInReactiveContext(this.switchPerspective, 'Call WorkbenchService.switchPerspective() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    return this._perspectiveService.switchPerspective(id);
  }

  /** @inheritDoc */
  public async resetPerspective(): Promise<void> {
    assertNotInReactiveContext(this.resetPerspective, 'Call WorkbenchService.resetPerspective() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    await this._perspectiveService.resetPerspective();
  }

  /** @inheritDoc */
  public async closeViews(...viewIds: ViewId[]): Promise<boolean> {
    assertNotInReactiveContext(this.closeViews, 'Call WorkbenchService.closeViews() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    return this._workbenchRouter.navigate(layout => viewIds.reduce((layout, viewId) => layout.removeView(viewId), layout));
  }

  /** @inheritDoc */
  public registerPartAction(fn: WorkbenchPartActionFn): Disposable {
    assertNotInReactiveContext(this.registerPartAction, 'Call WorkbenchService.registerPartAction() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    this._partActionRegistry.register(fn, fn);
    return {
      dispose: () => this._partActionRegistry.unregister(fn),
    };
  }

  /** @inheritDoc */
  public registerViewMenuItem(fn: WorkbenchViewMenuItemFn): Disposable {
    assertNotInReactiveContext(this.registerViewMenuItem, 'Call WorkbenchService.registerViewMenuItem() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    this._viewMenuItemRegistry.register(fn, fn);
    return {
      dispose: () => this._viewMenuItemRegistry.unregister(fn),
    };
  }
}
