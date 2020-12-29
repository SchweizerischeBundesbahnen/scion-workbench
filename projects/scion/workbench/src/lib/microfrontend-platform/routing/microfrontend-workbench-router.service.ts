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
import { WorkbenchNavigationExtras, ɵWorkbenchCommands, ɵWorkbenchNavigationMessageHeaders } from '@scion/workbench-client';
import { Subject } from 'rxjs';
import { WorkbenchRouter } from '../../routing/workbench-router.service';
import { takeUntil } from 'rxjs/operators';
import { Params } from '@angular/router';
import { Logger, LoggerNames } from '../../logging';
import { MicrofrontendViewRoutes } from './microfrontend-routes';
import { SafeRunner } from '../../safe-runner';

/**
 * Listens to microfrontend navigation requests and delegates them to {@link WorkbenchRouter}.
 *
 * This class is constructed eagerly before the Microfrontend Platform activates registered micro apps. See {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION}.
 */
@Injectable()
export class MicrofrontendWorkbenchRouter implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _messageClient: MessageClient,
              private _workbenchRouter: WorkbenchRouter,
              private _logger: Logger,
              safeRunner: SafeRunner) {
    this._messageClient.observe$<void>(ɵWorkbenchCommands.navigate)
      .pipe(takeUntil(this._destroy$))
      .subscribe(navigateRequest => safeRunner.run(() => {
        this.onNavigateRequest(navigateRequest).then();
      }));
  }

  private async onNavigateRequest(navigateRequest: TopicMessage<void>): Promise<void> {
    this._logger.debug(() => 'Processing microfrontend navigation request.', LoggerNames.MICROFRONTEND_ROUTING, navigateRequest);

    const messageHeaders = navigateRequest.headers;
    const replyTo = messageHeaders.get(MessageHeaders.ReplyTo);
    const viewCapabilityIds: string[] = messageHeaders.get(ɵWorkbenchNavigationMessageHeaders.CAPABILITY_IDS);
    const navigationExtras: WorkbenchNavigationExtras = messageHeaders.get(ɵWorkbenchNavigationMessageHeaders.NAVIGATION_EXTRAS);

    // Perform the workbench navigation. For multiple capabilities, navigate one after the other.
    // Otherwise they would resolve to the same view for target 'blank'.
    for (const viewCapabilityId of viewCapabilityIds) {
      try {
        await this.navigate(viewCapabilityId, navigationExtras);
      }
      catch (error) {
        return this._messageClient.publish(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
      }
    }
    return this._messageClient.publish(replyTo, null, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)});
  }

  private navigate(viewCapabilityId: string, navigationExtras: WorkbenchNavigationExtras): Promise<boolean> {
    const navigateCommand = this.buildMicrofrontendNavigateCommand(viewCapabilityId, navigationExtras.params);

    this._logger.debug(() => 'Instructing workbench router to navigate.', LoggerNames.MICROFRONTEND_ROUTING, navigateCommand);
    return this._workbenchRouter.navigate(navigateCommand, {
      activateIfPresent: navigationExtras.activateIfPresent,
      closeIfPresent: navigationExtras.closeIfPresent,
      target: navigationExtras.target,
      blankInsertionIndex: navigationExtras.blankInsertionIndex,
      selfViewId: navigationExtras.selfViewId,
    });
  }

  /**
   * Builds the command array used for navigating to a microfrontend view.
   *
   * Format: ['~', <viewCapabilityId>, <matrixParams, if any>]
   */
  private buildMicrofrontendNavigateCommand(viewCapabilityId: string, matrixParams: Params): any[] {
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
