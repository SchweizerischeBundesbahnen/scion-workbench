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
import {Arrays, Dictionaries} from '@scion/toolkit/util';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {MicrofrontendWorkbenchView} from './microfrontend-workbench-view.model';
import {Objects} from '../../common/objects.util';

/**
 * Handles microfrontend view intents, instructing the workbench to navigate to the microfrontend of the resolved capability.
 *
 * View intents are handled in this interceptor and are not transported to the providing application, enabling support for applications
 * that are not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewIntentHandler implements IntentInterceptor {

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
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
    const intent = message.intent;
    // TODO [Angular 20] remove backward compatibility for property 'blankInsertionIndex'
    const extras: WorkbenchNavigationExtras & {blankInsertionIndex?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'} = message.body ?? {};

    const intentParams = Objects.withoutUndefinedEntries(Dictionaries.coerce(intent.params));
    const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(intentParams, viewCapability);
    const targets = this.resolveTargets(message, extras);
    const commands = extras.close ? [] : MicrofrontendViewRoutes.createMicrofrontendNavigateCommands(viewCapability.metadata!.id, urlParams);
    const partId = extras.close ? undefined : extras.partId;

    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, commands, viewCapability, transientParams);
    const navigations = await Promise.all(Arrays.coerce(targets).map(target => {
      return this._workbenchRouter.navigate(commands, {
        target,
        partId,
        activate: extras.activate,
        close: extras.close,
        position: extras.position ?? extras.blankInsertionIndex,
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
  private resolveTargets(intentMessage: IntentMessage, extras: WorkbenchNavigationExtras): string | string[] {
    // Closing a microfrontend view by viewId is not allowed, as this would violate the concept of intent-based view navigation.
    if (extras.close && extras.target) {
      throw Error(`[NavigateError] The target must be empty if closing a view [target=${(extras.target)}]`);
    }
    if (extras.close) {
      return this.resolvePresentViewIds(intentMessage, extras, {matchWildcardParams: true}) ?? [];
    }
    if (!extras.target || extras.target === 'auto') {
      return this.resolvePresentViewIds(intentMessage, extras) ?? 'blank';
    }
    return extras.target;
  }

  /**
   * Resolves opened views which match the given view intent.
   * A view matches if its view capability and all its required parameters are equal.
   *
   * Allows matching wildcard parameters by setting the option `matchWildcardParameters` to `true`.
   */
  private resolvePresentViewIds(intentMessage: IntentMessage, extras: WorkbenchNavigationExtras, options?: {matchWildcardParams?: boolean}): string[] | null {
    const requiredParams = intentMessage.capability.params?.filter(param => param.required).map(param => param.name) ?? [];
    const matchWildcardParams = options?.matchWildcardParams ?? false;

    const viewIds = this._viewRegistry.objects()
      .filter(view => !extras.partId || extras.partId === view.part().id)
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
          const intentParamValue = intentMessage.intent.params!.get(name) as unknown;
          return (matchWildcardParams && intentParamValue === '*') || intentParamValue === microfrontendWorkbenchView.params[name];
        });
      })
      .map(view => view.id);

    return viewIds.length ? viewIds : null;
  }
}
