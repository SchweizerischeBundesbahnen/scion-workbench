/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, IterableChanges, IterableDiffer, IterableDiffers} from '@angular/core';
import {ManifestObjectFilter, ManifestService, QualifierMatcher} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability, WorkbenchPerspectiveCapabilityPart, WorkbenchPerspectiveCapabilityView, WorkbenchPerspectiveExtensionCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchService} from '../../workbench.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Logger} from '../../logging/logger';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {WorkbenchLayoutFn} from '../../perspective/workbench-perspective.model';
import {firstValueFrom, MonoTypeOperatorFunction} from 'rxjs';
import {filterArray} from '@scion/toolkit/operators';
import {LoggerNames} from '../../logging';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchLayoutFactory} from '../../layout/workbench-layout.factory';

@Injectable()
export class MicrofrontendPerspectiveCapabilityRegistrator {

  private _perspectivesDiffer: IterableDiffer<WorkbenchPerspectiveCapability>;
  private _perspectiveExtensionsDiffer: IterableDiffer<WorkbenchPerspectiveExtensionCapability>;

  constructor(private _manifestService: ManifestService,
              private _workbenchService: WorkbenchService,
              private _logger: Logger,
              differs: IterableDiffers) {
    this._perspectivesDiffer = differs.find([]).create<WorkbenchPerspectiveCapability>((index, perspectiveCapability) => perspectiveCapability.metadata!.id);
    this._perspectiveExtensionsDiffer = differs.find([]).create<WorkbenchPerspectiveExtensionCapability>((index, perspectiveExtensionCapability) => perspectiveExtensionCapability.metadata!.id);
    this.installPerspectiveCapabilityChangeListener();
    this.installPerspectiveExtensionCapabilityChangeListener();
  }

