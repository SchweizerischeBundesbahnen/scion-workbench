/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { MessageClient, MessageHeaders, ResponseStatusCodes } from '@scion/microfrontend-platform';
import { WorkbenchNavigationExtras, WorkbenchViewCapability, ɵWorkbenchCommands, ɵWorkbenchRouterNavigateCommand } from '@scion/workbench-client';
import { Subject } from 'rxjs';
import { WorkbenchRouter } from '../../routing/workbench-router.service';
import { takeUntil } from 'rxjs/operators';
import { Params } from '@angular/router';
import { Logger, LoggerNames } from '../../logging';
import { MicrofrontendViewRoutes } from './microfrontend-routes';
import { SafeRunner } from '../../safe-runner';

/**
 * Handles microfrontend navigate commands, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION} DI token.
 */
@Injectable()
export class MicrofrontendNavigateCommandHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _messageClient: MessageClient,
              private _workbenchRouter: WorkbenchRouter,
              private _logger: Logger,
              safeRunner: SafeRunner) {
    this._messageClient.observe$<ɵWorkbenchRouterNavigateCommand>(ɵWorkbenchCommands.navigate)
      .pipe(takeUntil(this._destroy$))
      .subscribe(navigateCommand => safeRunner.run(async () => {
        this._logger.debug(() => 'Handling microfrontend navigate command', LoggerNames.MICROFRONTEND, navigateCommand);
        const replyTo = navigateCommand.headers.get(MessageHeaders.ReplyTo);
        try {
          const success = await this.onNavigateCommand(navigateCommand.body);
          await this._messageClient.publish<boolean>(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)});
        }
        catch (error) {
          await this._messageClient.publish(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
        }
      }));
  }

  private async onNavigateCommand(command: ɵWorkbenchRouterNavigateCommand): Promise<boolean> {
    // For multiple capabilities, navigate sequentially to avoid resolving to the same view for target 'blank'.
    for (const viewCapability of command.capabilities) {
      const success = await this.navigate(viewCapability, command.extras);
      if (!success) {
        return false;
      }
    }
    return true;
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

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Returns the error message if given an error object, or the `toString` representation otherwise.
 */
function readErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.toString();
}
