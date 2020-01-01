/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Component, Input } from '@angular/core';
import { IntentMessage, MessageHeaders, TopicMessage } from '@scion/microfrontend-platform';

@Component({
  selector: 'app-message-list-item',
  templateUrl: './message-list-item.component.html',
  styleUrls: ['./message-list-item.component.scss'],
})
export class MessageListItemComponent {

  public MessageHeaders = MessageHeaders;

  @Input()
  public isTopicMessage: boolean;

  @Input()
  public message: TopicMessage | IntentMessage;
}
