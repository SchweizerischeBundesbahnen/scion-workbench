/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Handler, Intent, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchNavigationExtras, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MicrofrontendViewRoutes} from './microfrontend-routes';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../messaging.util';
import {Dictionaries} from '@scion/toolkit/util';

/**
 * Handles microfrontend view intents, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * View intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench. They are not transported to the providing application.
 */
@Injectable()
export class MicrofrontendViewIntentInterceptor implements IntentInterceptor {

  constructor(private _workbenchRouter: WorkbenchRouter, private _logger: Logger) {
  }

  /**
   * View intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): void {
    if (intentMessage.intent.type === WorkbenchCapabilities.View) {
      this.consumeViewIntent(intentMessage).then();
    }
    else {
      next.handle(intentMessage);
    }
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
    const intentParams = Dictionaries.withoutUndefinedEntries(Dictionaries.coerce(intent.params));
    const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(intentParams, viewCapability);
    const qualifier = Dictionaries.withoutUndefinedEntries(intent.qualifier!);

    const routerNavigateCommand = MicrofrontendViewRoutes.buildRouterNavigateCommand(viewCapability.metadata!.id, qualifier, urlParams);
    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, routerNavigateCommand, viewCapability, transientParams);

    return this._workbenchRouter.navigate(routerNavigateCommand, {
      activateIfPresent: extras.activateIfPresent,
      closeIfPresent: extras.closeIfPresent,
      target: extras.target,
      blankInsertionIndex: extras.blankInsertionIndex,
      selfViewId: extras.selfViewId,
      state: {
        [MicrofrontendViewRoutes.TRANSIENT_PARAMS_STATE_KEY]: transientParams,
      },
    });
  }
}
