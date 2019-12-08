import { enterText, selectOption } from '../spec.util';
import { MessagingModel } from './publish-message-page.po';
import { $ } from 'protractor';
import { Qualifier } from '@scion/microfrontend-platform';
import { SciListPO, SciParamsEnterPO, WaitUntil } from '@scion/ɵtoolkit/widgets.po';
import { MessageListItemPO } from './message-list-item.po';

export class ReceiveMessagePagePO {

  public static readonly pageUrl = 'receive-message'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-receive-message');
  private _messageListPO: SciListPO;

  constructor(private _switchToIframeFn: () => Promise<void>) {
    this._messageListPO = new SciListPO(this._pageFinder.$('sci-list.e2e-messages'));
  }

  public async selectMessagingModel(messagingModel: MessagingModel): Promise<void> {
    await this._switchToIframeFn();
    await selectOption(messagingModel, this._pageFinder.$('select.e2e-messaging-model'));
  }

  public async enterTopic(topic: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(topic, this._pageFinder.$('input.e2e-topic'));
  }

  public async enterIntentSelector(type: string, qualifier?: Qualifier): Promise<void> {
    await this._switchToIframeFn();
    await enterText(type, this._pageFinder.$('input.e2e-intent-type'));
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-intent-qualifier'));
    await paramsEnterPO.clear();
    if (qualifier) {
      await paramsEnterPO.enterParams(qualifier);
    }
  }

  public async clickSubscribe(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-subscribe').click();
  }

  public async clickUnsubscribe(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-unsubscribe').click();
  }

  public async clickClearMessages(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-clear-messages').click();
  }

  public async getMessages(waitUntil?: WaitUntil): Promise<MessageListItemPO[]> {
    await this._switchToIframeFn();
    const listItemPOs = await this._messageListPO.getListItems(waitUntil);
    return listItemPOs.map(listItemPO => new MessageListItemPO(listItemPO, this._switchToIframeFn));
  }

  public async getFirstMessageOrElseReject(maxWaitTimeout?: number): Promise<MessageListItemPO> {
    await this._switchToIframeFn();
    const messages = await this.getMessages({itemCount: 1, matcher: 'eq', timeout: maxWaitTimeout});
    return messages[0];
  }
}
