/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {firstValueFrom, Observable, Subscription} from 'rxjs';
import {Beans, Initializer} from '@scion/toolkit/bean-manager';
import {ACTIVATION_CONTEXT, ActivationContext, APP_IDENTITY, Capability, ContextService, IntentClient, IS_PLATFORM_HOST, ManifestService, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {WorkbenchTextProviderCapability, WorkbenchTextProviderFn, ɵWORKBNCH_CLIENT_TEXT_PROVIDER} from './workbench-text-provider.model';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Provides texts to the SCION Workbench and other micro apps via {@link WorkbenchTextProviderCapability}.
 *
 * This provider is only installed if running in an activator or the host app. Has no effect otherwise.
 *
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchTextProviderCapabilityInstaller implements Initializer {

  public async init(): Promise<void> {
    const textProviderFn = Beans.opt<WorkbenchTextProviderFn>(ɵWORKBNCH_CLIENT_TEXT_PROVIDER);
    if (!textProviderFn) {
      return;
    }

    // Check if running in the primary activator or the host app.
    if (!await isHostOrActivator()) {
      return;
    }

    // Register 'text-provider' capability.
    const capability = await registerTextProviderCapability();
    if (!capability) {
      return;
    }

    // Install intent handler to reply to text requests.
    const intentHandler = installTextIntentHandler(capability, (key, params) => {
      return textProviderFn(key, params);
    });

    // Release resources when stopping the platform, e.g., during hot code replacement.
    const resources = new Subscription();
    resources.add(() => void Beans.get(ManifestService).unregisterCapabilities({id: capability.metadata!.id}));
    resources.add(intentHandler);

    void MicrofrontendPlatform.whenState(PlatformState.Stopping).then(() => resources.unsubscribe());
  }
}

/**
 * Registers a text provider capability to provide texts to the SCION Workbench and other micro apps.
 */
export async function registerTextProviderCapability(): Promise<WorkbenchTextProviderCapability | null> {
  const appSymbolicName = Beans.get<string>(APP_IDENTITY);
  const capability: WorkbenchTextProviderCapability = {
    type: WorkbenchCapabilities.TextProvider,
    qualifier: {provider: appSymbolicName},
    private: false,
    description: `Provides texts of '${appSymbolicName}' application.`,
    params: [
      {
        name: 'key',
        required: true,
        description: '{string} - Translation key of the text.',
      },
      {
        name: 'params',
        required: false,
        description: '{dictionary} - Parameters used for text interpolation.',
      },
    ],
  };

  await throwIfAlreadyRegistered(capability);
  const capabilityId = await Beans.get(ManifestService).registerCapability(capability);
  if (!capabilityId) {
    return null;
  }

  return {
    ...capability,
    metadata: {id: capabilityId, appSymbolicName},
  };
}

/**
 * Replies to text intents sent to this application.
 */
export function installTextIntentHandler(capability: Capability, onIntent: (key: string, params: Record<string, string>) => Observable<string | undefined> | string | undefined): Subscription {
  return Beans.get(IntentClient).onIntent<void, string | undefined>({type: capability.type, qualifier: capability.qualifier}, ({intent}) => {
    const key = intent.params!.get('key') as string;
    const params = intent.params!.get('params') as Record<string, string> | undefined ?? {};
    return onIntent(key, params);
  });
}

/**
 * Tests if running in the context of the host app or an activator.
 */
async function isHostOrActivator(): Promise<boolean> {
  return Beans.get(IS_PLATFORM_HOST) || (await Beans.get(ContextService).lookup<ActivationContext>(ACTIVATION_CONTEXT))?.primary || false;
}

/**
 * Throws if the application has already registered a text provider capability.
 */
async function throwIfAlreadyRegistered(capability: WorkbenchTextProviderCapability): Promise<void> {
  const capabilities = await firstValueFrom(Beans.get(ManifestService).lookupCapabilities$({type: capability.type, qualifier: capability.qualifier}));
  if (capabilities.length > 0) {
    throw Error('[TextProviderError] Text Provider already registered.');
  }
}
