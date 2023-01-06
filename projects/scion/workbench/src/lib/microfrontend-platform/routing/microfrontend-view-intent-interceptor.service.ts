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
import {WorkbenchCapabilities, WorkbenchNavigationExtras, WorkbenchViewCapability, ɵWorkbenchLegacyNavigationExtras} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MicrofrontendViewRoutes} from './microfrontend-routes';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {Arrays, Dictionaries} from '@scion/toolkit/util';
import {MicrofrontendNavigationalStates} from './microfrontend-navigational-states';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';

/**
 * Handles microfrontend view intents, instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * View intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench. They are not transported to the providing application.
 */
@Injectable()
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
    const extras: WorkbenchNavigationExtras & Pick<ɵWorkbenchLegacyNavigationExtras, 'closeIfPresent'> = message.body ?? {};

    const intentParams = Dictionaries.withoutUndefinedEntries(Dictionaries.coerce(intent.params));
    const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(intentParams, viewCapability);
    const qualifier = Dictionaries.withoutUndefinedEntries(intent.qualifier!);
    const targets = this.resolveTargets(message, extras);
    const close = extras.close || extras.closeIfPresent;
    const routerNavigateCommand = close ? [] : MicrofrontendViewRoutes.buildRouterNavigateCommand(viewCapability.metadata!.id, qualifier, urlParams);

    this._logger.debug(() => `Navigating to: ${viewCapability.properties.path}`, LoggerNames.MICROFRONTEND_ROUTING, routerNavigateCommand, viewCapability, transientParams);
    const navigations = await Promise.all(Arrays.coerce(targets).map(target => {
      return this._workbenchRouter.navigate(routerNavigateCommand, {
        target,
        activate: extras.activate,
        close: close,
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
  private resolveTargets(intentMessage: IntentMessage, extras: WorkbenchNavigationExtras & Pick<ɵWorkbenchLegacyNavigationExtras, 'activateIfPresent' | 'selfViewId' | 'closeIfPresent'>): string | string[] {
    const target = this.mapLegacyTarget(extras, intentMessage.headers.get(MessageHeaders.AppSymbolicName));
    if (extras.close || extras.closeIfPresent) {
      // Closing a microfrontend view by viewId is not allowed, as this would violate the concept of intent-based view navigation.
      if (target) {
        throw Error(`[WorkbenchRouterError][IllegalArgumentError] The target must be empty if closing a view [target=${target}]`);
      }
      return this.resolvePresentViewIds(intentMessage, {matchWildcardParams: true}) ?? [];
    }
    if (!target || target === 'auto') {
      return this.resolvePresentViewIds(intentMessage) ?? 'blank';
    }
    return target;
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

    const viewIds = this._viewRegistry.viewIds.filter(viewId => {
      const view = this._viewRegistry.getElseThrow(viewId);
      if (!MicrofrontendViewRoutes.isMicrofrontendRoute(view.urlSegments)) {
        return false;
      }

      // Test whether the capability matches.
      const viewParams = MicrofrontendViewRoutes.parseParams(view.urlSegments);
      if (viewParams.viewCapabilityId !== intentMessage.capability.metadata!.id) {
        return false;
      }

      // Test whether all "navigational" params match.
      return requiredParams.every(name => {
        const intentParam = intentMessage.intent.params!.get(name);
        return (matchWildcardParams && intentParam === '*') || intentParam === viewParams.urlParams[name];
      });
    });

    return viewIds.length ? viewIds : null;
  }

  /**
   * Maps the target of "old" workbench clients to the new Router API.
   *
   * @deprecated since version 14; API will be removed in version 16
   */
  private mapLegacyTarget(extras: WorkbenchNavigationExtras & Pick<ɵWorkbenchLegacyNavigationExtras, 'activateIfPresent' | 'selfViewId' | 'closeIfPresent'>, app: string): string | undefined {
    const target = extras.target;
    if (extras.closeIfPresent) {
      this._logger.warn(`[DEPRECATION][F7A3F38] Application '${app}' is using a deprecated Workbench Router API. The property 'WorkbenchNavigationExtras.closeIfPresent' is deprecated and will be removed in version 16. Closing views is now controlled by setting the property 'WorkbenchNavigationExtras.close'.`);
      return undefined; // legacy API does not support target for closing views
    }
    if (extras.activateIfPresent) {
      this._logger.warn(`[DEPRECATION][D952ED0] Application '${app}' is using a deprecated Workbench Router API. The property 'WorkbenchNavigationExtras.activateIfPresent' is deprecated and will be removed in version 16. View resolution is now controlled by setting the property 'WorkbenchNavigationExtras.target' and view activation by setting the property 'WorkbenchNavigationExtras.activate'. By default, the target is set to 'auto', resolving an already opened view in first priority before opening a new view.`);
      return 'auto';
    }
    if (target === 'self' || (!target && extras.selfViewId)) {
      this._logger.warn(`[DEPRECATION][9E773CB6] Application '${app}' is using a deprecated Workbench Router API. 'WorkbenchNavigationExtras.target=self' and 'WorkbenchNavigationExtras.selfViewId' are deprecated and will be removed in version 16. Set the target view in 'WorkbenchNavigationExtras.target' instead.`);
      return extras.selfViewId ?? 'auto';
    }
    return target;
  }
}
