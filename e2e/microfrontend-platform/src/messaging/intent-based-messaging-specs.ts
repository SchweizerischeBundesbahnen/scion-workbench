/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { TestingAppOrigins, TestingAppPO } from '../testing-app.po';
import { MessagingModel, PublishMessagePagePO } from './publish-message-page.po';
import { ReceiveMessagePagePO } from './receive-message-page.po';
import { RegisterIntentionsPagePO } from '../manifest/register-intentions-page.po';
import { RegisterCapabilityProvidersPagePO } from '../manifest/register-capability-providers-page.po';
import { BrowserOutletPO } from '../browser-outlet/browser-outlet.po';
import { expectToBeRejectedWithError } from '../spec.util';
import { MessageListItemPO } from './message-list-item.po';
import { IntentMessage } from '@scion/microfrontend-platform';

/**
 * Contains Specs for intent-based messaging.
 */
export namespace IntendBasedMessagingSpecs {

  /**
   * Tests that an intent can only be issued if having declared a respective intention.
   */
  export async function publisherNotQualifiedSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      publisher: PublishMessagePagePO,
    });

    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');

    await publisherPO.selectMessagingModel(MessagingModel.Intent);
    await publisherPO.enterIntent('testing', {key: 'value'});
    await publisherPO.clickPublish();

    await expect(publisherPO.getPublishError()).toContain('[NotQualifiedError]');
  }

  /**
   * Tests that an intent can only be issued if there is one application at mininmum providing a respective capability.
   */
  export async function intentNotFulfilledSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      publisher: PublishMessagePagePO,
      intentionManager: RegisterIntentionsPagePO,
    });

    // register the intention
    const intentionManagerPO = pagePOs.get<RegisterIntentionsPagePO>('intentionManager');
    await intentionManagerPO.registerIntention({type: 'testing', qualifier: {key: 'value'}});

    // issue the intent
    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Intent);
    await publisherPO.enterIntent('testing', {key: 'value'});
    await publisherPO.clickPublish();

    await expect(publisherPO.getPublishError()).toContain('[NullProviderError]');
  }

  /**
   * Tests that an application can issue intents to its private capabilities.
   */
  export async function dispatchToOwnPrivateCapabilitiesSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // do not register intention, an application can always issue intents to its private capabilities

    // register the capability
    const capabilityManager_app3 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3});
    await capabilityManager_app3.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: true});

    // receive the intent
    const receiverPO_app3 = pagePOs.get<ReceiveMessagePagePO>('receiver_app3');
    await receiverPO_app3.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app3.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app3.clickSubscribe();

    // issue the intent
    const publisherPO_app3 = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO_app3.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app3.enterIntent('testing', {key: 'value'});
    await publisherPO_app3.enterMessage('some payload');
    await publisherPO_app3.clickPublish();

    await expect(publisherPO_app3.getPublishError()).toBeNull();

    // assert intent to be received
    const intent = await receiverPO_app3.getFirstMessageOrElseReject();
    await expect(intent.getIntentType()).toEqual('testing');
    await expect(intent.getBody()).toEqual('some payload');
    await expect(intent.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that an application cannot issue intents to private capabilities of other applications.
   */
  export async function rejectDispatchingToPrivateForeignCapabilitiesSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app3 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3});
    await intentionManagerPO_app3.registerIntention({type: 'testing', qualifier: {key: 'value'}});

    // register the capability
    const capabilityManagerPO_app4 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_4});
    await capabilityManagerPO_app4.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: true});

    // receive the intent
    const receiverPO_app4 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4');
    await receiverPO_app4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app4.clickSubscribe();

    // issue the intent
    const publisherPO_app3 = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO_app3.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app3.enterIntent('testing', {key: 'value'});
    await publisherPO_app3.enterMessage('some payload');
    await publisherPO_app3.clickPublish();

    // assert intent not to be dispatched
    await expect(publisherPO_app3.getPublishError()).toContain('[NullProviderError]');

    // assert intent not to be received
    await expect(receiverPO_app4.getMessages()).toEqual([]);
  }

  /**
   * Tests that an application can issue intents to its public capabilities.
   */
  export async function dispatchToOwnPublicCapabilitiesSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // do not register intention, an application can always issue intents to its public capabilities

    // register the capability
    const capabilityManagerPO_app3 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3});
    await capabilityManagerPO_app3.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: false});

    // receive the intent
    const receiverPO = pagePOs.get<ReceiveMessagePagePO>('receiver_app3');
    await receiverPO.selectMessagingModel(MessagingModel.Intent);
    await receiverPO.enterIntentSelector('testing', {key: 'value'});
    await receiverPO.clickSubscribe();

    // issue the intent
    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO.selectMessagingModel(MessagingModel.Intent);
    await publisherPO.enterIntent('testing', {key: 'value'});
    await publisherPO.enterMessage('some payload');
    await publisherPO.clickPublish();

    await expect(publisherPO.getPublishError()).toBeNull();

    // assert intent to be received
    const intent = await receiverPO.getFirstMessageOrElseReject();
    await expect(intent.getIntentType()).toEqual('testing');
    await expect(intent.getBody()).toEqual('some payload');
    await expect(intent.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that an application can issue intents to public capabilities of other applications.
   */
  export async function dispatchToPublicForeignCapabilitiesSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app3 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3});
    await intentionManagerPO_app3.registerIntention({type: 'testing', qualifier: {key: 'value'}});

    // register the capability
    const capabilityManagerPO_app4 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_4});
    await capabilityManagerPO_app4.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: false});

    // receive the intent
    const receiverPO_app4 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4');
    await receiverPO_app4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app4.clickSubscribe();

    // issue the intent
    const publisherPO_app3 = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO_app3.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app3.enterIntent('testing', {key: 'value'});
    await publisherPO_app3.enterMessage('some payload');
    await publisherPO_app3.clickPublish();

    await expect(publisherPO_app3.getPublishError()).toBeNull();

    // assert intent to be received
    const intent = await receiverPO_app4.getFirstMessageOrElseReject();
    await expect(intent.getIntentType()).toEqual('testing');
    await expect(intent.getBody()).toEqual('some payload');
    await expect(intent.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that an intent is dispatched to multiple applications.
   */
  export async function dispatchToMultipleSubscribersSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app2: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver_app2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_2},
      receiver_app3_1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app3_2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app2 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_2});
    await intentionManagerPO_app2.registerIntention({type: 'testing', qualifier: {key: 'value'}});

    // register the capability in app-2
    const capabilityManagerPO_app2 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_2});
    await capabilityManagerPO_app2.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: false});

    // register the capability in app-3
    const capabilityManagerPO_app3 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3});
    await capabilityManagerPO_app3.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: false});

    // receive the intent in app-2
    const receiverPO_app2 = pagePOs.get<ReceiveMessagePagePO>('receiver_app2');
    await receiverPO_app2.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app2.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app2.clickSubscribe();

    // receive the intent in app-3_1
    const receiverPO_app3_1 = pagePOs.get<ReceiveMessagePagePO>('receiver_app3_1');
    await receiverPO_app3_1.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app3_1.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app3_1.clickSubscribe();

    // receive the intent in app-3_2
    const receiverPO_app3_2 = pagePOs.get<ReceiveMessagePagePO>('receiver_app3_2');
    await receiverPO_app3_2.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app3_2.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app3_2.clickSubscribe();

    // issue the intent from app-2
    const publisherPO_app2 = pagePOs.get<PublishMessagePagePO>('publisher_app2');
    await publisherPO_app2.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app2.enterIntent('testing', {key: 'value'});
    await publisherPO_app2.enterMessage('some payload');
    await publisherPO_app2.clickPublish();

    await expect(publisherPO_app2.getPublishError()).toBeNull();

    // assert intent to be received by app-2
    const intent_app2 = await receiverPO_app2.getFirstMessageOrElseReject();
    await expect(intent_app2.getIntentType()).toEqual('testing');
    await expect(intent_app2.getBody()).toEqual('some payload');
    await expect(intent_app2.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent_app2.getReplyTo()).toBeUndefined();

    // assert intent to be received by app-3_1
    const intent_app3_1 = await receiverPO_app3_1.getFirstMessageOrElseReject();
    await expect(intent_app3_1.getIntentType()).toEqual('testing');
    await expect(intent_app3_1.getBody()).toEqual('some payload');
    await expect(intent_app3_1.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent_app3_1.getReplyTo()).toBeUndefined();

    // assert intent to be received by app-3_2
    const intent_app3_2 = await receiverPO_app3_2.getFirstMessageOrElseReject();
    await expect(intent_app3_2.getIntentType()).toEqual('testing');
    await expect(intent_app3_2.getBody()).toEqual('some payload');
    await expect(intent_app3_2.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent_app3_2.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that an application can receive intents from multiple applications.
   */
  export async function receiveMultipleIntentsSpecs(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app3 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3});
    await intentionManagerPO_app3.registerIntention({type: 'testing', qualifier: {key: 'value'}});

    // register the capability
    const capabilityManagerPO_app4 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_4});
    await capabilityManagerPO_app4.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: false});

    // receive the intent
    const receiverPO_app4 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4');
    await receiverPO_app4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app4.clickSubscribe();

    // issue the intent
    const publisherPO_app3 = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO_app3.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app3.enterIntent('testing', {key: 'value'});

    // assert receiving the first intent
    await publisherPO_app3.clickPublish();
    const intent1 = await receiverPO_app4.getFirstMessageOrElseReject();
    await expect(intent1.getIntentType()).toEqual('testing');
    await expect(intent1.getIntentQualifier()).toEqual({key: 'value'});
    await receiverPO_app4.clickClearMessages();
    await expect(receiverPO_app4.getMessages()).toEqual([]);

    // assert receiving the second intent
    await publisherPO_app3.clickPublish();
    const intent2 = await receiverPO_app4.getFirstMessageOrElseReject();
    await expect(intent2.getIntentType()).toEqual('testing');
    await expect(intent2.getIntentQualifier()).toEqual({key: 'value'});
    await receiverPO_app4.clickClearMessages();
    await expect(receiverPO_app4.getMessages()).toEqual([]);

    // assert receiving the second intent
    await publisherPO_app3.clickPublish();
    const intent3 = await receiverPO_app4.getFirstMessageOrElseReject();
    await expect(intent3.getIntentType()).toEqual('testing');
    await expect(intent3.getIntentQualifier()).toEqual({key: 'value'});
    await receiverPO_app4.clickClearMessages();
    await expect(receiverPO_app4.getMessages()).toEqual([]);
  }

  /**
   * Tests that an application can reply to an intent.
   */
  export async function replySpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app3 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3});
    await intentionManagerPO_app3.registerIntention({type: 'testing', qualifier: {key: 'value'}});

    // register the capability
    const capabilityManagerPO_app4 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_4});
    await capabilityManagerPO_app4.registerProvider({type: 'testing', qualifier: {key: 'value'}, private: false});

    // receive the intent
    const receiverPO_app4 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4');
    await receiverPO_app4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_app4.clickSubscribe();

    // issue the intent
    const publisherPO_app3 = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO_app3.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app3.toggleRequestReply(true);
    await publisherPO_app3.enterIntent('testing', {key: 'value'});
    await publisherPO_app3.clickPublish();

    // assert receiving the intent
    const intent = await receiverPO_app4.getFirstMessageOrElseReject();
    await expect(intent.getIntentType()).toEqual('testing');
    await expect(intent.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent.getReplyTo()).not.toBeUndefined();

    // send the first reply
    await intent.clickReply();
    const reply1 = await publisherPO_app3.getFirstReplyOrElseReject();
    await expect(reply1.getReplyTo()).toBeUndefined();
    await expect(reply1.getBody()).toEqual('this is a reply');
    await publisherPO_app3.clickClearReplies();

    // send the second reply
    await intent.clickReply();
    const reply2 = await publisherPO_app3.getFirstReplyOrElseReject();
    await expect(reply2.getReplyTo()).toBeUndefined();
    await expect(reply2.getBody()).toEqual('this is a reply');
    await publisherPO_app3.clickClearReplies();
  }

  /**
   * Tests that intents of interest can be filtered.
   */
  export async function receiveAndFilterSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app3: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app4_1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
      receiver_app4_2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
      receiver_app4_3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
      receiver_app4_4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app3 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3});
    await intentionManagerPO_app3.registerIntention({type: 'testing', qualifier: {key1: 'value1', key2: '*'}});

    // register the capability
    const capabilityManagerPO_app4 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_4});
    await capabilityManagerPO_app4.registerProvider({type: 'testing', qualifier: {key1: 'value1', key2: 'value2'}, private: false});

    // receive the intent using qualifier: {key1: 'value1', key2: '*'}
    const receiverPO_app4_1 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4_1');
    await receiverPO_app4_1.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4_1.enterIntentSelector('testing', {key1: 'value1', key2: '*'});
    await receiverPO_app4_1.clickSubscribe();

    // receive the intent using qualifier: {key1: 'value1', key2: '*', key3: '?'}
    const receiverPO_app4_2 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4_2');
    await receiverPO_app4_2.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4_2.enterIntentSelector('testing', {key1: 'value1', key2: '*', key3: '?'});
    await receiverPO_app4_2.clickSubscribe();

    // receive the intent using qualifier: {'*': '*'}
    const receiverPO_app4_3 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4_3');
    await receiverPO_app4_3.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4_3.enterIntentSelector('testing', {'*': '*'});
    await receiverPO_app4_3.clickSubscribe();

    // receive the intent using qualifier: undefined
    const receiverPO_app4_4 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4_4');
    await receiverPO_app4_4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4_4.enterIntentSelector('testing');
    await receiverPO_app4_4.clickSubscribe();

    // issue the intent
    const publisherPO_app3 = pagePOs.get<PublishMessagePagePO>('publisher_app3');
    await publisherPO_app3.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app3.enterIntent('testing', {key1: 'value1', key2: 'value2'});
    await publisherPO_app3.clickPublish();

    // assert receiving the intent
    await receiverPO_app4_1.getFirstMessageOrElseReject();
    await receiverPO_app4_2.getFirstMessageOrElseReject();
    await receiverPO_app4_3.getFirstMessageOrElseReject();
    await receiverPO_app4_4.getFirstMessageOrElseReject();
  }

  /**
   * Tests that intent routing for capabilities declaring wildcard characters works as expected.
   */
  export async function receiveIfMatchingCapabilityWildcardQualifierSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_app1: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_1},
      receiver_app3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_3},
      receiver_app4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_4},
    });

    const managerOutlet = await pagePOs.get<BrowserOutletPO>('managerOutlet');

    // register the intention
    const intentionManagerPO_app1 = await managerOutlet.enterUrl<RegisterIntentionsPagePO>({useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_1});
    await intentionManagerPO_app1.registerIntention({type: 'testing', qualifier: {'*': '*'}});

    // register the capability
    // app-3: {key1: 'value1', key2: '*'}
    // app-4: {key1: 'value1', key2: '?'}
    const capabilityManagerPO_app3 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3});
    await capabilityManagerPO_app3.registerProvider({type: 'testing', qualifier: {key1: 'value1', key2: '*'}, private: false});

    const capabilityManagerPO_app4 = await managerOutlet.enterUrl<RegisterCapabilityProvidersPagePO>({useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_4});
    await capabilityManagerPO_app4.registerProvider({type: 'testing', qualifier: {key1: 'value1', key2: '?'}, private: false});

    // receive the intent in app-3
    const receiverPO_app3 = pagePOs.get<ReceiveMessagePagePO>('receiver_app3');
    await receiverPO_app3.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app3.clickSubscribe();

    // receive the intent in app-4
    const receiverPO_app4 = pagePOs.get<ReceiveMessagePagePO>('receiver_app4');
    await receiverPO_app4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_app4.clickSubscribe();

    // issue the intent: {key1: 'value1', key2: 'value2'}
    const publisherPO_app1 = pagePOs.get<PublishMessagePagePO>('publisher_app1');
    await publisherPO_app1.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app1.enterIntent('testing', {key1: 'value1', key2: 'value2'});
    await publisherPO_app1.clickPublish();

    // assert receiving the intent
    await expect((await receiverPO_app3.getFirstMessageOrElseReject()).getIntentQualifier()).toEqual({key1: 'value1', key2: 'value2'});
    await expect((await receiverPO_app4.getFirstMessageOrElseReject()).getIntentQualifier()).toEqual({key1: 'value1', key2: 'value2'});

    await receiverPO_app3.clickClearMessages();
    await receiverPO_app4.clickClearMessages();

    // issue the intent: {key1: 'value1'}
    await publisherPO_app1.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_app1.enterIntent('testing', {key1: 'value1'});
    await publisherPO_app1.clickPublish();

    // assert receiving the intent
    await expectToBeRejectedWithError(receiverPO_app3.getFirstMessageOrElseReject(), /[TimeoutError]/);
    await expect((await receiverPO_app4.getFirstMessageOrElseReject()).getIntentQualifier()).toEqual({key1: 'value1'});
    await receiverPO_app3.clickClearMessages();
    await receiverPO_app4.clickClearMessages();
  }

  /**
   * Tests to set headers on a message.
   */
  export async function passHeadersSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      capabilityManager: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_1},
      publisher: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.APP_1},
      receiver: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.APP_1},
    });

    const capabilityManagerPO = await pagePOs.get<RegisterCapabilityProvidersPagePO>('capabilityManager');
    await capabilityManagerPO.registerProvider({type: 'testing', qualifier: {q1: 'v1', q2: 'v2'}, private: true});

    const receiverPO = await pagePOs.get<ReceiveMessagePagePO>('receiver');
    await receiverPO.selectMessagingModel(MessagingModel.Intent);
    await receiverPO.clickSubscribe();

    const publisherPO = await pagePOs.get<PublishMessagePagePO>('publisher');
    await publisherPO.selectMessagingModel(MessagingModel.Intent);
    await publisherPO.enterIntent('testing', {q1: 'v1', q2: 'v2'});
    await publisherPO.enterHeaders(new Map().set('header1', 'value').set('header2', '42'));
    await publisherPO.clickPublish();

    await expectIntent(receiverPO.getFirstMessageOrElseReject()).toEqual({
      type: 'testing',
      qualifier: {q1: 'v1', q2: 'v2'},
      body: '',
      headers: new Map().set('header1', 'value').set('header2', '42'),
    });
  }

  /**
   * Expects the intent to equal the expected intent with its headers to contain at minimum the given map entries.
   */
  function expectIntent(actual: Promise<MessageListItemPO>): { toEqual: (expected: IntentMessage) => void } {
    return {
      toEqual: async (expected: IntentMessage): Promise<void> => {
        const actualMessage = await actual;
        await expect(actualMessage.getIntentType()).toEqual(expected.type);
        await expect(actualMessage.getIntentQualifier()).toEqual(expected.qualifier);
        if (expected.body !== undefined) {
          await expect(actualMessage.getBody()).toEqual(expected.body);
        }
        // Jasmine 3.5 provides 'mapContaining' matcher; when updated, this custom matcher can be removed.
        await expect([...await actualMessage.getHeaders()]).toEqual(jasmine.arrayContaining([...expected.headers]));
      },
    };
  }
}
