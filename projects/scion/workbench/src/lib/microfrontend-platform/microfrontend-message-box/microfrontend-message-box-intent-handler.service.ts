/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, Injector, OnDestroy, Optional } from '@angular/core';
import { IntentClient, IntentMessage, ManifestService, MessageClient, MessageHeaders, ResponseStatusCodes } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities, WorkbenchMessageBoxConfig } from '@scion/workbench-client';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Logger, LoggerNames } from '../../logging';
import { SafeRunner } from '../../safe-runner';
import { WorkbenchViewRegistry } from '../../view/workbench-view.registry';
import { MessageBoxService } from '../../message-box/message-box.service';
import { MicrofrontendMessageBoxProvider } from './microfrontend-message-box-provider';
import { Beans } from '@scion/toolkit/bean-manager';
import { Maps } from '@scion/toolkit/util';

/**
 * Handles message box intents, displaying a message box using {@link MessageBoxService}.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION} DI token.
 */
@Injectable()
export class MicrofrontendMessageBoxIntentHandlerService implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _intentClient: IntentClient,
              private _messageClient: MessageClient,
              private _viewRegistry: WorkbenchViewRegistry,
              private _rootInjector: Injector,
              private _logger: Logger,
              private _safeRunner: SafeRunner,
              @Optional() @Inject(MicrofrontendMessageBoxProvider) messageBoxProviders: MicrofrontendMessageBoxProvider[]) {
    (messageBoxProviders || []).forEach(provider => {
      this.registerMessageBoxCapability(provider);
      this.handleMessageBoxIntents(provider);
    });
  }

  /**
   * Registers the message box capability in the host app.
   */
  private registerMessageBoxCapability(provider: MicrofrontendMessageBoxProvider): void {
    Beans.get(ManifestService).registerCapability({
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
    this._intentClient.observe$<WorkbenchMessageBoxConfig>(intentSelector)
      .pipe(takeUntil(this._destroy$))
      .subscribe(intentRequest => this._safeRunner.run(async () => {
        this._logger.debug(() => `Handling ${WorkbenchCapabilities.MessageBox} intent`, LoggerNames.MICROFRONTEND, intentRequest);
        const replyTo = intentRequest.headers.get(MessageHeaders.ReplyTo);
        try {
          const closeAction = await this.onMessageBoxIntent(intentRequest, provider);
          await this._messageClient.publish(replyTo, closeAction, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)});
        }
        catch (error) {
          await this._messageClient.publish(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
        }
      }));
  }

  /**
   * Method invoked when receiving a message box intent.
   */
  private async onMessageBoxIntent(intentRequest: IntentMessage<WorkbenchMessageBoxConfig>, provider: MicrofrontendMessageBoxProvider): Promise<any> {
    const params: Map<string, any> = intentRequest.intent.params;
    const config: WorkbenchMessageBoxConfig = intentRequest.body;

    const messageBoxService = this.resolveMessageBoxService(params.get('viewId'));
    return messageBoxService.open({
      title: config.title,
      content: provider.component,
      input: new Map([
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
