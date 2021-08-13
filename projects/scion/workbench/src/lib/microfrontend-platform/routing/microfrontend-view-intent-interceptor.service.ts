/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Handler, Intent, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {Injectable, OnDestroy} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchNavigationExtras, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {Dictionaries} from '@scion/toolkit/util';
import {MicrofrontendViewRoutes} from './microfrontend-routes';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from './router.util';
import {Subject} from 'rxjs';
import {serializeExecution} from '../../operators';
import {retry, takeUntil} from 'rxjs/operators';

/**
 * Handles microfrontend navigate intents, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * Navigate intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench.
 * Moreover, view intents are not transported to the applications that provide the view capability as swallowed by this interceptor.
 */
@Injectable()
export class MicrofrontendViewIntentInterceptor implements IntentInterceptor, OnDestroy {

  private _command$ = new Subject<() => Promise<void>>();
  private _destroy$ = new Subject<void>();

  constructor(private _workbenchRouter: WorkbenchRouter, private _logger: Logger) {
    this.installViewIntentExecutor();
  }

  /**
   * View intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): void {
    if (intentMessage.intent.type === WorkbenchCapabilities.View) {
      this._command$.next(() => this.consumeViewIntent(intentMessage));
    }
    else {
      next.handle(intentMessage);
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private installViewIntentExecutor(): void {
    this._command$
      .pipe(
        serializeExecution(command => command()),
        retry(),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private async consumeViewIntent(message: IntentMessage<WorkbenchNavigationExtras>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);
    const viewCapability = message.capability as WorkbenchViewCapability;
    try {
      const success = await this.navigate(viewCapability, message.intent, message.body!);
      await Beans.get(MessageClient).publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      await Beans.get(MessageClient).publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
  }

  private navigate(viewCapability: WorkbenchViewCapability, intent: Intent, extras: WorkbenchNavigationExtras): Promise<boolean> {
    const routerNavigateCommand = MicrofrontendViewRoutes.buildRouterNavigateCommand(viewCapability.metadata!.id, intent.qualifier!, Dictionaries.coerce(intent.params));

    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, routerNavigateCommand, viewCapability);

    return this._workbenchRouter.navigate(routerNavigateCommand, {
      activateIfPresent: extras.activateIfPresent,
      closeIfPresent: extras.closeIfPresent,
      target: extras.target,
      blankInsertionIndex: extras.blankInsertionIndex,
      selfViewId: extras.selfViewId,
    });
  }
}
