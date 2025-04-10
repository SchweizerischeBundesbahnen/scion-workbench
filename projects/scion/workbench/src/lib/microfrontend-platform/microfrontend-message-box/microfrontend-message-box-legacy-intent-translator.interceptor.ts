import {Injectable} from '@angular/core';
import {Handler, IntentInterceptor, IntentMessage} from '@scion/microfrontend-platform';
import {eMESSAGE_BOX_MESSAGE_PARAM, WorkbenchCapabilities, WorkbenchMessageBoxLegacyOptions} from '@scion/workbench-client';

/**
 * @deprecated since workbench version 17.0.0-beta.9; provides backward compatibility for {@link WorkbenchMessageBoxLegacyOptions}; interceptor will be removed in a future release.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendMessageBoxLegacyIntentTranslator implements IntentInterceptor {

  public intercept(intentMessage: IntentMessage<WorkbenchMessageBoxLegacyOptions>, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.MessageBox && !Object.keys(intentMessage.capability.qualifier ?? {}).length && hasLegacyContent(intentMessage)) {
      const params = (intentMessage.intent.params ?? new Map<string, unknown>());
      // Move legacy 'content' to the new 'message' param.
      intentMessage.intent.params = params.set(eMESSAGE_BOX_MESSAGE_PARAM, intentMessage.body!.content);
      return next.handle(intentMessage);
    }
    else {
      return next.handle(intentMessage);
    }
  }
}

/**
 * Tests if the intent contains `content` in the body instead of the `message` param,
 * sent by workbench clients older than version v1.0.0-beta.23.
 */
function hasLegacyContent(intentMessage: IntentMessage<WorkbenchMessageBoxLegacyOptions>): boolean {
  return !intentMessage.intent.params?.get(eMESSAGE_BOX_MESSAGE_PARAM) && !!intentMessage.body?.content;
}
