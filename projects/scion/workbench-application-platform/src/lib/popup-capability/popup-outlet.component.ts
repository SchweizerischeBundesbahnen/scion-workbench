/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { Popup } from '@scion/workbench';
import { ApplicationRegistry } from '../core/application-registry.service';
import { Url } from '../core/url.util';
import { Defined } from '../core/defined.util';
import { HostMessage, MessageEnvelope, PopupCapability, PopupHostMessageTypes, PopupIntentMessage } from '@scion/workbench-application-platform.api';
import { Arrays } from '../core/array.util';

/**
 * Provides an outlet to render the application as described by {PopupCapability} in a workbench popup.
 */
@Component({
  selector: 'wap-popup-outlet',
  templateUrl: './popup-outlet.component.html',
  styleUrls: ['./popup-outlet.component.scss'],
})
export class PopupOutletComponent {

  private _closeOnEscape: boolean;
  private _closeOnFocusLost: boolean;

  public siteUrl: string;
  public siteCssClasses: string[];
  public symbolicName: string;

  constructor(applicationRegistry: ApplicationRegistry, private _popup: Popup) {
    const input: PopupInput = this._popup.input;
    const popupCapability = input.capability;
    const intentMessage = input.intentMessage;
    this.symbolicName = popupCapability.metadata.symbolicAppName;
    this._closeOnEscape = PopupOutletComponent.isCloseOnEscape(intentMessage);
    this._closeOnFocusLost = PopupOutletComponent.isCloseOnFocusLost(intentMessage);

    this.siteUrl = Url.createUrl({
      base: applicationRegistry.getApplication(this.symbolicName).baseUrl,
      path: Url.substitutePathVariables(popupCapability.properties.path, intentMessage.qualifier),
      matrixParams: Url.substituteParamVariables({...popupCapability.properties.matrixParams, ...intentMessage.payload.matrixParams}, intentMessage.qualifier),
      queryParams: Url.substituteParamVariables({...popupCapability.properties.queryParams, ...intentMessage.payload.queryParams}, intentMessage.qualifier),
    });
    this.siteCssClasses = [`e2e-${this.symbolicName}`, 'e2e-popup', ...Arrays.from(popupCapability.properties.cssClass)];
  }

  public onFocusout(): void {
    this._closeOnFocusLost && this._popup.close();
  }

  public onEscape(): void {
    this._closeOnEscape && this._popup.close();
  }

  public onHostMessage(envelope: MessageEnvelope<HostMessage>): void {
    switch (envelope.message.type) {
      case PopupHostMessageTypes.Close: {
        this._popup.close(envelope.message.payload);
        break;
      }
      default: {
        throw Error(`[IllegalHostMessageError]: Unknown host message type [type='${envelope.message.type}'].`);
      }
    }
  }

  public static isCloseOnEscape(intentMessage: PopupIntentMessage): boolean {
    return intentMessage.payload.closeStrategy ? Defined.orElse(intentMessage.payload.closeStrategy.onEscape, true) : true;
  }

  public static isCloseOnFocusLost(intentMessage: PopupIntentMessage): boolean {
    return intentMessage.payload.closeStrategy ? Defined.orElse(intentMessage.payload.closeStrategy.onFocusLost, true) : true;
  }

  public static isCloseonGridLayoutChange(intentMessage: PopupIntentMessage): boolean {
    return intentMessage.payload.closeStrategy ? Defined.orElse(intentMessage.payload.closeStrategy.onGridLayoutChange, true) : true;
  }
}

export interface PopupInput {
  capability: PopupCapability;
  intentMessage: PopupIntentMessage;
}

