/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {IntentClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchMessageBoxConfig} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {MessageBoxService} from '../../message-box/message-box.service';

/**
 * Handles intents that refer to the built-in message box capability, allowing microfrontends to display simple message boxes.
 *
 * This class is constructed after connected to the SCION Microfrontend Platform via {@link MICROFRONTEND_PLATFORM_POST_STARTUP} DI token.
 *
 * @see WorkbenchHostManifestInterceptor
 * @see MICROFRONTEND_PLATFORM_POST_STARTUP
 */
@Injectable()
export class MicrofrontendMessageBoxIntentHandler {

  constructor(intentClient: IntentClient, messageBoxService: MessageBoxService, logger: Logger) {
    intentClient.onIntent<WorkbenchMessageBoxConfig, string>({type: WorkbenchCapabilities.MessageBox, qualifier: {}}, ({body: config}) => {
      logger.debug(() => 'Opening message box', LoggerNames.MICROFRONTEND, config);
      return messageBoxService.open({
        title: config?.title,
        content: config?.content,
        actions: config?.actions,
        severity: config?.severity,
        modality: config?.modality,
        contentSelectable: config?.contentSelectable,
        cssClass: config?.cssClass,
        context: config?.context,
      });
    });
  }
}
