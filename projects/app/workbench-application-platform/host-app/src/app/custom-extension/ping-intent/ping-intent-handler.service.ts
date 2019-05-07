import { Injectable } from '@angular/core';
import { IntentHandler, MessageBus } from '@scion/workbench-application-platform';
import { NilQualifier, IntentMessage, MessageEnvelope } from '@scion/workbench-application-platform.api';

@Injectable()
export class PingIntentHandler implements IntentHandler {

  public readonly type = 'ping';
  public readonly qualifier = NilQualifier;

  public readonly description = 'Replies to ping requests.';

  constructor(private _messageBus: MessageBus) {
  }

  public onIntent(envelope: MessageEnvelope<IntentMessage>): void {
    this._messageBus.publishReply(envelope.message.payload, envelope.sender, envelope.replyToUid);
  }
}
