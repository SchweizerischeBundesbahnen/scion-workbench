/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { IntentClient, ManifestService } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchMessageBoxConfig } from '@scion/workbench-client';
import { Logger, LoggerNames } from '../../logging';
import { MessageBoxService } from '../../message-box/message-box.service';
import { WorkbenchInitializer } from '../../startup/workbench-initializer';

/**
 * Provides the built-in message box capability for microfrontends to display a plain text message.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendMessageBoxProvider implements WorkbenchInitializer {

  constructor(intentClient: IntentClient,
              messageBoxService: MessageBoxService,
              logger: Logger,
              private _manifestService: ManifestService) {
    intentClient.onIntent<WorkbenchMessageBoxConfig, string>({type: WorkbenchCapabilities.MessageBox, qualifier: {}}, ({body: config}) => {
      logger.debug(() => 'Opening message box', LoggerNames.MICROFRONTEND, config);
      return messageBoxService.open({
        ...config,
        content: config.content ?? '',
      });
    });
  }

  public async init(): Promise<void> {
    await this._manifestService.registerCapability<WorkbenchMessageBoxCapability>({
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {},
      private: false,
      description: 'Allows displaying a text message to the user.',
    });
  }
}
