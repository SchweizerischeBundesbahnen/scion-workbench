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
import {inject, Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchNavigationExtras, WorkbenchViewCapability} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MicrofrontendViewRoutes} from './microfrontend-view-routes';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {Dictionaries} from '@scion/toolkit/util';
import {Objects} from '../../common/objects.util';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';

/**
 * Handles microfrontend view intents, instructing the workbench to navigate to the microfrontend of the resolved capability.
 *
 * View intents are handled in this interceptor and are not transported to the providing application, enabling support for applications
 * that are not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewIntentHandler implements IntentInterceptor {

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _layout = inject(WorkbenchLayoutService).layout;
  private readonly _logger = inject(Logger);

  /**
   * View intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.View) {
      return this.consumeViewIntent(intentMessage as IntentMessage<WorkbenchNavigationExtras | undefined>);
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeViewIntent(message: IntentMessage<WorkbenchNavigationExtras | undefined>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo) as string;
    const success = await this.navigate(message);
    await Beans.get(MessageClient).publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
  }

  private async navigate(message: IntentMessage<WorkbenchNavigationExtras | undefined>): Promise<boolean> {
    const viewCapability = message.capability as WorkbenchViewCapability;
    const extras: WorkbenchNavigationExtras = message.body ?? {};

    const intentParams = Objects.withoutUndefinedEntries(Dictionaries.coerce(message.intent.params));
    const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(intentParams, viewCapability);
    const targets = this.resolveTargets(message, extras);
    const commands = extras.close ? [] : MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(viewCapability.metadata!.id, urlParams);
    const partId = extras.close ? undefined : extras.partId;

    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, commands, viewCapability, transientParams);
    const navigations = await Promise.all(targets.map(target => {
      return this._workbenchRouter.navigate(commands, {
        target,
        partId,
        activate: extras.activate,
        close: extras.close,
        position: extras.position,
        cssClass: extras.cssClass,
        state: Objects.withoutUndefinedEntries({
          [MicrofrontendViewRoutes.STATE_TRANSIENT_PARAMS]: transientParams,
        }),
      });
    }));
    return navigations.every(Boolean);
  }

  /**
   * Resolves the target(s) for this navigation.
   */
  private resolveTargets(intentMessage: IntentMessage, extras: WorkbenchNavigationExtras): string[] {
    // Closing a microfrontend view by viewId is not allowed, as this would violate the concept of intent-based view navigation.
    if (extras.close && extras.target) {
      throw Error(`[NavigateError] The target must be empty if closing a view [target=${(extras.target)}]`);
    }
    if (extras.close) {
      return this.findViews(intentMessage, extras, {matchWildcardParams: true}) ?? [];
    }
    if (!extras.target || extras.target === 'auto') {
      return this.findViews(intentMessage, extras, {matchWildcardParams: false}) ?? ['blank'];
    }
    return [extras.target];
  }

  /**
   * Finds views matching the given view intent.
   *
   * A view matches if its view capability and all its required parameters are equal.
   *
   * Allows matching wildcard parameters by setting the option `matchWildcardParams` to `true`.
   */
  private findViews(intentMessage: IntentMessage, extras: WorkbenchNavigationExtras, options: {matchWildcardParams: boolean}): string[] | null {
    const requiredParams = intentMessage.capability.params?.filter(param => param.required) ?? [];

    const viewIds = this._layout()
      .views({
        peripheral: extras.partId ? undefined : false,
        partId: extras.partId,
      })
      .filter(mView => {
        const url = this._layout().urlSegments({outlet: mView.id});
        const microfrontendURL = MicrofrontendViewRoutes.parseMicrofrontendURL(url);
        if (!microfrontendURL) {
          return false;
        }

        // Test whether the capability matches.
        if (microfrontendURL.capabilityId !== intentMessage.capability.metadata!.id) {
          return false;
        }

        // Test whether all "navigational" params match.
        return requiredParams.every(({name}) => {
          const newParamValue = intentMessage.intent.params!.get(name) as unknown;
          return (options.matchWildcardParams && newParamValue === '*') || newParamValue === microfrontendURL.params[name];
        });

      })
      .map(view => view.id);

    return viewIds.length ? viewIds : null;
  }
}
