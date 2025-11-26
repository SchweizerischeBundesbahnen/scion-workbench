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
import {WorkbenchCapabilities, WorkbenchViewCapability, ɵWorkbenchNavigateCommand} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MicrofrontendViewRoutes} from './microfrontend-view-routes';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {Dictionaries} from '@scion/toolkit/util';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {prune} from '../../common/prune.util';

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
      return this.consumeViewIntent(intentMessage as IntentMessage<ɵWorkbenchNavigateCommand | undefined>);
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeViewIntent(message: IntentMessage<ɵWorkbenchNavigateCommand | undefined>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo) as string;
    const success = await this.navigate(message);
    await Beans.get(MessageClient).publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
  }

  private async navigate(message: IntentMessage<ɵWorkbenchNavigateCommand | undefined>): Promise<boolean> {
    const capability = message.capability as WorkbenchViewCapability;
    const command: ɵWorkbenchNavigateCommand = message.body ?? {};

    const intentParams = prune(Dictionaries.coerce(message.intent.params));
    const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(intentParams, capability);
    const targets = this.resolveTargets(message, command);
    const microfrontendViewCommands = command.close ? [] : MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(capability.metadata!.id, urlParams);
    const partId = command.close ? undefined : command.partId;

    this._logger.debug(() => `Navigating to: ${capability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, microfrontendViewCommands, capability, transientParams);
    const navigations = await Promise.all(targets.map(target => {
      return this._workbenchRouter.navigate(microfrontendViewCommands, {
        target,
        partId,
        activate: command.activate,
        close: command.close,
        position: command.position,
        cssClass: command.cssClass,
        state: prune({
          [MicrofrontendViewRoutes.STATE_TRANSIENT_PARAMS]: transientParams,
        }),
      });
    }));
    return navigations.every(Boolean);
  }

  /**
   * Resolves the target(s) for this navigation.
   */
  private resolveTargets(intentMessage: IntentMessage, command: ɵWorkbenchNavigateCommand): string[] {
    // Closing a microfrontend view by viewId is not allowed, as this would violate the concept of intent-based view navigation.
    if (command.close && command.target) {
      throw Error(`[NavigateError] The target must be empty if closing a view [target=${(command.target)}]`);
    }
    if (command.close) {
      return this.findViews(intentMessage, command, {matchWildcardParams: true}) ?? [];
    }
    if (!command.target || command.target === 'auto') {
      return this.findViews(intentMessage, command, {matchWildcardParams: false}) ?? ['blank'];
    }
    return [command.target];
  }

  /**
   * Finds views matching the given view intent.
   *
   * A view matches if its view capability and all its required parameters are equal.
   *
   * Allows matching wildcard parameters by setting the option `matchWildcardParams` to `true`.
   */
  private findViews(intentMessage: IntentMessage, command: ɵWorkbenchNavigateCommand, options: {matchWildcardParams: boolean}): string[] | null {
    const requiredParams = intentMessage.capability.params?.filter(param => param.required) ?? [];

    const viewIds = this._layout()
      .views({
        peripheral: command.partId ? undefined : false,
        partId: command.partId,
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
