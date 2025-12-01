import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Manifest} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';

/**
 * Adds a wildcard text-provider intention to the host manifest for the workbench to request texts from any application.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendTextIntentionProvider implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.intentions = [
      ...hostManifest.intentions ?? [],
      {
        type: WorkbenchCapabilities.TextProvider,
        qualifier: {provider: '*'},
      },
    ];
  }
}
