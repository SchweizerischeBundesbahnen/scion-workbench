import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Manifest} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';

/**
 * Adds a wildcard perspective intention to the host manifest for the workbench to read perspective capabilities.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveIntentionProvider implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.intentions = [
      ...hostManifest.intentions ?? [],
      {
        type: WorkbenchCapabilities.Perspective,
        qualifier: {'*': '*'},
      },
    ];
  }
}
