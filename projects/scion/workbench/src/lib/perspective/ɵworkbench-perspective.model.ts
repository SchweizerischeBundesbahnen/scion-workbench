/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {MPartGrid} from '../layout/workbench-layout.model';
import {EnvironmentInjector, inject, runInInjectionContext} from '@angular/core';
import {ɵStoredPerspectiveData, WorkbenchLayoutFn, WorkbenchPerspective, WorkbenchPerspectiveDefinition} from './workbench-perspective.model';
import {BehaviorSubject} from 'rxjs';
import {Commands} from '../routing/workbench-router.service';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchPeripheralGridMerger} from './workbench-peripheral-grid-merger.service';

/**
 * @inheritDoc
 */
export class ɵWorkbenchPerspective implements WorkbenchPerspective {

  private _workbenchLayoutFactory = inject(WorkbenchLayoutFactory);
  private _workbenchPeripheralGridMerger = inject(WorkbenchPeripheralGridMerger);
  private _environmentInjector = inject(EnvironmentInjector);
  private _initialLayoutFn: WorkbenchLayoutFn;
  private _storedPerspectiveData: ɵStoredPerspectiveData | undefined;

  public id: string;
  public data: {[key: string]: any};

  public active$ = new BehaviorSubject<boolean>(false);
  public viewOutlets: {[viewId: string]: Commands} = {};
  public initialGrid: MPartGrid | undefined;
  public grid: MPartGrid | undefined;

  constructor(definition: WorkbenchPerspectiveDefinition, storedPerspectiveData?: ɵStoredPerspectiveData) {
    this.id = definition.id;
    this.data = definition.data ?? {};
    this._initialLayoutFn = definition.layout;
    this._storedPerspectiveData = storedPerspectiveData;
  }

  /**
   * Constructs the initial grid of this perspective; throws an error if already constructed.
   */
  public async construct(): Promise<void> {
    if (this.constructed) {
      throw Error(`[WorkbenchPerspectiveError] Perspective '${this.id}' already constructed.`);
    }

    this.initialGrid = await this.createInitialGrid();
    if (this._storedPerspectiveData) {
      this.grid = this._workbenchPeripheralGridMerger.merge({
        local: this._workbenchLayoutFactory.create({peripheralGrid: this._storedPerspectiveData.actualPeripheralGrid}).peripheralGrid,
        base: this._workbenchLayoutFactory.create({peripheralGrid: this._storedPerspectiveData.initialPeripheralGrid}).peripheralGrid,
        remote: this.initialGrid,
      });
      this.viewOutlets = this._storedPerspectiveData.viewOutlets;
    }
    else {
      this.grid = this.initialGrid;
      this.viewOutlets = {};
    }
  }

  public get constructed(): boolean {
    return !!this.grid;
  }

  public activate(active: boolean): void {
    this.active$.next(active);
  }

  public get active(): boolean {
    return this.active$.value;
  }

  public async reset(): Promise<void> {
    this.grid = await this.createInitialGrid();
    this.viewOutlets = {};
  }

  private async createInitialGrid(): Promise<MPartGrid> {
    const layout = await runInInjectionContext(this._environmentInjector, () => this._initialLayoutFn(this._workbenchLayoutFactory.create()));
    return (layout as ɵWorkbenchLayout).peripheralGrid;
  }
}