  private installPerspectiveCapabilityChangeListener(): void {
    this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective})
      .pipe(takeUntilDestroyed())
      .subscribe(perspectiveCapabilities => {
        const changes = this._perspectivesDiffer.diff(perspectiveCapabilities);
        changes?.forEachAddedItem(({item: perspectiveCapability}) => {
          this.registerPerspective(perspectiveCapability).then();
        });

        changes?.forEachRemovedItem(({item: perspectiveCapability}) => {
          this.unregisterPerspective(perspectiveCapability).then();
        });
      });
  }

  private installPerspectiveExtensionCapabilityChangeListener(): void {
    this._manifestService.lookupCapabilities$<WorkbenchPerspectiveExtensionCapability>({type: WorkbenchCapabilities.PerspectiveExtension})
      .pipe(takeUntilDestroyed())
      .subscribe(async perspectiveExtensionCapabilities => { // eslint-disable-line rxjs/no-async-subscribe
        for (const perspectiveCapability of await this.filterChangedPerspectives(perspectiveExtensionCapabilities)) {
          const perspectiveId = perspectiveCapability.metadata!.id;
          const active = this._workbenchService.getPerspective(perspectiveId)?.active;
          await this.unregisterPerspective(perspectiveCapability);
          await this.registerPerspective(perspectiveCapability);
          if (active) {
            await this._workbenchService.switchPerspective(perspectiveId);
          }
        }
      });
  }

  private async filterChangedPerspectives(perspectiveExtensionCapabilities: WorkbenchPerspectiveExtensionCapability[]): Promise<WorkbenchPerspectiveCapability[]> {
    const perspectiveCapabilities = new Array<WorkbenchPerspectiveCapability>();
    const addedPerspectiveExtensionCapabilities = collectChanges(this._perspectiveExtensionsDiffer.diff(perspectiveExtensionCapabilities)).added;
    for (const perspectiveExtensionCapability of addedPerspectiveExtensionCapabilities) {
      for (const perspectiveCapability of await firstValueFrom(this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective, qualifier: perspectiveExtensionCapability.properties.perspective}))) {
        perspectiveCapabilities.push(perspectiveCapability);
      }
    }
    return Arrays.distinct(perspectiveCapabilities, perspectiveCapability => perspectiveCapability.metadata!.id);
  }

  private async registerPerspective(perspectiveCapability: WorkbenchPerspectiveCapability): Promise<void> {
    const perspectiveExtensions = await firstValueFrom(this._manifestService.lookupCapabilities$<WorkbenchPerspectiveExtensionCapability>({type: WorkbenchCapabilities.PerspectiveExtension})
      .pipe(
        filterByPerspective(new QualifierMatcher(perspectiveCapability.qualifier)),
        this.filterIfQualifiedForPerspective(perspectiveCapability),
      ),
    );
    return this._workbenchService.registerPerspective({
      id: perspectiveCapability.metadata!.id,
      layout: this.createLayout(perspectiveCapability, perspectiveExtensions),
      data: perspectiveCapability.properties?.data,
    });
  }

  private createLayout(perspectiveCapability: WorkbenchPerspectiveCapability, perspectiveExtensions: WorkbenchPerspectiveExtensionCapability[]): WorkbenchLayoutFn {
    return async (factoy: WorkbenchLayoutFactory): Promise<WorkbenchLayout> => {
      // Add contributed parts to the layout.
      let layout = factoy.addPart(perspectiveCapability.properties.parts[0].id);
      for (const part of perspectiveCapability.properties.parts.slice(1)) {
        layout = layout.addPart(part.id, {
          relativeTo: (part as WorkbenchPerspectiveCapabilityPart).relativeTo,
          align: (part as WorkbenchPerspectiveCapabilityPart).align,
          ratio: (part as WorkbenchPerspectiveCapabilityPart).ratio,
        });
      }

      // Add contributed views to the layout.
      for (const perspectiveExtension of perspectiveExtensions) {
        for (const view of perspectiveExtension.properties.views) {
          const viewCapabilities = await this.lookupViewCapabilities(view, perspectiveExtension);
          for (const viewCapability of viewCapabilities) {
            layout = layout.addView(viewCapability.metadata!.id, {
              partId: view.partId,
              position: view.position,
              activateView: view.active,
            });
          }
        }
      }
      return layout;
    };
  }

  private lookupViewCapabilities(view: WorkbenchPerspectiveCapabilityView, perspectiveExtension: WorkbenchPerspectiveExtensionCapability): Promise<WorkbenchViewCapability[]> {
    const viewCapabilityFilter: ManifestObjectFilter = {type: WorkbenchCapabilities.View, qualifier: view.qualifier};
    const viewCapabilities$ = this._manifestService.lookupCapabilities$<WorkbenchViewCapability>(viewCapabilityFilter).pipe(this.filterIfQualifiedForView(perspectiveExtension));
    return firstValueFrom(viewCapabilities$);
  }

  private unregisterPerspective(perspectiveCapability: WorkbenchPerspectiveCapability): Promise<void> {
    return this._workbenchService.unregisterPerspective(perspectiveCapability.metadata!.id);
  }

  private filterIfQualifiedForView(perspectiveExtension: WorkbenchPerspectiveExtensionCapability): MonoTypeOperatorFunction<WorkbenchViewCapability[]> {
    return filterArray(async viewCapability => {
      const qualified = await firstValueFrom(this._manifestService.isApplicationQualified$(perspectiveExtension.metadata!.appSymbolicName, {capabilityId: viewCapability.metadata!.id}));
      if (!qualified) {
        this._logger.error(`[NotQualifiedError] Application ${perspectiveExtension.metadata!.appSymbolicName} is not qualified to reference view in perspective extension [view=${JSON.stringify(viewCapability.qualifier)}, perspectiveExtension=${JSON.stringify(perspectiveExtension)}`, LoggerNames.MICROFRONTEND);
      }
      return qualified;
    });
  }

  private filterIfQualifiedForPerspective(perspective: WorkbenchPerspectiveCapability): MonoTypeOperatorFunction<WorkbenchPerspectiveExtensionCapability[]> {
    return filterArray(async perspectiveExtension => {
      const qualified = await firstValueFrom(this._manifestService.isApplicationQualified$(perspectiveExtension.metadata!.appSymbolicName, {capabilityId: perspective.metadata!.id}));
      if (!qualified) {
        this._logger.error(`[NotQualifiedError] Application ${perspectiveExtension.metadata!.appSymbolicName} is not qualified to extend perspective [perspective=${JSON.stringify(perspective.qualifier)}, perspectiveExtension=${JSON.stringify(perspectiveExtension)}`, LoggerNames.MICROFRONTEND);
      }
      return qualified;
    });
  }
}

function filterByPerspective(perspectiveMatcher: QualifierMatcher): MonoTypeOperatorFunction<WorkbenchPerspectiveExtensionCapability[]> {
  return filterArray(extension => perspectiveMatcher.matches(extension.properties.perspective));
}

function collectChanges<T>(iterableChanges: IterableChanges<T> | undefined | null): {added: T[]; removed: T[]} {
  const changes = {added: new Array<T>(), removed: new Array<T>()};
  iterableChanges?.forEachAddedItem(({item}) => changes.added.push(item));
  iterableChanges?.forEachRemovedItem(({item}) => changes.removed.push(item));
  return changes;
}
