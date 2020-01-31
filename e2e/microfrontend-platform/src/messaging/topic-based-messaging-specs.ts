/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Outlets, TestingAppOrigins, TestingAppPO } from '../testing-app.po';
import { MessagingModel, PublishMessagePagePO } from './publish-message-page.po';
import { ReceiveMessagePagePO } from './receive-message-page.po';
import { BrowserOutletPO } from '../browser-outlet/browser-outlet.po';
import { expectToBeRejectedWithError } from '../spec.util';
import { MessageListItemPO } from './message-list-item.po';
import { TopicMessage } from '@scion/microfrontend-platform';

/**
 * Contains Specs for topic-based messaging.
 */
export namespace TopicBasedMessagingSpecs {

  export namespace RootOutlets {

    /**
     * Tests that messages can be published and received.
     */
    export async function publishSpec(publisherOrigin: string, receiverOrigin: string): Promise<void> {
      await testPublishInternal({
        publisher: {useClass: PublishMessagePagePO, origin: publisherOrigin},
        receiver: {useClass: ReceiveMessagePagePO, origin: receiverOrigin},
      });
    }

    /**
     * Tests that an application can reply to a message.
     */
    export async function replySpec(publisherOrigin: string, receiverOrigin: string): Promise<void> {
      await testReplyInternal({
        publisher: {useClass: PublishMessagePagePO, origin: publisherOrigin},
        receiver: {useClass: ReceiveMessagePagePO, origin: receiverOrigin},
      });
    }
  }

  export namespace ChildOutlets {

    /**
     * Tests that messages can be published and received.
     */
    export async function publishSpec(publisherOrigin: string, receiverOrigin: string): Promise<void> {
      await testPublishInternal({
        outlet1: {
          outlet2: {
            publisher: {useClass: PublishMessagePagePO, origin: publisherOrigin},
          },
        },
        outlet3: {
          outlet4: {
            outlet5: {
              receiver: {useClass: ReceiveMessagePagePO, origin: receiverOrigin},
            },
          },
        },
      });
    }

    /**
     * Tests that an application can reply to a message.
     */
    export async function replySpec(publisherOrigin: string, receiverOrigin: string): Promise<void> {
      await testReplyInternal({
        outlet1: {
          outlet2: {
            publisher: {useClass: PublishMessagePagePO, origin: publisherOrigin},
          },
        },
        outlet3: {
          outlet4: {
            outlet5: {
              receiver: {useClass: ReceiveMessagePagePO, origin: receiverOrigin},
            },
          },
        },
      });
    }
  }

  /**
   * Tests that messages can be published and received.
   */
  async function testPublishInternal(testSetup: Outlets): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo(testSetup);

    const receiverPO = pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('some-topic');
    await receiverPO.clickSubscribe();

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.enterMessage('first message');

    // publish the first message
    await publisherPO.clickPublish();

    const message1PO = await receiverPO.getFirstMessageOrElseReject();
    await expect(message1PO.getTopic()).toEqual('some-topic');
    await expect(message1PO.getBody()).toEqual('first message');
    await expect(message1PO.getReplyTo()).toBeUndefined();

    // clear the messages list
    await receiverPO.clickClearMessages();
    await expect(receiverPO.getMessages()).toEqual([]);

    // publish a second message
    await publisherPO.enterMessage('second message');
    await publisherPO.clickPublish();

    const message2PO = await receiverPO.getFirstMessageOrElseReject();
    await expect(message2PO.getTopic()).toEqual('some-topic');
    await expect(message2PO.getBody()).toEqual('second message');
    await expect(message2PO.getReplyTo()).toBeUndefined();

    // clear the messages list
    await receiverPO.clickClearMessages();
    await expect(receiverPO.getMessages()).toEqual([]);

    // publish a third message
    await publisherPO.enterMessage('third message');
    await publisherPO.clickPublish();

