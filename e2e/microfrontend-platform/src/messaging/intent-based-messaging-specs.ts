/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestingAppOrigins, TestingAppPO } from '../testing-app.po';
import { MessagingModel, PublishMessagePagePO } from './publish-message-page.po';
import { ReceiveMessagePagePO } from './receive-message-page.po';
import { ManageIntentsPagePO } from '../manifest/manage-intents-page.po';
import { ManageCapabilitiesPagePO } from '../manifest/manage-capabilities-page.po';
import { OutletPO } from '../outlet.po';
import { expectToBeRejectedWithError } from '../spec.util';
import { MessageListItemPO } from './message-list-item.po';
import { IntentMessage } from '@scion/microfrontend-platform';

/**
 * Contains Specs for intent-based messaging.
 */
export namespace IntendBasedMessagingSpecs {

  /**
   * Tests that an intent can only be issued if having declared a respective intent.
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
      intentManager: ManageIntentsPagePO,
    });

    // register the intent
    const intentManagerPO = pagePOs.get<ManageIntentsPagePO>('intentManager');
    await intentManagerPO.registerIntent('testing', {key: 'value'});

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
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4202: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key: 'value'});

    // register the capability
    const capabilityManager_4202 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await capabilityManager_4202.registerCapability('testing', {key: 'value'}, {scope: 'private'});

    // receive the intent
    const receiverPO_4202 = pagePOs.get<ReceiveMessagePagePO>('receiver_4202');
    await receiverPO_4202.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4202.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4202.clickSubscribe();

    // issue the intent
    const publisherPO_4202 = pagePOs.get<PublishMessagePagePO>('publisher_4202');
    await publisherPO_4202.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4202.enterIntent('testing', {key: 'value'});
    await publisherPO_4202.enterMessage('some payload');
    await publisherPO_4202.clickPublish();

    await expect(publisherPO_4202.getPublishError()).toBeNull();

    // assert intent to be received
    const intent = await receiverPO_4202.getFirstMessageOrElseReject();
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
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4203: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key: 'value'});

    // register the capability
    const capabilityManagerPO_4203 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4203});
    await capabilityManagerPO_4203.registerCapability('testing', {key: 'value'}, {scope: 'private'});

    // receive the intent
    const receiverPO_4203 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203');
    await receiverPO_4203.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4203.clickSubscribe();

    // issue the intent
    const publisherPO_4202 = pagePOs.get<PublishMessagePagePO>('publisher_4202');
    await publisherPO_4202.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4202.enterIntent('testing', {key: 'value'});
    await publisherPO_4202.enterMessage('some payload');
    await publisherPO_4202.clickPublish();

    // assert intent not to be dispatched
    await expect(publisherPO_4202.getPublishError()).toContain('[NullProviderError]');

    // assert intent not to be received
    await expect(receiverPO_4203.getMessages()).toEqual([]);
  }

  /**
   * Tests that an application can issue intents to its public capabilities.
   */
  export async function dispatchToOwnPublicCapabilitiesSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4202: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key: 'value'});

    // register the capability
    const capabilityManagerPO_4202 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await capabilityManagerPO_4202.registerCapability('testing', {key: 'value'}, {scope: 'public'});

    // receive the intent
    const receiverPO = pagePOs.get<ReceiveMessagePagePO>('receiver_4202');
    await receiverPO.selectMessagingModel(MessagingModel.Intent);
    await receiverPO.enterIntentSelector('testing', {key: 'value'});
    await receiverPO.clickSubscribe();

    // issue the intent
    const publisherPO = pagePOs.get<PublishMessagePagePO>('publisher_4202');
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
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4203: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key: 'value'});

    // register the capability
    const capabilityManagerPO_4203 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4203});
    await capabilityManagerPO_4203.registerCapability('testing', {key: 'value'}, {scope: 'public'});

    // receive the intent
    const receiverPO_4203 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203');
    await receiverPO_4203.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4203.clickSubscribe();

    // issue the intent
    const publisherPO_4202 = pagePOs.get<PublishMessagePagePO>('publisher_4202');
    await publisherPO_4202.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4202.enterIntent('testing', {key: 'value'});
    await publisherPO_4202.enterMessage('some payload');
    await publisherPO_4202.clickPublish();

    await expect(publisherPO_4202.getPublishError()).toBeNull();

    // assert intent to be received
    const intent = await receiverPO_4203.getFirstMessageOrElseReject();
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
      publisher_4201: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4201},
      receiver_4201: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4201},
      receiver_4202_1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4202_2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4201 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4201});
    await intentManagerPO_4201.registerIntent('testing', {key: 'value'});

    // register the capability in app 4201
    const capabilityManagerPO_4201 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4201});
    await capabilityManagerPO_4201.registerCapability('testing', {key: 'value'}, {scope: 'public'});

    // register the capability in app 4202
    const capabilityManagerPO_4202 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await capabilityManagerPO_4202.registerCapability('testing', {key: 'value'}, {scope: 'public'});

    // receive the intent in app 4201
    const receiverPO_4201 = pagePOs.get<ReceiveMessagePagePO>('receiver_4201');
    await receiverPO_4201.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4201.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4201.clickSubscribe();

    // receive the intent in app 4202_1
    const receiverPO_4202_1 = pagePOs.get<ReceiveMessagePagePO>('receiver_4202_1');
    await receiverPO_4202_1.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4202_1.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4202_1.clickSubscribe();

    // receive the intent in app 4202_2
    const receiverPO_4202_2 = pagePOs.get<ReceiveMessagePagePO>('receiver_4202_2');
    await receiverPO_4202_2.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4202_2.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4202_2.clickSubscribe();

    // issue the intent from app 4201
    const publisherPO_4201 = pagePOs.get<PublishMessagePagePO>('publisher_4201');
    await publisherPO_4201.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4201.enterIntent('testing', {key: 'value'});
    await publisherPO_4201.enterMessage('some payload');
    await publisherPO_4201.clickPublish();

    await expect(publisherPO_4201.getPublishError()).toBeNull();

    // assert intent to be received by app 4201
    const intent_4201 = await receiverPO_4201.getFirstMessageOrElseReject();
    await expect(intent_4201.getIntentType()).toEqual('testing');
    await expect(intent_4201.getBody()).toEqual('some payload');
    await expect(intent_4201.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent_4201.getReplyTo()).toBeUndefined();

    // assert intent to be received by app 4202_1
    const intent_4202_1 = await receiverPO_4202_1.getFirstMessageOrElseReject();
    await expect(intent_4202_1.getIntentType()).toEqual('testing');
    await expect(intent_4202_1.getBody()).toEqual('some payload');
    await expect(intent_4202_1.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent_4202_1.getReplyTo()).toBeUndefined();

    // assert intent to be received by app 4202_2
    const intent_4202_2 = await receiverPO_4202_2.getFirstMessageOrElseReject();
    await expect(intent_4202_2.getIntentType()).toEqual('testing');
    await expect(intent_4202_2.getBody()).toEqual('some payload');
    await expect(intent_4202_2.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent_4202_2.getReplyTo()).toBeUndefined();
  }

  /**
   * Tests that an application can receive intents from multiple applications.
   */
  export async function receiveMultipleIntentsSpecs(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4203: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key: 'value'});

    // register the capability
    const capabilityManagerPO_4203 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4203});
    await capabilityManagerPO_4203.registerCapability('testing', {key: 'value'}, {scope: 'public'});

    // receive the intent
    const receiverPO_4203 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203');
    await receiverPO_4203.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4203.clickSubscribe();

    // issue the intent
    const publisherPO_4202 = pagePOs.get<PublishMessagePagePO>('publisher_4202');
    await publisherPO_4202.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4202.enterIntent('testing', {key: 'value'});

    // assert receiving the first intent
    await publisherPO_4202.clickPublish();
    const intent1 = await receiverPO_4203.getFirstMessageOrElseReject();
    await expect(intent1.getIntentType()).toEqual('testing');
    await expect(intent1.getIntentQualifier()).toEqual({key: 'value'});
    await receiverPO_4203.clickClearMessages();
    await expect(receiverPO_4203.getMessages()).toEqual([]);

    // assert receiving the second intent
    await publisherPO_4202.clickPublish();
    const intent2 = await receiverPO_4203.getFirstMessageOrElseReject();
    await expect(intent2.getIntentType()).toEqual('testing');
    await expect(intent2.getIntentQualifier()).toEqual({key: 'value'});
    await receiverPO_4203.clickClearMessages();
    await expect(receiverPO_4203.getMessages()).toEqual([]);

    // assert receiving the second intent
    await publisherPO_4202.clickPublish();
    const intent3 = await receiverPO_4203.getFirstMessageOrElseReject();
    await expect(intent3.getIntentType()).toEqual('testing');
    await expect(intent3.getIntentQualifier()).toEqual({key: 'value'});
    await receiverPO_4203.clickClearMessages();
    await expect(receiverPO_4203.getMessages()).toEqual([]);
  }

  /**
   * Tests that an application can reply to an intent.
   */
  export async function replySpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4203: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key: 'value'});

    // register the capability
    const capabilityManagerPO_4203 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4203});
    await capabilityManagerPO_4203.registerCapability('testing', {key: 'value'}, {scope: 'public'});

    // receive the intent
    const receiverPO_4203 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203');
    await receiverPO_4203.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203.enterIntentSelector('testing', {key: 'value'});
    await receiverPO_4203.clickSubscribe();

    // issue the intent
    const publisherPO_4202 = pagePOs.get<PublishMessagePagePO>('publisher_4202');
    await publisherPO_4202.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4202.toggleRequestReply(true);
    await publisherPO_4202.enterIntent('testing', {key: 'value'});
    await publisherPO_4202.clickPublish();

    // assert receiving the intent
    const intent = await receiverPO_4203.getFirstMessageOrElseReject();
    await expect(intent.getIntentType()).toEqual('testing');
    await expect(intent.getIntentQualifier()).toEqual({key: 'value'});
    await expect(intent.getReplyTo()).not.toBeUndefined();

    // send the first reply
    await intent.clickReply();
    const reply1 = await publisherPO_4202.getFirstReplyOrElseReject();
    await expect(reply1.getReplyTo()).toBeUndefined();
    await expect(reply1.getBody()).toEqual('this is a reply');
    await publisherPO_4202.clickClearReplies();

    // send the second reply
    await intent.clickReply();
    const reply2 = await publisherPO_4202.getFirstReplyOrElseReject();
    await expect(reply2.getReplyTo()).toBeUndefined();
    await expect(reply2.getBody()).toEqual('this is a reply');
    await publisherPO_4202.clickClearReplies();
  }

  /**
   * Tests that intents of interest can be filtered.
   */
  export async function receiveAndFilterSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_4202: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4203_1: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
      receiver_4203_2: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
      receiver_4203_3: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
      receiver_4203_4: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4202 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await intentManagerPO_4202.registerIntent('testing', {key1: 'value1', key2: '*'});

    // register the capability
    const capabilityManagerPO_4203 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4203});
    await capabilityManagerPO_4203.registerCapability('testing', {key1: 'value1', key2: 'value2'}, {scope: 'public'});

    // receive the intent using qualifier: {key1: 'value1', key2: '*'}
    const receiverPO_4203_1 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203_1');
    await receiverPO_4203_1.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203_1.enterIntentSelector('testing', {key1: 'value1', key2: '*'});
    await receiverPO_4203_1.clickSubscribe();

    // receive the intent using qualifier: {key1: 'value1', key2: '*', key3: '?'}
    const receiverPO_4203_2 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203_2');
    await receiverPO_4203_2.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203_2.enterIntentSelector('testing', {key1: 'value1', key2: '*', key3: '?'});
    await receiverPO_4203_2.clickSubscribe();

    // receive the intent using qualifier: {'*': '*'}
    const receiverPO_4203_3 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203_3');
    await receiverPO_4203_3.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203_3.enterIntentSelector('testing', {'*': '*'});
    await receiverPO_4203_3.clickSubscribe();

    // receive the intent using qualifier: undefined
    const receiverPO_4203_4 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203_4');
    await receiverPO_4203_4.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203_4.enterIntentSelector('testing');
    await receiverPO_4203_4.clickSubscribe();

    // issue the intent
    const publisherPO_4202 = pagePOs.get<PublishMessagePagePO>('publisher_4202');
    await publisherPO_4202.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4202.enterIntent('testing', {key1: 'value1', key2: 'value2'});
    await publisherPO_4202.clickPublish();

    // assert receiving the intent
    await receiverPO_4203_1.getFirstMessageOrElseReject();
    await receiverPO_4203_2.getFirstMessageOrElseReject();
    await receiverPO_4203_3.getFirstMessageOrElseReject();
    await receiverPO_4203_4.getFirstMessageOrElseReject();
  }

  /**
   * Tests that intent routing for capabilities declaring wildcard characters works as expected.
   */
  export async function receiveIfMatchingCapabilityWildcardQualifierSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();

    const pagePOs = await testingAppPO.navigateTo({
      managerOutlet: 'about:blank',
      publisher_4200: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4200},
      receiver_4202: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      receiver_4203: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4203},
    });

    const managerOutlet = await pagePOs.get<OutletPO>('managerOutlet');

    // register the intent
    const intentManagerPO_4200 = await managerOutlet.enterUrl<ManageIntentsPagePO>({useClass: ManageIntentsPagePO, origin: TestingAppOrigins.LOCALHOST_4200});
    await intentManagerPO_4200.registerIntent('testing', {'*': '*'});

    // register the capability
    // app 4202: {key1: 'value1', key2: '*'}
    // app 4203: {key1: 'value1', key2: '?'}
    const capabilityManagerPO_4202 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4202});
    await capabilityManagerPO_4202.registerCapability('testing', {key1: 'value1', key2: '*'}, {scope: 'public'});

    const capabilityManagerPO_4203 = await managerOutlet.enterUrl<ManageCapabilitiesPagePO>({useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4203});
    await capabilityManagerPO_4203.registerCapability('testing', {key1: 'value1', key2: '?'}, {scope: 'public'});

    // receive the intent in 4202
    const receiverPO_4202 = pagePOs.get<ReceiveMessagePagePO>('receiver_4202');
    await receiverPO_4202.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4202.clickSubscribe();

    // receive the intent in 4203
    const receiverPO_4203 = pagePOs.get<ReceiveMessagePagePO>('receiver_4203');
    await receiverPO_4203.selectMessagingModel(MessagingModel.Intent);
    await receiverPO_4203.clickSubscribe();

    // issue the intent: {key1: 'value1', key2: 'value2'}
    const publisherPO_4200 = pagePOs.get<PublishMessagePagePO>('publisher_4200');
    await publisherPO_4200.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4200.enterIntent('testing', {key1: 'value1', key2: 'value2'});
    await publisherPO_4200.clickPublish();

    // assert receiving the intent
    await expect((await receiverPO_4202.getFirstMessageOrElseReject()).getIntentQualifier()).toEqual({key1: 'value1', key2: 'value2'});
    await expect((await receiverPO_4203.getFirstMessageOrElseReject()).getIntentQualifier()).toEqual({key1: 'value1', key2: 'value2'});

    await receiverPO_4202.clickClearMessages();
    await receiverPO_4203.clickClearMessages();

    // issue the intent: {key1: 'value1'}
    await publisherPO_4200.selectMessagingModel(MessagingModel.Intent);
    await publisherPO_4200.enterIntent('testing', {key1: 'value1'});
    await publisherPO_4200.clickPublish();

    // assert receiving the intent
    await expectToBeRejectedWithError(receiverPO_4202.getFirstMessageOrElseReject(), /[TimeoutError]/);
    await expect((await receiverPO_4203.getFirstMessageOrElseReject()).getIntentQualifier()).toEqual({key1: 'value1'});
    await receiverPO_4202.clickClearMessages();
    await receiverPO_4203.clickClearMessages();
  }

  /**
   * Tests to set headers on a message.
   */
  export async function passHeadersSpec(): Promise<void> {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      capabilityManager: {useClass: ManageCapabilitiesPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
      publisher: {useClass: PublishMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4200},
      receiver: {useClass: ReceiveMessagePagePO, origin: TestingAppOrigins.LOCALHOST_4200},
    });

    const capabilityManagerPO = await pagePOs.get<ManageCapabilitiesPagePO>('capabilityManager');
    await capabilityManagerPO.registerCapability('testing', {q1: 'v1', q2: 'v2'});

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
