import { TestingAppOrigins } from '../testing-app.po';
import { TopicBasedMessagingSpecs } from './topic-based-messaging-specs';
import { IntendBasedMessagingSpecs } from './intent-based-messaging-specs';
import { seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';

describe('Messaging', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  describe('topic-based', () => {

    describe(`[same-origin]`, (): void => {

      it('allows publishing and receiving a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.publishSpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_2);
      });

      it('allows publishing and receiving a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.publishSpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_2);
      });

      it('allows replying to a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.replySpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_2);
      });

      it('allows replying to a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.replySpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_2);
      });
    });

    describe(`[cross-origin]`, (): void => {

      it('allows publishing and receiving a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.publishSpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_3);
      });

      it('allows publishing and receiving a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.publishSpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_3);
      });

      it('allows replying to a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.replySpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_3);
      });

      it('allows replying to a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.replySpec(TestingAppOrigins.APP_2, TestingAppOrigins.APP_3);
      });
    });

    it('allows tracking the topic subscriber count', async () => {
      await TopicBasedMessagingSpecs.subscriberCountSpec();
    });

    it('allows replying from multiple subscribers', async () => {
      await TopicBasedMessagingSpecs.subscribersReplySpec();
    });

    it('allows publishing a message to multiple subscribers', async () => {
      await TopicBasedMessagingSpecs.subscribersReceiveSpec();
    });

    it('throws an error when no replier is found to reply a request', async () => {
      await TopicBasedMessagingSpecs.throwIfNoReplierFoundSpec();
    });

    it('allows receiving retained messages', async () => {
      await TopicBasedMessagingSpecs.receiveRetainedMessagesSpec();
    });

    it('allows receiving messages without a payload', async () => {
      await TopicBasedMessagingSpecs.receiveMessagesWithoutPayloadSpec();
    });

    it('allows subscribing to multiple topics simultaneously (using the colon syntax)', async () => {
      await TopicBasedMessagingSpecs.subscribeToMultipleTopicsSimultaneouslySpec();
    });

    it('allows passing headers', async () => {
      await TopicBasedMessagingSpecs.passHeadersSpec();
    });

    describe('message-interception', () => {

      it('allows intercepting messages', async () => {
        await TopicBasedMessagingSpecs.interceptMessageSpec();
      });

      it('allows rejecting messages', async () => {
        await TopicBasedMessagingSpecs.rejectMessageSpec();
      });

      it('allows swallowing messages', async () => {
        await TopicBasedMessagingSpecs.swallowMessageSpec();
      });
    });
  });

  describe('intent-based', () => {

    describe('scope-check', () => {

      it('rejects intent if not qualified', async () => {
        await IntendBasedMessagingSpecs.publisherNotQualifiedSpec();
      });

      it('rejects intent if not fulfilled', async () => {
        await IntendBasedMessagingSpecs.intentNotFulfilledSpec();
      });

      it('allows issuing intents to own private capabilities', async () => {
        await IntendBasedMessagingSpecs.dispatchToOwnPrivateCapabilitiesSpec();
      });

      it('allows issuing intents to own public capabilities', async () => {
        await IntendBasedMessagingSpecs.dispatchToOwnPublicCapabilitiesSpec();
      });

      it('rejects intents issued to private capabilities of other applications', async () => {
        await IntendBasedMessagingSpecs.rejectDispatchingToPrivateForeignCapabilitiesSpec();
      });

      it('allows issuing intents to public capabilities of other applications', async () => {
        await IntendBasedMessagingSpecs.dispatchToPublicForeignCapabilitiesSpec();
      });
    });

    it('allows issuing intents to multiple applications', async () => {
      await IntendBasedMessagingSpecs.dispatchToMultipleSubscribersSpec();
    });

    it('allows receiving multiple intents', async () => {
      await IntendBasedMessagingSpecs.receiveMultipleIntentsSpecs();
    });

    it('allows replying to an intent', async () => {
      await IntendBasedMessagingSpecs.replySpec();
    });

    it('allows subscribing to intents using a qualifier selector which contains wildcards', async () => {
      await IntendBasedMessagingSpecs.receiveAndFilterSpec();
    });

    it('allows receiving intents for a capability which declares wildcards in its qualifier', async () => {
      await IntendBasedMessagingSpecs.receiveIfMatchingCapabilityWildcardQualifierSpec();
    });

    it('allows passing headers', async () => {
      await IntendBasedMessagingSpecs.passHeadersSpec();
    });

    it('resolves to the satisfying capability', async () => {
      await IntendBasedMessagingSpecs.resolveCapabilitySpec();
    });

    describe('intent-interception', () => {

      it('allows intercepting intents', async () => {
        await IntendBasedMessagingSpecs.interceptIntentSpec();
      });

      it('allows rejecting intents', async () => {
        await IntendBasedMessagingSpecs.rejectIntentSpec();
      });

      it('allows swallowing intents', async () => {
        await IntendBasedMessagingSpecs.swallowIntentSpec();
      });
    });
  });
});

