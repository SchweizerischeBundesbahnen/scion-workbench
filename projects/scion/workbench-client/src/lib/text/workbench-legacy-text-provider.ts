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
import {ACTIVATION_CONTEXT, APP_IDENTITY, ContextService, IS_PLATFORM_HOST, ManifestService, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {Disposable} from '../common/disposable';
import {WorkbenchTextProviderFn, ɵWORKBNCH_CLIENT_TEXT_PROVIDER} from './workbench-text-provider.model';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {installTextIntentHandler, registerTextProviderCapability} from './ɵworkbench-text-provider-capability-installer';

/**
 * Provides texts to the SCION Workbench and other micro apps.
 *
 * A text provider is a function that returns the text for a translation key.
 *
 * Texts starting with the percent symbol (`%`) are passed to the text provider for translation, with the percent symbol omitted.
 *
 * This function must be called in an Activator.
 *
 * @return Object to unregister the text provider.
 *
 * @deprecated since version 1.0.0-beta.41. Marked for removal.
 */
export function registerLegacyTextProvider(): Disposable {
  const resources = new Subscription();

  // Wait until starting or started the platform.
  Promise.race([MicrofrontendPlatform.whenState(PlatformState.Starting), MicrofrontendPlatform.whenState(PlatformState.Started)])
    .then(async () => {
      await assertInHostOrActivator();
      await throwIfAlreadyRegistered();

      // Register 'text-provider' capability.
      const capability = await registerTextProviderCapability();
      if (!capability) {
        return;
      }

      // Install intent handler to reply to text requests.
      const textProvider = Beans.get<WorkbenchTextProviderFn>(ɵWORKBNCH_CLIENT_TEXT_PROVIDER);
      const intentHandler = installTextIntentHandler(capability, (key, params) => textProvider(key, params));

      // Release resources when stopping the platform, e.g., during hot code replacement.
      const resources = new Subscription();
      resources.add(() => void Beans.get(ManifestService).unregisterCapabilities({id: capability.metadata!.id}));
      resources.add(intentHandler);

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
