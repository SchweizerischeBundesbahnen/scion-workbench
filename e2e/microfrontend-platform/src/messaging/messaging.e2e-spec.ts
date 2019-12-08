import { TestingAppOrigins } from '../testing-app.po';
import { TopicBasedMessagingSpecs } from './topic-based-messaging-specs';
import { IntendBasedMessagingSpecs } from './intent-based-messaging-specs';

describe('Messaging', () => {

  describe('topic-based', () => {

    describe(`[same-origin]`, (): void => {

      it('allows publishing and receiving a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.publishSpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4201);
      });

      it('allows publishing and receiving a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.publishSpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4201);
      });

      it('allows replying to a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.replySpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4201);
      });

      it('allows replying to a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.replySpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4201);
      });
    });

    describe(`[cross-origin]`, (): void => {

      it('allows publishing and receiving a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.publishSpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4202);
      });

      it('allows publishing and receiving a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.publishSpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4202);
      });

      it('allows replying to a message in root outlets', async () => {
        await TopicBasedMessagingSpecs.RootOutlets.replySpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4202);
      });

      it('allows replying to a message in child outlets', async () => {
        await TopicBasedMessagingSpecs.ChildOutlets.replySpec(TestingAppOrigins.LOCALHOST_4201, TestingAppOrigins.LOCALHOST_4202);
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
  });
});

