import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Intention, Manifest} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';

/**
 * Intercepts the host manifest, registering workbench-specific intentions and capabilities.
 *
 * @internal
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class WorkbenchHostManifestInterceptor implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.intentions = [
      ...hostManifest.intentions ?? [],
      providePerspectiveIntention(),
      provideTextProviderIntention(),
    ];
  }
}

/**
 * Provides a wildcard intention for the workbench to read perspective capabilities.
 */
function providePerspectiveIntention(): Intention {
  return {
    type: WorkbenchCapabilities.Perspective,
    qualifier: {'*': '*'},
  };
}

/**
 * Provides a wildcard intention for the workbench to request texts from any application.
 */
export function provideTextProviderIntention(): Intention {
  return {
    type: WorkbenchCapabilities.TextProvider,
    qualifier: {provider: '*'},
  };
}
