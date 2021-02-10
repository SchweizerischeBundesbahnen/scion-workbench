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
import { MessageClient, MessageHeaders, ResponseStatusCodes, TopicMessage } from '@scion/microfrontend-platform';
import { WorkbenchNavigationExtras, WorkbenchViewCapability, ɵWorkbenchCommands, ɵWorkbenchRouterNavigateCommand } from '@scion/workbench-client';
import { WorkbenchRouter } from '../../routing/workbench-router.service';
import { Params, Router } from '@angular/router';
import { Logger, LoggerNames } from '../../logging';
import { MicrofrontendViewRoutes } from './microfrontend-routes';
import { Arrays, Dictionaries, Dictionary } from '@scion/toolkit/util';
import { Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { serializeExecution } from '../../operators';

/**
 * Handles microfrontend navigate commands, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendNavigateCommandHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _messageClient: MessageClient,
              private _workbenchRouter: WorkbenchRouter,
              private _router: Router,
              private _logger: Logger) {
    this._messageClient.observe$<ɵWorkbenchRouterNavigateCommand>(ɵWorkbenchCommands.navigate)
      .pipe(
        serializeExecution(request => this.handleNavigateCommand(request)),
        catchError((error, caught) => {
          this._logger.error(() => '[NavigateError] Unexpected. Workbench navigation failed: ', LoggerNames.MICROFRONTEND_ROUTING, error);
          return caught;
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private async handleNavigateCommand(message: TopicMessage<ɵWorkbenchRouterNavigateCommand>): Promise<void> {
    const navigateCommand = message.body;
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);

    // For multiple capabilities, navigate sequentially to avoid resolving to the same view for target 'blank'.
    try {
      for (const viewCapability of navigateCommand.capabilities) {
        const success = await this.navigate(viewCapability, navigateCommand.extras);
        if (!success) {
          await this._messageClient.publish(replyTo, false, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
          return;
        }
      }
      await this._messageClient.publish(replyTo, true, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      this._logger.error(() => '[NavigateError] Unexpected. Workbench navigation failed: ', LoggerNames.MICROFRONTEND_ROUTING, error);
      await this._messageClient.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
  }

  private navigate(viewCapability: WorkbenchViewCapability, extras: WorkbenchNavigationExtras): Promise<boolean> {
    const matrixParams = this.computeMatrixParams(extras);
    const routerNavigateCommand = this.buildRouterNavigateCommand(viewCapability.metadata.id, matrixParams);

    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, routerNavigateCommand, viewCapability);

    return this._workbenchRouter.navigate(routerNavigateCommand, {
      activateIfPresent: extras.activateIfPresent,
      closeIfPresent: extras.closeIfPresent,
      target: extras.target,
      blankInsertionIndex: extras.blankInsertionIndex,
      selfViewId: extras.selfViewId,
    });
  }

  /**
   * Computes matrix parameters according to the defined `paramsHandling` strategy.
   * Parameters with the value `undefined` are ignored.
   */
  private computeMatrixParams(extras: WorkbenchNavigationExtras): Dictionary {
    const params = Dictionaries.coerce(extras.params);

    if (extras.paramsHandling === 'merge' && extras.target === 'self' && extras.selfViewId) {
      const currentViewUrlSegments = this._router.parseUrl(this._router.url).root.children[extras.selfViewId].segments;
      const currentMatrixParams = Arrays.last(currentViewUrlSegments).parameters;
      const mergedMatrixParams = {
        ...currentMatrixParams,
        ...params, // new params have precedence over params contained in the URL
      };

      return withoutUndefinedEntries(mergedMatrixParams);
    }

    return withoutUndefinedEntries(params);
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

function stringifyError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.toString();
}

/**
 * Returns a new dictionary with `undefined` values removed.
 */
function withoutUndefinedEntries(object: Dictionary): Dictionary {
  return Object.entries(object).reduce((dictionary, [key, value]) => {
    if (value !== undefined) {
      dictionary[key] = value;
    }
    return dictionary;
  }, {});
}
