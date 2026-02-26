/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {Disposable, WorkbenchMenuCommand, WorkbenchMenuGroupCommand, WorkbenchMenuItemCommand, ɵWorkbenchCommands, ɵWorkbenchMenuContributionRequestCommand} from '../public_api';
import {WorkbenchMenuContributions} from './workbench-menu.model';
import {WorkbenchMenuService} from './workbench-menu.service';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {WorkbenchMenuCommands, ɵWorkbenchMenuContributionCommand} from './workbench-menu.command';
import {UUID} from '@scion/toolkit/uuid';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchMenuService implements WorkbenchMenuService {

  private readonly _messageClient = Beans.get(MessageClient);
  private readonly _contributions = new Map<string, Observable<WorkbenchMenuCommands>>;

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`, contributions: WorkbenchMenuContributions, context: Map<string, unknown>): Disposable {
    const menuContributionId = UUID.randomUUID();

    const menuContributions: WorkbenchMenuCommands = contributions.map(contribution => {
      switch (contribution.type) {
        case 'menu': {
          return {
            id: contribution.id,
            type: contribution.type,
            name: contribution.name,
            label: contribution.label,
            tooltip: contribution.tooltip,
            disabled: contribution.disabled ?? false,
            visualMenuHint: contribution.visualMenuHint,
            position: contribution.position,
            menu: contribution.menu,
            cssClass: contribution.cssClass,
          } satisfies WorkbenchMenuCommand;
        }
        case 'menu-item': {
          return {
            id: contribution.id,
            type: contribution.type,
            name: contribution.name,
            label: contribution.label,
            tooltip: contribution.tooltip,
            icon: contribution.icon,
            checked: contribution.checked,
            accelerator: contribution.accelerator,
            disabled: contribution.disabled ?? false,
            position: contribution.position,
            cssClass: contribution.cssClass,
          } satisfies WorkbenchMenuItemCommand;
        }
        case 'group': {
          return {
            id: contribution.id,
            type: contribution.type,
            name: contribution.name,
            label: contribution.label,
            collapsible: contribution.collapsible,
            disabled: contribution.disabled ?? false,
            position: contribution.position,
          } satisfies WorkbenchMenuGroupCommand;
        }
      }
    });

    void this._messageClient.publish<ɵWorkbenchMenuContributionCommand>(ɵWorkbenchCommands.menuContributionRegisterTopic(menuContributionId), {
      location: location,
      contributions: menuContributions,
      context: context,
    });

    // Unregister menu contributions when stopping the platform, e.g., during hot code replacement.
    void MicrofrontendPlatform.whenState(PlatformState.Stopping).then(() => {
      void this._messageClient.publish<void>(ɵWorkbenchCommands.menuContributionUnregisterTopic(menuContributionId));
    });

    return {
      dispose: () => {
        void this._messageClient.publish<void>(ɵWorkbenchCommands.menuContributionUnregisterTopic(menuContributionId));
      },
    }
  }

  public menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Observable<WorkbenchMenuCommands> {
    const cacheKey = createCacheKey(location, context);
    if (!this._contributions.has(cacheKey)) {
      const contributions$ = this._messageClient.request$<WorkbenchMenuCommands>(ɵWorkbenchCommands.menuContributionTopic, {location, context} satisfies ɵWorkbenchMenuContributionRequestCommand).pipe(mapToBody());
      this._contributions.set(cacheKey, contributions$);
    }
    return this._contributions.get(cacheKey)!;
  }
}

function createCacheKey(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): string {
  return `${location}-${JSON.stringify([...context.entries()].sort(([a], [b]) => a.localeCompare(b)))}`;
}
