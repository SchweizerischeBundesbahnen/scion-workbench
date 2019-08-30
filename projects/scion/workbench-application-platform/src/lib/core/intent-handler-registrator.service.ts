/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, OnDestroy } from '@angular/core';
import { HOST_APPLICATION_SYMBOLIC_NAME, INTENT_HANDLER, IntentHandler } from './metadata';
import { Logger } from './logger.service';
import { Subject } from 'rxjs';
import { ManifestRegistry } from './manifest-registry.service';
import { filter, takeUntil } from 'rxjs/operators';
import { MessageBus } from './message-bus.service';
import { MessageEnvelope, NilQualifier } from '@scion/workbench-application-platform.api';
import { matchesIntentQualifier } from './qualifier-tester';

/**
 * Registers intent handlers registered via {INTENT_HANDLER} DI injection token.
 *
 * @see IntentHandler
 */
@Injectable()
export class IntentHandlerRegistrator implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(@Inject(INTENT_HANDLER) private _handlers: IntentHandler[],
              private _manifestRegistry: ManifestRegistry,
              private _messageBus: MessageBus,
              private _logger: Logger) {
  }

  public initializeHandlers(): void {
    this._handlers.forEach(handler => this.init(handler));
    this._logger.info('Installed following intent handlers', this._handlers.map(it => {
      return `${it.constructor.name} [type: ${it.type}, qualifier: ${JSON.stringify(it.qualifier || NilQualifier)}]`;
    }));
  }

  private init(handler: IntentHandler): void {
    // register the capability of this handler to receive qualified intents.
    this._manifestRegistry.registerCapability(HOST_APPLICATION_SYMBOLIC_NAME, [{
      type: handler.type,
      qualifier: handler.qualifier || NilQualifier,
      private: false,
      description: handler.description,
    }]);

    handler.onInit && handler.onInit();

    this._messageBus.receiveIntentsForApplication$(HOST_APPLICATION_SYMBOLIC_NAME)
      .pipe(
        filter(envelope => envelope.message.type === handler.type),
        filter(envelope => matchesIntentQualifier(handler.qualifier, envelope.message.qualifier)),
        takeUntil(this._destroy$),
      )
      .subscribe((envelope: MessageEnvelope) => {
        try {
          handler.onIntent(envelope);
        } catch (error) {
          this._logger.error(`Failed to handle intent [${JSON.stringify(envelope.message.qualifier || {})}]`, error);
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
