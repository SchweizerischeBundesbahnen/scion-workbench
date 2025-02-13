/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, IterableDiffers} from '@angular/core';
import {ManifestService, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchService} from '../../workbench.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayout} from '../../layout/workbench-layout';
import {WorkbenchLayoutFn} from '../../perspective/workbench-perspective.model';
import {firstValueFrom} from 'rxjs';
import {WorkbenchLayoutFactory} from '../../layout/workbench-layout.factory';
import {MicrofrontendViewRoutes} from '../microfrontend-view/microfrontend-view-routes';
import {Logger, LoggerNames} from '../../logging';
import {filterArray} from '@scion/toolkit/operators';
import {Objects} from '../../common/objects.util';
import {WorkbenchPerspectiveData} from './workbench-perspective-data';

/**
 * Registers perspectives for workbench perspective capabilities.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveInstaller {

  constructor(private _manifestService: ManifestService,
              private _workbenchService: WorkbenchService,
              private _logger: Logger) {
    this.installPerspectiveCapabilityListener();
  }

  private installPerspectiveCapabilityListener(): void {
    const differ = inject(IterableDiffers).find([]).create<WorkbenchPerspectiveCapability>((_index, perspectiveCapability) => perspectiveCapability.metadata!.id);
    this._manifestService.lookupCapabilities$<WorkbenchPerspectiveCapability>({type: WorkbenchCapabilities.Perspective})
      .pipe(takeUntilDestroyed())
      .subscribe(perspectiveCapabilities => {
        const changes = differ.diff(perspectiveCapabilities);
        changes?.forEachAddedItem(({item: perspectiveCapability}) => void this.registerPerspective(perspectiveCapability));
      });
  }

  private async registerPerspective(perspectiveCapability: WorkbenchPerspectiveCapability): Promise<void> {
    return this._workbenchService.registerPerspective({
      id: perspectiveCapability.metadata!.id,
      layout: this.createLayout(perspectiveCapability),
      data: {
        ...perspectiveCapability.properties.data,
        [WorkbenchPerspectiveData.capability]: perspectiveCapability,
      },
    });
  }

  private createLayout(perspectiveCapability: WorkbenchPerspectiveCapability): WorkbenchLayoutFn {
    return async (factory: WorkbenchLayoutFactory): Promise<WorkbenchLayout> => {
      const [initialPart, ...parts] = perspectiveCapability.properties.layout;

      // Add parts to the layout.
      let layout = factory.addPart(initialPart.id);
      for (const part of parts) {
        layout = layout.addPart(part.id, {
          relativeTo: part.relativeTo,
          align: part.align,
          ratio: part.ratio,
        });
      }

      // Add views to the layout.
      for (const part of [initialPart, ...parts]) {
        if (!part.views?.length) {
          continue;
        }

        for (const [viewIndex, view] of part.views.entries()) {
          const viewCapabilities = await this.lookupViewCapabilities(view.qualifier, {
            perspectiveProvider: perspectiveCapability.metadata!.appSymbolicName,
            perspectiveQualifier: perspectiveCapability.qualifier,
          });

          viewCapabilities
            .map(viewCapability => viewCapability.metadata!.id)
            .sort() // Ensure stable view order in case multiple capabilities match the qualifier.
            .forEach(viewCapabilityId => {
              const commands = MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(viewCapabilityId, view.params ?? {});
              const alternativeViewId = `${part.id}-${viewCapabilityId}-${viewIndex}`;
              layout = layout
                .addView(alternativeViewId, {partId: part.id, activateView: view.active})
                .navigateView(alternativeViewId, commands, {cssClass: view.cssClass});
            });

          // Navigate to the "~" route if not finding a view capability, e.g., because the perspective provider references a private view capability
          // or has not declared an intention. Since there is no route registered under /~ the "Not Found" page will be displayed.
          if (!viewCapabilities.length) {
            this._logger.warn(() => `[NullCapabilityError] The perspective '${Objects.toMatrixNotation(perspectiveCapability.qualifier)}' cannot find the view '${Objects.toMatrixNotation(view.qualifier)}'. Verify the application is available and the view exists.`, LoggerNames.MICROFRONTEND);
            const alternativeViewId = `${part.id}-${viewIndex}`;
            layout = layout
              .addView(alternativeViewId, {partId: part.id, activateView: view.active})
              .navigateView(alternativeViewId, ['~', view.qualifier], {cssClass: view.cssClass});
          }
        }
      }

      return layout;
    };
  }

  /**
   * Searches for views that match the specified qualifier and are accessible to the perspective provider,
   * i.e., its own view capabilities or public view capabilities of other applications the perspective provider
   * has an intention for.
   */
  private async lookupViewCapabilities(qualifier: Qualifier, perspective: {perspectiveProvider: string; perspectiveQualifier: Qualifier}): Promise<WorkbenchViewCapability[]> {
    const viewCapabilities$ = this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View, qualifier})
      .pipe(filterArray(async viewCapability => {
        const allowed = await firstValueFrom(this._manifestService.isApplicationQualified$(perspective.perspectiveProvider, {capabilityId: viewCapability.metadata!.id}));
        if (!allowed) {
          this._logger.warn(`[NotQualifiedError] Application '${(perspective.perspectiveProvider)}' is not allowed to reference the view '${Objects.toMatrixNotation(viewCapability.qualifier)}' in the perspective '${Objects.toMatrixNotation(perspective.perspectiveQualifier)}'. Ensure you have specified an intention and that the view is public.`, LoggerNames.MICROFRONTEND);
        }
        return allowed;
      }));
    return firstValueFrom(viewCapabilities$);
  }
}
