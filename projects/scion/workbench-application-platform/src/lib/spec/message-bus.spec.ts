/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { NullErrorHandler } from '../core/null-error-handler.service';
import { ApplicationRegistry } from '../core/application-registry.service';
import { MessageBus } from '../core/message-bus.service';
import { ErrorHandler } from '../core/metadata';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { UUID } from '../core/uuid.util';
import { Capability, CapabilityProviderMessage, Intent, IntentMessage, MessageEnvelope, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

// tslint:disable:no-unnecessary-initializer
describe('MessageBus', () => {

  let appRegistry: ApplicationRegistry;
  let messageDispatched: boolean;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });
  }));

  beforeEach(inject([MessageBus, ApplicationRegistry], (messageBus: MessageBus, applicationRegistry: ApplicationRegistry) => {
    appRegistry = applicationRegistry;
    messageDispatched = false;
    messageBus.stream$.subscribe(() => messageDispatched = true);
  }));

  describe('An intent', () => {

    it('should be published if the publishing app manifests a respective intention', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});

      const envelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(envelope, 'app-2');
      expect(messageDispatched).toBeTruthy();
    })));

    it('should be published if qualified implicitly because the publishing app provides the respective capability', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });

      const envelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(envelope, 'app-1');
      expect(messageDispatched).toBeTruthy();
    })));

    it('should be published if the publishing app manifests a matching wildcard intention', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}, private: false}],
      });
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: '*'}}]});

      const envelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}});
      messageBus.publishMessageIfQualified(envelope, 'app-2');
      expect(messageDispatched).toBeTruthy();
    })));

    it('should not be published if the publishing app does not manifest a respective intention [NotQualifiedError]', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [
          {type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false},
          {type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}, private: false},
        ],
      });
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});

      const envelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}});
      expect(() => messageBus.publishMessageIfQualified(envelope, 'app-2')).toThrowError(/NotQualifiedError/);
    })));

    it('should not be published if there is no public capability handling the intent [NullProviderError]', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}, private: true}],
      });
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}}]});

      const envelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}});
      expect(() => messageBus.publishMessageIfQualified(envelope, 'app-2')).toThrowError(/NullProviderError/);
    })));

    it('should be published even if there is no public capability handling the intent, but the publishing app provides a private capability to handle it', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1',
        capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: true}],
        intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}],
      });

      const envelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(envelope, 'app-1');
      expect(messageDispatched).toBeTruthy();
    })));

    it('should be received by the app which provides a capability handling the intent', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});

      // capture intent
      let intentReceived: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-1').subscribe(it => intentReceived = it);

      // publish intent
      const intentEnvelope = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(intentEnvelope, 'app-2');
      tick();

      expect(intentReceived).toBeDefined();
    })));

    it('should not be received by an app which does not provide a capability handling the intent', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });
      registerApp({
        name: 'app-2', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}, private: false}],
      });
      registerApp({name: 'app-3', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}}]});

      // capture intent
      let intentReceivedByApp1: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-1').subscribe(it => intentReceivedByApp1 = it);
      let intentReceivedByApp2: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-2').subscribe(it => intentReceivedByApp2 = it);

      // publish intent
      const intent = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}});
      messageBus.publishMessageIfQualified(intent, 'app-3');
      tick();

      expect(intentReceivedByApp1).toBeUndefined();
      expect(intentReceivedByApp2).toBeDefined();
    })));

    it('should only be received by public capability providers, unless the publishing app provides the private capability itself (1/2)', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: true}],
      });
      registerApp({
        name: 'app-2', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });
      registerApp({name: 'app-3', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});

      // capture intent
      let intentReceivedByApp1: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-1').subscribe(it => intentReceivedByApp1 = it);
      let intentReceivedByApp2: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-2').subscribe(it => intentReceivedByApp2 = it);

      // publish intent
      const intent = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(intent, 'app-3');
      tick();

      expect(intentReceivedByApp1).toBeUndefined();
      expect(intentReceivedByApp2).toBeDefined();
    })));

    it('should only be received by public capability providers, unless the publishing app provides the private capability itself (2/2)', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1',
        capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: true}],
        intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}],
      });

      // capture intent
      let intentReceived: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-1').subscribe(it => intentReceived = it);

      // publish intent
      const intent = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(intent, 'app-1');
      tick();

      expect(intentReceived).toBeDefined();
    })));

    it('should implicitly be received by the publishing app if it provides a capability to handle the intent', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1',
        capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: true}],
      });

      // capture intent
      let intentReceived: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-1').subscribe(it => intentReceived = it);

      // publish intent
      const intent = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(intent, 'app-1');
      tick();

      expect(intentReceived).toBeDefined();
    })));

    it('should be received by apps which provide a capability that match the intent\'s qualifier (wildcard)', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, private: false}],
      });
      registerApp({
        name: 'app-2', capability: [{type: PlatformCapabilityTypes.View, qualifier: {'*': '*'}, private: false}],
      });
      registerApp({
        name: 'app-3', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', '*': '*'}, private: false}],
      });
      registerApp({
        name: 'app-4', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'company', '*': '*'}, private: false}],
      });
      registerApp({
        name: 'app-5', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: '*'}, private: false}],
      });
      registerApp({
        name: 'app-6', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}],
      });

      // capture intent
      let intentReceivedByApp1: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-1').subscribe(it => intentReceivedByApp1 = it);
      let intentReceivedByApp2: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-2').subscribe(it => intentReceivedByApp2 = it);
      let intentReceivedByApp3: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-3').subscribe(it => intentReceivedByApp3 = it);
      let intentReceivedByApp4: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-4').subscribe(it => intentReceivedByApp4 = it);
      let intentReceivedByApp5: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveIntentsForApplication$('app-5').subscribe(it => intentReceivedByApp5 = it);

      // publish intent
      const intent = createIntentEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(intent, 'app-6');
      tick();

      expect(intentReceivedByApp1).toBeUndefined();
      expect(intentReceivedByApp2).toBeDefined();
      expect(intentReceivedByApp3).toBeDefined();
      expect(intentReceivedByApp4).toBeUndefined();
      expect(intentReceivedByApp5).toBeDefined();
    })));
  });

  describe('A message from a capability provider', () => {

    it('should be published if the publishing app manifests a respective capability', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });

      const envelope = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(envelope, 'app-1');
      expect(messageDispatched).toBeTruthy();
    })));

    it('should be published if the publishing app manifests a matching wildcard capability', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: '*'}, private: false}],
      });

      const envelope = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}});
      messageBus.publishMessageIfQualified(envelope, 'app-1');
      expect(messageDispatched).toBeTruthy();
    })));

    it('should not be published if the publishing app does not manifest a respective capability [NotQualifiedError]', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });

      const envelope = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'employment-info'}});
      expect(() => messageBus.publishMessageIfQualified(envelope, 'app-1')).toThrowError(/NotQualifiedError/);
    })));

    it('should be received by the app which manifests a respective intention', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({name: 'app-1', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});
      registerApp({name: 'app-2', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}]});

      // capture provider message
      let providerMessageReceived: MessageEnvelope<CapabilityProviderMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-1').subscribe(it => providerMessageReceived = it);

      // publish provider message
      const providerMessage = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(providerMessage, 'app-2');

      expect(providerMessageReceived).toBeDefined();
    })));

    it('should not be received by an app which does not manifest a respective intention', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({name: 'app-1', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}}]});
      registerApp({name: 'app-3', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}, private: false}]});

      // capture provider message
      let providerMessageReceivedByApp1: MessageEnvelope<CapabilityProviderMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-1').subscribe(it => providerMessageReceivedByApp1 = it);
      let providerMessageReceivedByApp2: MessageEnvelope<CapabilityProviderMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-2').subscribe(it => providerMessageReceivedByApp2 = it);

      // publish provider message
      const providerMessage = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'salary-info'}});
      messageBus.publishMessageIfQualified(providerMessage, 'app-3');
      tick();

      expect(providerMessageReceivedByApp1).toBeUndefined();
      expect(providerMessageReceivedByApp2).toBeDefined();
    })));

    it('should implicitly be received by the publishing app', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1',
        capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: true}],
      });

      // capture provider message
      let providerMessageReceived: MessageEnvelope<CapabilityProviderMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-1').subscribe(it => providerMessageReceived = it);

      // publish provider message
      const providerMessage = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(providerMessage, 'app-1');
      tick();

      expect(providerMessageReceived).toBeDefined();
    })));

    it('with private visibility should only be received by the same application', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1',
        capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: true}],
        intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}],
      });
      registerApp({name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}}]});

      // capture provider message
      let providerMessageReceivedByApp1: MessageEnvelope<CapabilityProviderMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-1').subscribe(it => providerMessageReceivedByApp1 = it);
      let providerMessageReceivedByApp2: MessageEnvelope<CapabilityProviderMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-2').subscribe(it => providerMessageReceivedByApp2 = it);

      // publish provider message
      const providerMessage = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(providerMessage, 'app-1');
      tick();

      expect(providerMessageReceivedByApp1).toBeDefined();
      expect(providerMessageReceivedByApp2).toBeUndefined();
    })));

    it('should be received by apps which manifest an intention that match the capability message\'s qualifier (wildcard)', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      registerApp({
        name: 'app-1', intents: [{type: PlatformCapabilityTypes.View}],
      });
      registerApp({
        name: 'app-2', intents: [{type: PlatformCapabilityTypes.View, qualifier: {'*': '*'}}],
      });
      registerApp({
        name: 'app-3', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', '*': '*'}}],
      });
      registerApp({
        name: 'app-4', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'company', '*': '*'}}],
      });
      registerApp({
        name: 'app-5', intents: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: '*'}}],
      });
      registerApp({
        name: 'app-6', capability: [{type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}, private: false}],
      });

      // capture provider message
      let providerMessageReceivedByApp1: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-1').subscribe(it => providerMessageReceivedByApp1 = it);
      let providerMessageReceivedByApp2: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-2').subscribe(it => providerMessageReceivedByApp2 = it);
      let providerMessageReceivedByApp3: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-3').subscribe(it => providerMessageReceivedByApp3 = it);
      let providerMessageReceivedByApp4: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-4').subscribe(it => providerMessageReceivedByApp4 = it);
      let providerMessageReceivedByApp5: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-5').subscribe(it => providerMessageReceivedByApp5 = it);
      let providerMessageReceivedByApp6: MessageEnvelope<IntentMessage> = undefined;
      messageBus.receiveProviderMessagesForApplication$('app-6').subscribe(it => providerMessageReceivedByApp6 = it);

      // publish provider message
      const providerMessage = createCapabilityEnvelope({type: PlatformCapabilityTypes.View, qualifier: {entity: 'person', viewType: 'personal-info'}});
      messageBus.publishMessageIfQualified(providerMessage, 'app-6');
      tick();

      expect(providerMessageReceivedByApp1).toBeUndefined();
      expect(providerMessageReceivedByApp2).toBeDefined();
      expect(providerMessageReceivedByApp3).toBeDefined();
      expect(providerMessageReceivedByApp4).toBeUndefined();
      expect(providerMessageReceivedByApp5).toBeDefined();
      expect(providerMessageReceivedByApp6).toBeDefined();
    })));
  });

  describe('A reply message', () => {

    it('should be published', fakeAsync(inject([MessageBus], (messageBus: MessageBus) => {
      const symbolicName = 'application-symbolic-name';
      const replyMsg = {};
      const replyUid = UUID.randomUUID();

      // capture reply
      let replyReceived: MessageEnvelope<any> = undefined;
      messageBus.receiveReplyMessagesForApplication$(symbolicName).subscribe(it => replyReceived = it);

      // publish reply
      messageBus.publishReply(replyMsg, symbolicName, replyUid);
      tick();

      expect(replyReceived).toBeDefined();
    })));
  });

  /**
   * Registers an application with its manifest.
   */
  function registerApp(app: { name: string; capability?: Capability[]; intents?: Intent[]; }): void {
    appRegistry.registerApplication({symbolicName: app.name, manifestUrl: `http://${app.name}/manifest`}, {
      name: app.name,
      capabilities: app.capability,
      intents: app.intents,
    });
  }

  function createIntentEnvelope(msg: { type: string; qualifier: Qualifier }): MessageEnvelope<IntentMessage> {
    return {
      channel: 'intent',
      message: {
        type: msg.type,
        qualifier: msg.qualifier,
      },
    };
  }

  function createCapabilityEnvelope(msg: { type: string; qualifier: Qualifier }): MessageEnvelope<IntentMessage> {
    return {
      channel: 'capability',
      message: {
        type: msg.type,
        qualifier: msg.qualifier,
      },
    };
  }
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/

@NgModule({
  providers: [
    MessageBus,
    ManifestRegistry,
    ApplicationRegistry,
    {provide: ErrorHandler, useClass: NullErrorHandler},
  ],
})
class AppTestModule {
}