    const message3PO = await receiverPO.getFirstMessageOrElseReject();
    await expect(message3PO.getTopic()).toEqual('some-topic');
    await expect(message3PO.getBody()).toEqual('third message');
    await expect(message3PO.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that an application can reply to a message.
   */
  async function testReplyInternal(testSetup: Outlets): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo(testSetup);

    const receiverPO = pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('some-topic');
    await receiverPO.clickSubscribe();

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.enterMessage('some-payload');
    await publisherPO.toggleRequestReply(true);
    await publisherPO.clickPublish();

    const messagePO = await receiverPO.getFirstMessageOrElseReject();
    const replyTo = await messagePO.getReplyTo();
    await expect(replyTo).not.toBeUndefined();

    // send a reply
    await messagePO.clickReply();

    const reply1PO = await publisherPO.getFirstReplyOrElseReject();
    await expect(reply1PO.getTopic()).toEqual(replyTo);
    await expect(reply1PO.getBody()).toEqual('this is a reply');
    await expect(reply1PO.getReplyTo()).toBeUndefined();

    // clear the replies list
    await publisherPO.clickClearReplies();
    await expect(publisherPO.getReplies()).toEqual([]);

    // send a second reply
    await messagePO.clickReply();
    const reply2PO = await publisherPO.getFirstReplyOrElseReject();
    await expect(reply2PO.getTopic()).toEqual(replyTo);
    await expect(reply2PO.getBody()).toEqual('this is a reply');
    await expect(reply2PO.getReplyTo()).toBeUndefined();

    // clear the replies list
    await publisherPO.clickClearReplies();
    await expect(publisherPO.getReplies()).toEqual([]);

    // send a third reply
    await messagePO.clickReply();
    const reply3PO = await publisherPO.getFirstReplyOrElseReject();
    await expect(reply3PO.getTopic()).toEqual(replyTo);
    await expect(reply3PO.getBody()).toEqual('this is a reply');
    await expect(reply3PO.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that a message is dispatched to multiple subscribers.
   */
  export async function subscribersReceiveSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');

    const receiver1PO = pagePOs.get<ReceiveMessagePagePO>('receiver1');
    await receiver1PO.selectMessagingModel(MessagingModel.Topic);
    await receiver1PO.enterTopic('some-topic');
    await receiver1PO.clickSubscribe();

    const receiver2PO = pagePOs.get<ReceiveMessagePagePO>('receiver2');
    await receiver2PO.selectMessagingModel(MessagingModel.Topic);
    await receiver2PO.enterTopic('some-topic');
    await receiver2PO.clickSubscribe();

    const receiver3PO = pagePOs.get<ReceiveMessagePagePO>('receiver3');
    await receiver3PO.selectMessagingModel(MessagingModel.Topic);
    await receiver3PO.enterTopic('some-topic');
    await receiver3PO.clickSubscribe();

    // publish the first message
    await publisherPO.enterMessage('first message');
    await publisherPO.clickPublish();

    await expect((await receiver1PO.getFirstMessageOrElseReject()).getBody()).toEqual('first message');
    await expect((await receiver2PO.getFirstMessageOrElseReject()).getBody()).toEqual('first message');
    await expect((await receiver3PO.getFirstMessageOrElseReject()).getBody()).toEqual('first message');

    // clear the messages
    await receiver1PO.clickClearMessages();
    await receiver2PO.clickClearMessages();
    await receiver3PO.clickClearMessages();

    // publish the second message
    await publisherPO.enterMessage('second message');
    await publisherPO.clickPublish();

    await expect((await receiver1PO.getFirstMessageOrElseReject()).getBody()).toEqual('second message');
    await expect((await receiver2PO.getFirstMessageOrElseReject()).getBody()).toEqual('second message');
    await expect((await receiver3PO.getFirstMessageOrElseReject()).getBody()).toEqual('second message');
  }

  /**
   * Tests that publishing a request to a topic throws an error when no replier is subscribed to the topic.
   */
  export async function throwIfNoReplierFoundSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
    });

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.toggleRequestReply(true);
    await publisherPO.clickPublish();

    await expect(publisherPO.getPublishError()).toContain('[RequestReplyError]');
  }

  /**
   * Tests receiving replies of multiple message subscribers.
   */
  export async function subscribersReplySpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.toggleRequestReply(true);

    const receiver1PO = pagePOs.get<ReceiveMessagePagePO>('receiver1');
    await receiver1PO.selectMessagingModel(MessagingModel.Topic);
    await receiver1PO.enterTopic('some-topic');
    await receiver1PO.clickSubscribe();

    const receiver2PO = pagePOs.get<ReceiveMessagePagePO>('receiver2');
    await receiver2PO.selectMessagingModel(MessagingModel.Topic);
    await receiver2PO.enterTopic('some-topic');
    await receiver2PO.clickSubscribe();

    const receiver3PO = pagePOs.get<ReceiveMessagePagePO>('receiver3');
    await receiver3PO.selectMessagingModel(MessagingModel.Topic);
    await receiver3PO.enterTopic('some-topic');
    await receiver3PO.clickSubscribe();

    // publish the message
    await publisherPO.enterMessage('message');
    await publisherPO.clickPublish();

    // send a replies from every subscriber
    await (await receiver1PO.getFirstMessageOrElseReject()).clickReply();
    await expect((await publisherPO.getFirstReplyOrElseReject()).getBody()).toEqual('this is a reply');
    await publisherPO.clickClearReplies();

    await (await receiver2PO.getFirstMessageOrElseReject()).clickReply();
    await expect((await publisherPO.getFirstReplyOrElseReject()).getBody()).toEqual('this is a reply');
    await publisherPO.clickClearReplies();

    await (await receiver3PO.getFirstMessageOrElseReject()).clickReply();
    await expect((await publisherPO.getFirstReplyOrElseReject()).getBody()).toEqual('this is a reply');
    await publisherPO.clickClearReplies();
  }

  /**
   * Tests topic subscription count to work as expected.
   */
  export async function subscriberCountSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_1},
      receiver2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);

    // 'receiver1' subscribes to 'topic-1'
    const receiver1PO = pagePOs.get<ReceiveMessagePagePO>('receiver1');
    await receiver1PO.selectMessagingModel(MessagingModel.Topic);
    await receiver1PO.enterTopic('topic-1');
    await receiver1PO.clickSubscribe();

    // 'receiver2' subscribes to 'topic-2'
    const receiver2PO = pagePOs.get<ReceiveMessagePagePO>('receiver2');
    await receiver2PO.selectMessagingModel(MessagingModel.Topic);
    await receiver2PO.enterTopic('topic-2');
    await receiver2PO.clickSubscribe();

    // 'receiver3' subscribes to 'topic-3'
    const receiver3PO = pagePOs.get<ReceiveMessagePagePO>('receiver3');
    await receiver3PO.selectMessagingModel(MessagingModel.Topic);
    await receiver3PO.enterTopic('topic-3');
    await receiver3PO.clickSubscribe();

    // 'receiver4' subscribes to 'topic-2'
    const receiver4PO = pagePOs.get<ReceiveMessagePagePO>('receiver4');
    await receiver4PO.selectMessagingModel(MessagingModel.Topic);
    await receiver4PO.enterTopic('topic-2');
    await receiver4PO.clickSubscribe();

    // assert subscriber count on 'topic-1'
    await publisherPO.enterTopic('topic-1');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    await receiver1PO.clickUnsubscribe();
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);
    await receiver1PO.clickSubscribe();
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    // assert subscriber count on 'topic-2'
    await publisherPO.enterTopic('topic-2');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(2);

    // assert subscriber count on 'topic-3'
    await publisherPO.enterTopic('topic-3');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    // unsubscribe 'receiver1'
    await receiver1PO.clickUnsubscribe();

    // assert subscriber count on 'topic-1'
    await publisherPO.enterTopic('topic-1');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);

    // assert subscriber count on 'topic-2'
    await publisherPO.enterTopic('topic-2');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(2);

    // assert subscriber count on 'topic-3'
    await publisherPO.enterTopic('topic-3');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    // unsubscribe 'receiver2'
    await receiver2PO.clickUnsubscribe();

    // assert subscriber count on 'topic-1'
    await publisherPO.enterTopic('topic-1');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);

    // assert subscriber count on 'topic-2'
    await publisherPO.enterTopic('topic-2');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    // assert subscriber count on 'topic-3'
    await publisherPO.enterTopic('topic-3');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    // unload page of 'receiver3'
    const outlet = pagePOs.get<BrowserOutletPO>('receiver3:outlet');
    await outlet.enterUrl('about:blank');

    // assert subscriber count on 'topic-1'
    await publisherPO.enterTopic('topic-1');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);

    // assert subscriber count on 'topic-2'
    await publisherPO.enterTopic('topic-2');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(1);

    // assert subscriber count on 'topic-3'
    await publisherPO.enterTopic('topic-3');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);

    // unsubscribe 'receiver4'
    await receiver4PO.clickUnsubscribe();

    // assert subscriber count on 'topic-1'
    await publisherPO.enterTopic('topic-1');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);

    // assert subscriber count on 'topic-2'
    await publisherPO.enterTopic('topic-2');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);

    // assert subscriber count on 'topic-3'
    await publisherPO.enterTopic('topic-3');
    await expect(publisherPO.getTopicSubscriberCount()).toEqual(0);
  }

  /**
   * Tests receiving messages which are retained on the broker.
   */
  export async function receiveRetainedMessagesSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher_app2: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver: 'about:blank',
    });

    // publish a retained message
    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher_app2');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.toggleRetain(true);
    await publisherPO.enterMessage('retained message');
    await publisherPO.clickPublish();

    const receiverOutletPO = pagePOs.get<BrowserOutletPO>('receiver');

    // test to receive retained message in app-1
    const receiverApp1PO = await receiverOutletPO.enterUrl<ReceiveMessagePagePO>({useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_1});
    await receiverApp1PO.selectMessagingModel(MessagingModel.Topic);
    await receiverApp1PO.enterTopic('some-topic');
    await receiverApp1PO.clickSubscribe();
    await expect((await receiverApp1PO.getFirstMessageOrElseReject()).getBody()).toEqual('retained message');

    // test to receive retained message in app-2
    let receiverApp2PO = await receiverOutletPO.enterUrl<ReceiveMessagePagePO>({useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2});
    await receiverApp2PO.selectMessagingModel(MessagingModel.Topic);
    await receiverApp2PO.enterTopic('some-topic');
    await receiverApp2PO.clickSubscribe();
    await expect((await receiverApp2PO.getFirstMessageOrElseReject()).getBody()).toEqual('retained message');
    await receiverApp2PO.clickClearMessages();

    // clear the retained message
    await publisherPO.enterMessage('');
    await publisherPO.clickPublish();

    // expect the empty message not to be dispatched
    await expectToBeRejectedWithError(receiverApp2PO.getFirstMessageOrElseReject(1000), /[TimeoutError]/);

    // test not to receive the retained message in app-4
    receiverApp2PO = await receiverOutletPO.enterUrl<ReceiveMessagePagePO>({useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4});
    await receiverApp2PO.selectMessagingModel(MessagingModel.Topic);
    await receiverApp2PO.enterTopic('some-topic');
    await receiverApp2PO.clickSubscribe();

    await expectToBeRejectedWithError(receiverApp2PO.getFirstMessageOrElseReject(1000), /[TimeoutError1]/);
  }

  /**
   * Tests receiving messages without a payload.
   */
  export async function receiveMessagesWithoutPayloadSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher_app2: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver_app3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    // test to receive retained message in app-3
    const receiverPO = await pagePOs.get<ReceiveMessagePagePO>('receiver_app3');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('some-topic');
    await receiverPO.clickSubscribe();

    // publish a retained message
    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher_app2');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.clickPublish();

    await expect((await receiverPO.getFirstMessageOrElseReject()).getTopic()).toEqual('some-topic');
  }

  /**
   * Tests receiving multiple message simultaneously if specifying wildcard topic segments.
   */
  export async function subscribeToMultipleTopicsSimultaneouslySpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_1},
      receiver_1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_1},
      receiver_2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver_3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const receiver1PO = await pagePOs.get<ReceiveMessagePagePO>('receiver_1');
    await receiver1PO.selectMessagingModel(MessagingModel.Topic);
    await receiver1PO.enterTopic('myhome/livingroom/temperature');
    await receiver1PO.clickSubscribe();

    const receiver2PO = await pagePOs.get<ReceiveMessagePagePO>('receiver_2');
    await receiver2PO.selectMessagingModel(MessagingModel.Topic);
    await receiver2PO.enterTopic('myhome/:room/temperature');
    await receiver2PO.clickSubscribe();

    const receiver3PO = await pagePOs.get<ReceiveMessagePagePO>('receiver_3');
    await receiver3PO.selectMessagingModel(MessagingModel.Topic);
    await receiver3PO.enterTopic('myhome/:room/:measurement');
    await receiver3PO.clickSubscribe();

    const receiver4PO = await pagePOs.get<ReceiveMessagePagePO>('receiver_4');
    await receiver4PO.selectMessagingModel(MessagingModel.Topic);
    await receiver4PO.enterTopic('myhome/kitchen/:measurement');
    await receiver4PO.clickSubscribe();

    // Publish a message to 'myhome/livingroom/temperature'
    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('myhome/livingroom/temperature');
    await publisherPO.enterMessage('25°C');
    await publisherPO.clickPublish();

    // Verify receiver 1 subscribed to 'myhome/livingroom/temperature'
    await expectMessage(receiver1PO.getFirstMessageOrElseReject()).toEqual({
      topic: 'myhome/livingroom/temperature',
      body: '25°C',
      params: new Map(),
      headers: new Map(),
    });
    // Verify receiver 2 subscribed to 'myhome/:room/temperature'
    await expectMessage(receiver2PO.getFirstMessageOrElseReject()).toEqual({
      topic: 'myhome/livingroom/temperature',
      body: '25°C',
      params: new Map().set('room', 'livingroom'),
      headers: new Map(),
    });
    // Verify receiver 3 subscribed to 'myhome/:room/:measurement'
    await expectMessage(receiver3PO.getFirstMessageOrElseReject()).toEqual({
      topic: 'myhome/livingroom/temperature',
      body: '25°C',
      params: new Map().set('room', 'livingroom').set('measurement', 'temperature'),
      headers: new Map(),
    });
    // Verify receiver 4 subscribed to 'myhome/kitchen/:measurement'
    await expect(receiver4PO.getMessages()).toEqual([]);

    await receiver1PO.clickClearMessages();
    await receiver2PO.clickClearMessages();
    await receiver3PO.clickClearMessages();
    await receiver4PO.clickClearMessages();

    // Publish a message to 'myhome/kitchen/temperature'
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('myhome/kitchen/temperature');
    await publisherPO.enterMessage('20°C');
    await publisherPO.clickPublish();

    // Verify receiver 1 subscribed to 'myhome/livingroom/temperature'
    await expect(receiver1PO.getMessages()).toEqual([]);
    // Verify receiver 2 subscribed to 'myhome/:room/temperature'
    await expectMessage(receiver2PO.getFirstMessageOrElseReject()).toEqual({
      topic: 'myhome/kitchen/temperature',
      body: '20°C',
      params: new Map().set('room', 'kitchen'),
      headers: new Map(),
    });
    // Verify receiver 3 subscribed to 'myhome/:room/:measurement'
    await expectMessage(receiver3PO.getFirstMessageOrElseReject()).toEqual({
      topic: 'myhome/kitchen/temperature',
      body: '20°C',
      params: new Map().set('room', 'kitchen').set('measurement', 'temperature'),
      headers: new Map(),
    });
    // Verify receiver 4 subscribed to 'myhome/kitchen/:measurement'
    await expectMessage(receiver4PO.getFirstMessageOrElseReject()).toEqual({
      topic: 'myhome/kitchen/temperature',
      body: '20°C',
      params: new Map().set('measurement', 'temperature'),
      headers: new Map(),
    });
  }

  /**
   * Tests to set headers on a message.
   */
  export async function passHeadersSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: PublishMessagePagePO,
      receiver: ReceiveMessagePagePO,
    });

    const receiverPO = await pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('some-topic');
    await receiverPO.clickSubscribe();

    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('some-topic');
    await publisherPO.enterMessage('some-payload');
    await publisherPO.enterHeaders(new Map().set('header1', 'value').set('header2', '42'));
    await publisherPO.clickPublish();

    await expectMessage(receiverPO.getFirstMessageOrElseReject()).toEqual({
      topic: 'some-topic',
      body: 'some-payload',
      headers: new Map().set('header1', 'value').set('header2', '42'),
      params: new Map(),
    });
  }

  /**
   * Tests message interception by changing the message body to upper case characters.
   * The testing app is configured to uppercase messages sent to the topic 'uppercase'.
   */
  export async function interceptMessageSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: PublishMessagePagePO,
      receiver: ReceiveMessagePagePO,
    }, {queryParams: new Map().set('intercept-message:uppercase', 'uppercase')});

    const receiverPO = await pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('uppercase');
    await receiverPO.clickSubscribe();

    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('uppercase');
    await publisherPO.enterMessage('payload');
    await publisherPO.clickPublish();

    await expectMessage(receiverPO.getFirstMessageOrElseReject()).toEqual({
      topic: 'uppercase',
      body: 'PAYLOAD',
      headers: new Map(),
      params: new Map(),
    });
  }

  /**
   * Tests message rejection.
   * The testing app is configured to reject messages sent to the topic 'reject'.
   */
  export async function rejectMessageSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: PublishMessagePagePO,
      receiver: ReceiveMessagePagePO,
    }, {queryParams: new Map().set('intercept-message:reject', 'reject')});

    const receiverPO = await pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('reject');
    await receiverPO.clickSubscribe();

    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('reject');
    await publisherPO.enterMessage('payload');
    await publisherPO.clickPublish();

    await expect(publisherPO.getPublishError()).toEqual('Message rejected by interceptor');
    await expect(receiverPO.getMessages()).toEqual([]);
  }

  /**
   * Tests swallowing a message.
   * The testing app is configured to swallow messages sent to the topic 'swallow'.
   */
  export async function swallowMessageSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      publisher: PublishMessagePagePO,
      receiver: ReceiveMessagePagePO,
    }, {queryParams: new Map().set('intercept-message:swallow', 'swallow')});

    const receiverPO = await pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Topic);
    await receiverPO.enterTopic('swallow');
    await receiverPO.clickSubscribe();

    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Topic);
    await publisherPO.enterTopic('swallow');
    await publisherPO.enterMessage('payload');
    await publisherPO.clickPublish();

    await expect(publisherPO.getPublishError()).toBeNull();
    await expect(receiverPO.getMessages()).toEqual([]);
  }

  /**
   * Expects the message to equal the expected message with its headers to contain at minimum the given map entries.
   */
  function expectMessage(actual: Promise<MessageListItemPO>): { toEqual: (expected: TopicMessage) => void } {
    return {
      toEqual: async (expected: TopicMessage): Promise<void> => {
        const actualMessage = await actual;
        await expect(actualMessage.getTopic()).toEqual(expected.topic);
        await expect(actualMessage.getBody()).toEqual(expected.body);
        await expect(actualMessage.getParams()).toEqual(expected.params);
        // Jasmine 3.5 provides 'mapContaining' matcher; when updated, this custom matcher can be removed.
        await expect([...await actualMessage.getHeaders()]).toEqual(jasmine.arrayContaining([...expected.headers]));
      },
    };
  }
}
