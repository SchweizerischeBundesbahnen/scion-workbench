/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Signal} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WorkbenchMenuItemFactoryFn, WorkbenchPartAction, WorkbenchTheme} from './workbench.model';
import {Disposable} from './common/disposable';
import {WorkbenchService} from './workbench.service';
import {WorkbenchRouter} from './routing/workbench-router.service';
import {WorkbenchViewRegistry} from './view/workbench-view.registry';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './perspective/workbench-perspective.model';
import {WorkbenchPartRegistry} from './part/workbench-part.registry';
import {ɵWorkbenchView} from './view/ɵworkbench-view.model';
import {ɵWorkbenchPart} from './part/ɵworkbench-part.model';
import {ɵWorkbenchPerspective} from './perspective/ɵworkbench-perspective.model';
import {WorkbenchPerspectiveRegistry} from './perspective/workbench-perspective.registry';
import {WorkbenchPartActionRegistry} from './part/workbench-part-action.registry';
import {WorkbenchThemeSwitcher} from './theme/workbench-theme-switcher.service';
import {ViewId} from './view/workbench-view.model';
import {ɵWorkbenchLayout} from './layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {throwError} from './common/throw-error.util';

@Injectable({providedIn: 'root'})
export class ɵWorkbenchService implements WorkbenchService {

  public readonly layout$: Observable<ɵWorkbenchLayout>;
  public readonly perspectives$: Observable<readonly ɵWorkbenchPerspective[]>;
  public readonly parts$: Observable<readonly ɵWorkbenchPart[]>;
  public readonly views$: Observable<readonly ɵWorkbenchView[]>;
  public readonly theme$: Observable<WorkbenchTheme | null>;
  public readonly activePerspective: Signal<WorkbenchPerspective | null>;

  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _perspectiveRegistry: WorkbenchPerspectiveRegistry,
              private _partRegistry: WorkbenchPartRegistry,
              private _partActionRegistry: WorkbenchPartActionRegistry,
              private _viewRegistry: WorkbenchViewRegistry,
              private _perspectiveService: WorkbenchPerspectiveService,
              private _layoutService: WorkbenchLayoutService,
              private _workbenchThemeSwitcher: WorkbenchThemeSwitcher) {
    this.layout$ = this._layoutService.layout$;
    this.perspectives$ = this._perspectiveRegistry.perspectives$;
    this.parts$ = this._partRegistry.parts$;
    this.views$ = this._viewRegistry.views$;
    this.theme$ = this._workbenchThemeSwitcher.theme$;
    this.activePerspective = this._perspectiveService.activePerspective;
  }

  public get layout(): ɵWorkbenchLayout {
    return this._layoutService.layout ?? throwError('[NullLayoutError] Workbench layout not created yet.');
  }

  /** @inheritDoc */
  public get perspectives(): readonly ɵWorkbenchPerspective[] {
    return this._perspectiveRegistry.perspectives;
  }

  /** @inheritDoc */
  public getPerspective(perspectiveId: string): ɵWorkbenchPerspective | null {
    return this._perspectiveRegistry.get(perspectiveId, {orElse: null});
  }

  /** @inheritDoc */
  public get parts(): readonly ɵWorkbenchPart[] {
    return this._partRegistry.parts;
  }

  /** @inheritDoc */
  public getPart(partId: string): ɵWorkbenchPart | null {
    return this._partRegistry.get(partId, {orElse: null});
  }

  /** @inheritDoc */
  public get views(): readonly ɵWorkbenchView[] {
    return this._viewRegistry.views;
  }

  /** @inheritDoc */
  public getView(viewId: ViewId): ɵWorkbenchView | null {
    return this._viewRegistry.get(viewId, {orElse: null});
  }

  /** @inheritDoc */
  public registerPerspective(perspective: WorkbenchPerspectiveDefinition): Promise<void> {
    return this._perspectiveService.registerPerspective(perspective);
  }

  /** @inheritDoc */
  public switchPerspective(id: string): Promise<boolean> {
    return this._perspectiveService.switchPerspective(id);
  }

  /** @inheritDoc */
  public async resetPerspective(): Promise<void> {
    await this._perspectiveService.resetPerspective();
  }

  /** @inheritDoc */
  public async closeViews(...viewIds: ViewId[]): Promise<boolean> {
    return this._workbenchRouter.navigate(layout => viewIds.reduce((layout, viewId) => layout.removeView(viewId), layout));
  }

  /** @inheritDoc */
  public registerPartAction(action: WorkbenchPartAction): Disposable {
    return this._partActionRegistry.register(action);
  }

  /** @inheritDoc */
  public registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable {
    this.viewMenuItemProviders$.next(this.viewMenuItemProviders$.value.concat(factoryFn));
    return {
      dispose: (): void => {
        this.viewMenuItemProviders$.next(this.viewMenuItemProviders$.value.filter(it => it !== factoryFn));
      },
    };
  }

  /** @inheritDoc */
  public switchTheme(theme: string): Promise<void> {
    return this._workbenchThemeSwitcher.switchTheme(theme);
  }
}
