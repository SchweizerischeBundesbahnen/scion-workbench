/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, DOCUMENT, inject, Injectable, Signal, untracked} from '@angular/core';
import {WorkbenchPartActionFn, WorkbenchTheme, WorkbenchViewMenuItemFn} from './workbench.model';
import {Disposable} from './common/disposable';
import {WorkbenchService} from './workbench.service';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {WORKBENCH_VIEW_REGISTRY} from './view/workbench-view.registry';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WORKBENCH_PART_REGISTRY} from './part/workbench-part.registry';
import {ɵWorkbenchView} from './view/ɵworkbench-view.model';
import {ɵWorkbenchPart} from './part/ɵworkbench-part.model';
import {ɵWorkbenchPerspective} from './perspective/ɵworkbench-perspective.model';
import {WORKBENCH_PERSPECTIVE_REGISTRY} from './perspective/workbench-perspective.registry';
import {WORKBENCH_PART_ACTION_REGISTRY} from './part/workbench-part-action.registry';
import {WorkbenchThemeSwitcher} from './theme/workbench-theme-switcher.service';
import {PartId, ViewId} from './workbench.identifiers';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {WORKBENCH_VIEW_MENU_ITEM_REGISTRY} from './view/workbench-view-menu-item.registry';

@Injectable({providedIn: 'root'})
export class ɵWorkbenchService implements WorkbenchService {

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _perspectiveRegistry = inject(WORKBENCH_PERSPECTIVE_REGISTRY);
  private readonly _partRegistry = inject(WORKBENCH_PART_REGISTRY);
  private readonly _partActionRegistry = inject(WORKBENCH_PART_ACTION_REGISTRY);
  private readonly _viewMenuItemRegistry = inject(WORKBENCH_VIEW_MENU_ITEM_REGISTRY);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _perspectiveService = inject(WorkbenchPerspectiveService);

  public readonly layout = inject(WorkbenchLayoutService).layout;
  public readonly perspectives = inject(WORKBENCH_PERSPECTIVE_REGISTRY).objects;
  public readonly parts = inject(WORKBENCH_PART_REGISTRY).objects;
  public readonly views = inject(WORKBENCH_VIEW_REGISTRY).objects;
  public readonly activePerspective = inject(WorkbenchPerspectiveService).activePerspective;
  public readonly theme = this.computeLegacyThemeObject();
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

  /** @inheritDoc */
  public async switchTheme(theme: string): Promise<void> {
    assertNotInReactiveContext(this.switchTheme, 'Call WorkbenchService.switchTheme() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    this.settings.theme.set(theme);
  }

  private computeLegacyThemeObject(): Signal<WorkbenchTheme | null> {
    const documentElement = inject(DOCUMENT).documentElement;

    return computed(() => {
      const theme = this.settings.theme();

      return untracked(() => {
        if (!theme) {
          return null;
        }

        return {
          name: theme,
          colorScheme: getComputedStyle(documentElement).colorScheme as 'light' | 'dark',
        };
      });
    });
  }
}
