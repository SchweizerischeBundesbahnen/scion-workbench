/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { MessageClient } from '@scion/microfrontend-platform';
import { WorkbenchNavigationExtras, WorkbenchViewCapability, ɵWorkbenchCommands, ɵWorkbenchRouterNavigateCommand } from '@scion/workbench-client';
import { WorkbenchRouter } from '../../routing/workbench-router.service';
import { Params } from '@angular/router';
import { Logger, LoggerNames } from '../../logging';
import { MicrofrontendViewRoutes } from './microfrontend-routes';

/**
 * Handles microfrontend navigate commands, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendNavigateCommandHandler {

  constructor(private _messageClient: MessageClient,
              private _workbenchRouter: WorkbenchRouter,
              private _logger: Logger) {
    this._messageClient.onMessage<ɵWorkbenchRouterNavigateCommand, boolean>(ɵWorkbenchCommands.navigate, async ({body: command}) => {
      this._logger.debug(() => 'Handling microfrontend navigate command', LoggerNames.MICROFRONTEND, command);

      // For multiple capabilities, navigate sequentially to avoid resolving to the same view for target 'blank'.
      for (const viewCapability of command.capabilities) {
        const success = await this.navigate(viewCapability, command.extras);
        if (!success) {
          return false;
        }
      }
      return true;
    });
  }

  private navigate(viewCapability: WorkbenchViewCapability, navigationExtras: WorkbenchNavigationExtras): Promise<boolean> {
    const routerNavigateCommand = this.buildRouterNavigateCommand(viewCapability.metadata.id, navigationExtras.params);
    this._logger.debug(() => 'Navigating to the microfrontend of a view capability', LoggerNames.MICROFRONTEND_ROUTING, routerNavigateCommand, viewCapability);

    return this._workbenchRouter.navigate(routerNavigateCommand, {
      activateIfPresent: navigationExtras.activateIfPresent,
      closeIfPresent: navigationExtras.closeIfPresent,
      target: navigationExtras.target,
      blankInsertionIndex: navigationExtras.blankInsertionIndex,
      selfViewId: navigationExtras.selfViewId,
    });
  }

  /**
   * Builds the command array to be passed to the workbench router for navigating to a microfrontend view.
   *
   * Format: ['~', <viewCapabilityId>, <matrixParams, if any>]
   */
  private buildRouterNavigateCommand(viewCapabilityId: string, matrixParams: Params): any[] {
    const matrixParamCommand = Object.keys(matrixParams).length > 0 ? [matrixParams] : [];
    return ([MicrofrontendViewRoutes.ROUTE_PREFIX, viewCapabilityId] as any[]).concat(matrixParamCommand);
  }
}
