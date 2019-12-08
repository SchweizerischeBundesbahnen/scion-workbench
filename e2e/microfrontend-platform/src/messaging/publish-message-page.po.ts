import { $ } from 'protractor';
import { enterText, selectOption } from '../spec.util';
import { SwitchToIframeFn } from '../outlet.po';
import { Qualifier } from '@scion/microfrontend-platform';
import { SciCheckboxPO, SciListPO, SciParamsEnterPO, WaitUntil } from '@scion/ɵtoolkit/widgets.po';
import { MessageListItemPO } from './message-list-item.po';

export enum MessagingModel {
  Topic = 'Topic', Intent = 'Intent',
}

export class PublishMessagePagePO {

  public static readonly pageUrl = 'publish-message'; // path to the page; required by {@link TestingAppPO}

  private _pageFinder = $('app-publish-message');
  private _replyListPO: SciListPO;

  constructor(private _switchToIframeFn: SwitchToIframeFn) {
    this._replyListPO = new SciListPO(this._pageFinder.$('sci-list.e2e-replies'));
  }

  public async selectMessagingModel(messagingModel: MessagingModel): Promise<void> {
    await this._switchToIframeFn();
    await selectOption(messagingModel, this._pageFinder.$('select.e2e-messaging-model'));
  }

  public async enterTopic(topic: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(topic, this._pageFinder.$('input.e2e-topic'));
  }

  public async enterIntent(type: string, qualifier?: Qualifier): Promise<void> {
    await this._switchToIframeFn();
    await enterText(type, this._pageFinder.$('input.e2e-intent-type'));
    const paramsEnterPO = new SciParamsEnterPO(this._pageFinder.$('sci-params-enter.e2e-intent-qualifier'));
    await paramsEnterPO.clear();
    if (qualifier) {
      await paramsEnterPO.enterParams(qualifier);
    }
  }

  public async enterMessage(message: string): Promise<void> {
    await this._switchToIframeFn();
    await enterText(message, this._pageFinder.$('textarea.e2e-message'));
  }

  public async toggleRequestReply(check: boolean): Promise<void> {
    await this._switchToIframeFn();
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-request-reply')).toggle(check);
  }

  public async toggleRetain(check: boolean): Promise<void> {
    await this._switchToIframeFn();
    await new SciCheckboxPO(this._pageFinder.$('sci-checkbox.e2e-retain')).toggle(check);
  }

  public async clickPublish(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-publish').click();
  }

  public async clickCancel(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-cancel').click();
  }

  public async clickClearReplies(): Promise<void> {
    await this._switchToIframeFn();
    await this._pageFinder.$('button.e2e-clear-replies').click();
  }

  public async getTopicSubscriberCount(): Promise<number> {
    await this._switchToIframeFn();
    const count = await this._pageFinder.$('span.e2e-topic-subscriber-count').getText();
    return Number(count);
  }

  public async getReplies(waitUntil?: WaitUntil): Promise<MessageListItemPO[]> {
    await this._switchToIframeFn();
    const listItemPOs = await this._replyListPO.getListItems(waitUntil);
    return listItemPOs.map(listItemPO => new MessageListItemPO(listItemPO, this._switchToIframeFn));
  }

  public async getFirstReplyOrElseReject(maxWaitTimeout?: number): Promise<MessageListItemPO> {
    await this._switchToIframeFn();
    const messages = await this.getReplies({itemCount: 1, matcher: 'eq', timeout: maxWaitTimeout});
    return messages[0];
  }

  public async getPublishError(): Promise<string> {
    await this._switchToIframeFn();
    const publishErrorFinder = this._pageFinder.$('output.e2e-publish-error');
    if (await publishErrorFinder.isPresent()) {
      return publishErrorFinder.getText();
    }
    return null;
  }
}
