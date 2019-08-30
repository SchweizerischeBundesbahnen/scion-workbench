/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ElementRef, Inject, Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { PopupConfig, PopupService } from '@scion/workbench';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { Logger } from '../core/logger.service';
import { PopupInput, PopupOutletComponent } from './popup-outlet.component';
import { MessageBus } from '../core/message-bus.service';
import { DOCUMENT } from '@angular/common';
import { IntentMessage, MessageEnvelope, PlatformCapabilityTypes, PopupCapability, PopupIntentMessage } from '@scion/workbench-application-platform.api';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ManifestCollector } from '../core/manifest-collector.service';

/**
 * Shows a workbench popup for intents of the type 'popup'.
 *
 * This class acts as mediator between popup intents and popup capabilities.
 *
 * If an application intends to show some popup, the respective popup capability
 * is looked up to provide metadata about the page to load in the popup.
 */
@Injectable()
export class PopupIntentDispatcher implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _renderer: Renderer2;

  constructor(private _logger: Logger,
              private _manifestRegistry: ManifestRegistry,
              private _messageBus: MessageBus,
              private _popupService: PopupService,
              @Inject(DOCUMENT) private _document: any,
              rendererFactory: RendererFactory2,
              private _manifestCollector: ManifestCollector) {
      this._renderer = rendererFactory.createRenderer(null, null);
  }

  public init(): void {
    this._manifestCollector.whenManifests.then(() => this.installIntentListener());
  }

  private onIntent(envelope: MessageEnvelope<PopupIntentMessage>): void {
    const intentMessage: PopupIntentMessage = envelope.message;
    const popupCapability = this.resolvePopupCapabilityProvider(envelope);
    if (!popupCapability) {
      return;
    }

    const virtualAnchor = this.createVirtualAnchorElement(envelope._outletBoundingBox, intentMessage.payload.anchor);

    const popupConfig: PopupConfig = {
      component: PopupOutletComponent,
      anchor: new ElementRef(virtualAnchor),
      position: intentMessage.payload.position,
      width: popupCapability.properties.width,
      height: popupCapability.properties.height,
      cssClass: popupCapability.properties.cssClass,
      closeStrategy: {
        onFocusLost: false, // handled in `PopupOutletComponent` because the focus is lost when the iframe document becomes the focus owner
        onEscape: PopupOutletComponent.isCloseOnEscape(intentMessage),
        onGridLayoutChange: PopupOutletComponent.isCloseonGridLayoutChange(intentMessage),
      },
    };
    const popupInput: PopupInput = {
      capability: popupCapability,
      intentMessage: intentMessage,
    };
    this._popupService.open(popupConfig, popupInput).then(result => {
      virtualAnchor.remove();
      this._messageBus.publishReply(result, envelope.sender, envelope.replyToUid);
    });
  }

  private installIntentListener(): void {
    this._messageBus.receiveIntents$()
      .pipe(
        filter(envelope => envelope.message.type === PlatformCapabilityTypes.Popup),
        takeUntil(this._destroy$),
      )
      .subscribe((envelope: MessageEnvelope<PopupIntentMessage>) => {
        try {
          this.onIntent(envelope);
        } catch (error) {
          this._logger.error(`Failed to handle intent [${JSON.stringify(envelope.message.qualifier || {})}]`, error);
        }
      });
  }

  private createVirtualAnchorElement(outletBoundingBox: ClientRect | null, anchor: ClientRect): Element {
    const outletTop = outletBoundingBox && outletBoundingBox.top || 0;
    const outletLeft = outletBoundingBox && outletBoundingBox.left || 0;

    const virtualAnchor = this._renderer.createElement('div');
    this._renderer.setStyle(virtualAnchor, 'display', 'block');
    this._renderer.setStyle(virtualAnchor, 'position', 'absolute');
    this._renderer.setStyle(virtualAnchor, 'pointer-events', 'none');
    this._renderer.setStyle(virtualAnchor, 'top', `${(outletTop + anchor.top)}px`);
    this._renderer.setStyle(virtualAnchor, 'left', `${(outletLeft + anchor.left)}px`);
    this._renderer.setStyle(virtualAnchor, 'width', `${anchor.width}px`);
    this._renderer.setStyle(virtualAnchor, 'height', `${anchor.height}px`);
    this._renderer.appendChild(this._document.body, virtualAnchor);
    return virtualAnchor;
  }

  private resolvePopupCapabilityProvider(envelope: MessageEnvelope<IntentMessage>): PopupCapability {
    const qualifier = envelope.message.qualifier;
    const popupCapabilities = this._manifestRegistry.getCapabilities<PopupCapability>(PlatformCapabilityTypes.Popup, qualifier)
      .filter(capability => this._manifestRegistry.isVisibleForApplication(capability, envelope.sender));

    if (popupCapabilities.length === 0) {
      this._logger.error(`[IllegalStateError] No capability registered matching the qualifier '${JSON.stringify(qualifier || {})}'.`, popupCapabilities);
      return null;
    }

    if (popupCapabilities.length > 1) {
      this._logger.warn(`More than one popup capability provider found for qualifier '${JSON.stringify(qualifier || {})}'.`, popupCapabilities);
    }

    return popupCapabilities[0];
  }

  public ngOnDestroy(): void {
    this._renderer.destroy();
    this._destroy$.next();
  }
}
