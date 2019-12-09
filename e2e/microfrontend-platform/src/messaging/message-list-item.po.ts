/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { SwitchToIframeFn } from '../outlet.po';
import { SciListItemPO } from '@scion/ɵtoolkit/widgets.po';
import { ElementFinder } from 'protractor';
import { Qualifier } from '@scion/microfrontend-platform';

export class MessageListItemPO {

  private _contentFinder: ElementFinder;

  constructor(private _listItemPO: SciListItemPO, private _switchToIframeFn: SwitchToIframeFn) {
    this._contentFinder = this._listItemPO.contentFinder.$('app-message-list-item');
  }

  public async getTopic(): Promise<string> {
    await this._switchToIframeFn();
    return this._contentFinder.$('span.e2e-topic').getText();
  }

  public async getBody(): Promise<string> {
    await this._switchToIframeFn();
    return this._contentFinder.$('span.e2e-body').getText();
  }

  public async getReplyTo(): Promise<string | undefined> {
    await this._switchToIframeFn();
    const replyToFinder = this._contentFinder.$('span.e2e-reply-to');
    const isPresent = await replyToFinder.isPresent();
    return isPresent ? replyToFinder.getText() : undefined;
  }

  public async getIntentType(): Promise<string> {
    await this._switchToIframeFn();
    return this._contentFinder.$('span.e2e-intent-type').getText();
  }

  public async getIntentQualifier(): Promise<Qualifier> {
    await this._switchToIframeFn();
    const qualifier = await this._contentFinder.$('span.e2e-intent-qualifier').getText();
    return JSON.parse(qualifier);
  }

  public async clickReply(): Promise<void> {
    await this._switchToIframeFn();
    await this._listItemPO.clickAction('e2e-reply');
  }
}
