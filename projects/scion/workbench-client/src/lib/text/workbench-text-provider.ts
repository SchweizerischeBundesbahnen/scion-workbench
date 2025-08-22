/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {firstValueFrom, Subscription} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {ACTIVATION_CONTEXT, APP_IDENTITY, ContextService, IntentClient, IS_PLATFORM_HOST, ManifestService, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {Disposable} from '../common/disposable';
import {WorkbenchTextProviderCapability, WorkbenchTextProviderFn} from './workbench-text-provider.model';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Provides texts to the SCION Workbench and micro apps.
 *
 * A text provider is a function that returns the text for a translation key.
 *
 * Texts starting with the percent symbol (`%`) are passed to the text provider for translation, with the percent symbol omitted.
 *
 * This function must be called in an Activator.
 *
 * @param textProvider - Function to provide the text for a translation key.
 * @return Object to unregister the text provider.
 */
export function registerTextProvider(textProvider: WorkbenchTextProviderFn): Disposable {
  const resources = new Subscription();

  // Wait until starting or started the platform.
  Promise.race([MicrofrontendPlatform.whenState(PlatformState.Starting), MicrofrontendPlatform.whenState(PlatformState.Started)])
    .then(async () => {
      await assertInHostOrActivator();
      await throwIfAlreadyRegistered();

      // Register 'text-provider' capability.
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
      const manifestService = Beans.get(ManifestService);
      const capabilityId = await manifestService.registerCapability(capability);
      resources.add(() => void manifestService.unregisterCapabilities({id: capabilityId}));

      // Install intent handler.
      const intentSubscription = Beans.get(IntentClient).onIntent<void, string | undefined>({type: capability.type, qualifier: capability.qualifier}, ({intent}) => {
        const key = intent.params!.get('key') as string;
        const params = intent.params!.get('params') as Record<string, string> | undefined ?? {};
        return textProvider(key, params);
      });
      resources.add(intentSubscription);
    })
    .catch((error: unknown) => {
      console.error(`[WorkbenchClientError] Failed to register text provider for application '${Beans.opt(APP_IDENTITY)}'. Caused by: `, error);
      resources.unsubscribe();
    });

  // Unregister text provider when stopping the platform, e.g., during hot code replacement.
  void MicrofrontendPlatform.whenState(PlatformState.Stopping).then(() => resources.unsubscribe());

  return {
    dispose: () => resources.unsubscribe(),
  };
}

/**
 * Throws if the application has already registered a text provider capability.
 */
async function throwIfAlreadyRegistered(): Promise<void> {
  const capabilities = await firstValueFrom(Beans.get(ManifestService).lookupCapabilities$({type: WorkbenchCapabilities.TextProvider, qualifier: {provider: Beans.get(APP_IDENTITY)}}));
  if (capabilities.length > 0) {
    throw Error('[TextProviderError] Text Provider already registered.');
  }
}

/**
 * Throws if not in the context of the host app or an activator.
 */
async function assertInHostOrActivator(): Promise<void> {
  if (Beans.get(IS_PLATFORM_HOST)) {
    return;
  }
  if (!await Beans.get(ContextService).isPresent(ACTIVATION_CONTEXT)) {
    throw Error('[TextProviderError] Text Provider must be registered in an Activator.');
  }
}
