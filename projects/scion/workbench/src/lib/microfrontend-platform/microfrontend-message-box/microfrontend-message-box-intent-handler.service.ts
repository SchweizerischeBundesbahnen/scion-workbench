/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { IntentClient, ManifestService } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchMessageBoxConfig } from '@scion/workbench-client';
import { Logger, LoggerNames } from '../../logging';
import { WorkbenchViewRegistry } from '../../view/workbench-view.registry';
import { MessageBoxService } from '../../message-box/message-box.service';
import { MicrofrontendMessageBoxProvider } from './microfrontend-message-box-provider';
import { Beans } from '@scion/toolkit/bean-manager';
import { Maps } from '@scion/toolkit/util';
import { WorkbenchInitializer } from '../../startup/workbench-initializer';

/**
 * Handles message box intents, displaying a message box using {@link MessageBoxService}.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendMessageBoxIntentHandlerService implements WorkbenchInitializer {

  private _messageBoxProviders: MicrofrontendMessageBoxProvider[];

  constructor(private _intentClient: IntentClient,
              private _viewRegistry: WorkbenchViewRegistry,
              private _rootInjector: Injector,
              private _logger: Logger,
              @Optional() @Inject(MicrofrontendMessageBoxProvider) messageBoxProviders: MicrofrontendMessageBoxProvider[]) {
    this._messageBoxProviders = messageBoxProviders || [];
  }

  public async init(): Promise<void> {
    for (const messageBoxProvider of this._messageBoxProviders) {
      await this.registerMessageBoxCapability(messageBoxProvider);
      this.handleMessageBoxIntents(messageBoxProvider);
    }
  }

  /**
   * Registers the message box capability in the host app.
   */
  private async registerMessageBoxCapability(provider: MicrofrontendMessageBoxProvider): Promise<void> {
    await Beans.get(ManifestService).registerCapability<WorkbenchMessageBoxCapability>({
      type: WorkbenchCapabilities.MessageBox,
      qualifier: provider.qualifier,
      private: false,
      description: provider.description,
      optionalParams: ['viewId'].concat(provider.optionalParams || []), // the param 'viewId' is used for view-modal message boxes
      requiredParams: provider.requiredParams,
    });
  }

  /**
   * Subscribes to message box intents and for each intent, displays a message box with the component as configured by the provider.
   */
  private handleMessageBoxIntents(provider: MicrofrontendMessageBoxProvider): void {
    const intentSelector = {type: WorkbenchCapabilities.MessageBox, qualifier: provider.qualifier};
    this._intentClient.onIntent<WorkbenchMessageBoxConfig>(intentSelector, intentRequest => {
      this._logger.debug(() => `Handling ${WorkbenchCapabilities.MessageBox} intent`, LoggerNames.MICROFRONTEND, intentRequest);

      const params: Map<string, any> = intentRequest.intent.params;
      const config: WorkbenchMessageBoxConfig = intentRequest.body;

      const messageBoxService = this.resolveMessageBoxService(params.get('viewId'));
      return messageBoxService.open({
        title: config.title,
        content: provider.component,
        componentInput: new Map([
          ...intentRequest.headers,
          ...params,
          ...Maps.coerce(intentRequest.intent.qualifier),
          ['$implicit', config.content],
        ]),
        severity: config.severity,
        actions: config.actions,
        cssClass: config.cssClass,
        contentSelectable: config.contentSelectable,
        modality: config.modality,
      });
    });
  }

  /**
   * If passed a `viewId`, resolves to the view's message box service for opening the message box with view modality,
   * or to the root message box service otherwise.
   */
  private resolveMessageBoxService(viewId: string | undefined): MessageBoxService {
    if (viewId) {
      return this._viewRegistry.getElseThrow(viewId).portal.componentRef.injector.get(MessageBoxService);
    }
    return this._rootInjector.get(MessageBoxService);
  }
}
