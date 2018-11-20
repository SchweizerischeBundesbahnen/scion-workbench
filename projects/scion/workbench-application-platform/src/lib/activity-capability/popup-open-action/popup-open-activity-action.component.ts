/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */


import { Component, Inject, Injector } from '@angular/core';
import { ACTIVITY_ACTION } from '../metadata';
import { MessageBus } from '../../core/message-bus.service';
import { noop } from 'rxjs';
import { PlatformCapabilityTypes, PopupIntentMessage, PopupOpenActivityAction } from '@scion/workbench-application-platform.api';

/**
 * Button to open a popup.
 */
@Component({
  selector: 'wap-popup-open-activity-action',
  templateUrl: './popup-open-activity-action.component.html',
  styleUrls: ['./popup-open-activity-action.component.scss'],
})
export class PopupOpenActivityActionComponent {

  constructor(@Inject(ACTIVITY_ACTION) public action: PopupOpenActivityAction,
              private _messageBus: MessageBus,
              private _injector: Injector) {
  }

  public onClick(event: Event): void {
    event.preventDefault(); // prevent UA to follow 'href'

    const closeStrategy = this.action.properties.closeStrategy;
    const popupIntentMessage: PopupIntentMessage = {
      type: PlatformCapabilityTypes.Popup,
      qualifier: this.action.properties.qualifier,
      payload: {
        queryParams: this.action.properties.queryParams,
        matrixParams: this.action.properties.matrixParams,
        anchor: (event.target as Element).getBoundingClientRect(),
        position: 'south',
        closeStrategy: {
          onFocusLost: closeStrategy && closeStrategy.onFocusLost,
          onEscape: closeStrategy && closeStrategy.onEscape,
          onGridLayoutChange: closeStrategy && closeStrategy.onGridLayoutChange,
        }
      },
    };

    this._messageBus.requestReply({channel: 'intent', message: popupIntentMessage}, this.action.metadata.symbolicAppName, {injector: this._injector}).then(noop);
  }
}
