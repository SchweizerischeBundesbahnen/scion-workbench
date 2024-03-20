/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Handler, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchNavigationExtras, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MicrofrontendViewRoutes} from './microfrontend-routes';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {Arrays, Dictionaries} from '@scion/toolkit/util';
import {MicrofrontendNavigationalStates} from './microfrontend-navigational-states';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {MicrofrontendWorkbenchView} from '../microfrontend-view/microfrontend-workbench-view.model';

/**
 * Handles microfrontend view intents, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * View intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench. They are not transported to the providing application.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewIntentInterceptor implements IntentInterceptor {

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _viewRegistry: WorkbenchViewRegistry,
              private _logger: Logger) {
  }

  /**
   * View intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.View) {
      return this.consumeViewIntent(intentMessage);
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeViewIntent(message: IntentMessage<WorkbenchNavigationExtras | undefined>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);
    const success = await this.navigate(message);
    await Beans.get(MessageClient).publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
  }

  private async navigate(message: IntentMessage<WorkbenchNavigationExtras | undefined>): Promise<boolean> {
    const viewCapability = message.capability as WorkbenchViewCapability;
    const intent = message.intent;
    const extras: WorkbenchNavigationExtras = message.body ?? {};

    const intentParams = Dictionaries.withoutUndefinedEntries(Dictionaries.coerce(intent.params));
    const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(intentParams, viewCapability);
    const targets = this.resolveTargets(message, extras);
    const routerNavigateCommand = extras.close ? [] : MicrofrontendViewRoutes.buildRouterNavigateCommand(viewCapability.metadata!.id, urlParams);

    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, routerNavigateCommand, viewCapability, transientParams);
    const navigations = await Promise.all(Arrays.coerce(targets).map(target => {
      return this._workbenchRouter.navigate(routerNavigateCommand, {
        target,
        activate: extras.activate,
        close: extras.close,
        blankInsertionIndex: extras.blankInsertionIndex,
        cssClass: extras.cssClass,
        state: {
          [MicrofrontendNavigationalStates.transientParams]: transientParams,
        },
      });
    }));
    return navigations.every(Boolean);
  }

  /**
   * Resolves the target(s) for this navigation.
   */
  private resolveTargets(intentMessage: IntentMessage, extras: WorkbenchNavigationExtras): string | string[] {
    // Closing a microfrontend view by viewId is not allowed, as this would violate the concept of intent-based view navigation.
    if (extras.close && extras.target) {
      throw Error(`[WorkbenchRouterError][IllegalArgumentError] The target must be empty if closing a view [target=${(extras.target)}]`);
    }
    if (extras.close) {
      return this.resolvePresentViewIds(intentMessage, {matchWildcardParams: true}) ?? [];
    }
    if (!extras.target || extras.target === 'auto') {
      return this.resolvePresentViewIds(intentMessage) ?? 'blank';
    }
    return extras.target;
  }

  /**
   * Resolves opened views which match the given view intent.
   * A view matches if its view capability and all its required parameters are equal.
   *
   * Allows matching wildcard parameters by setting the option `matchWildcardParameters` to `true`.
   */
  private resolvePresentViewIds(intentMessage: IntentMessage, options?: {matchWildcardParams?: boolean}): string[] | null {
    const requiredParams = intentMessage.capability.params?.filter(param => param.required).map(param => param.name) ?? [];
    const matchWildcardParams = options?.matchWildcardParams ?? false;

    const viewIds = this._viewRegistry.views
      .filter(view => {
        const microfrontendWorkbenchView = view.adapt(MicrofrontendWorkbenchView);
        if (!microfrontendWorkbenchView) {
          return false;
        }

        // Test whether the capability matches.
        if (microfrontendWorkbenchView.capability.metadata!.id !== intentMessage.capability.metadata!.id) {
          return false;
        }

        // Test whether all "navigational" params match.
        return requiredParams.every(name => {
          const intentParamValue = intentMessage.intent.params!.get(name);
          return (matchWildcardParams && intentParamValue === '*') || intentParamValue === microfrontendWorkbenchView.params[name];
        });
      })
      .map(view => view.id);

    return viewIds.length ? viewIds : null;
  }
}
