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
import { PlatformCapabilityTypes, ViewIntentMessage, ViewOpenActivityAction } from '@scion/workbench-application-platform.api';

/**
 * Button to open a view.
 */
@Component({
  selector: 'wap-view-open-activity-action',
  templateUrl: './view-open-activity-action.component.html',
  styleUrls: ['./view-open-activity-action.component.scss'],
})
export class ViewOpenActivityActionComponent {

  constructor(@Inject(ACTIVITY_ACTION) public action: ViewOpenActivityAction,
              private _messageBus: MessageBus,
              private _injector: Injector) {
  }

  public onClick(event: Event): void {
    event.preventDefault(); // prevent UA to follow 'href'

    const viewIntentMessage: ViewIntentMessage = {
      type: PlatformCapabilityTypes.View,
      qualifier: this.action.properties.qualifier,
      payload: {
        queryParams: this.action.properties.queryParams,
        matrixParams: this.action.properties.matrixParams,
        activateIfPresent: this.action.properties.activateIfPresent,
        closeIfPresent: this.action.properties.closeIfPresent
      },
    };

    this._messageBus.publishMessageIfQualified({channel: 'intent', message: viewIntentMessage}, this.action.metadata.symbolicAppName, {injector: this._injector});
  }
}
