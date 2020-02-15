/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Beans, PreDestroy } from '../../bean-manager';
import { ActivatorProvider, PlatformCapabilityTypes } from '../../platform.model';
import { PlatformManifestService } from '../../client/manifest-registry/platform-manifest-service';
import { of, Subject } from 'rxjs';
import { first, mergeMap, reduce, take } from 'rxjs/operators';
import { ApplicationRegistry } from '../application-registry';
import { OutletRouter } from '../../client/router-outlet/outlet-router';
import { SciRouterOutletElement } from '../../client/router-outlet/router-outlet.element';
import { Maps, UUID } from '@scion/toolkit/util';
import { Logger } from '../../logger';

/**
 * Activates applications which provide an activator capability.
 *
 * Activators are loaded on platform startup so that applications can interact with the system
 * even when no microfrontend of that app is currently displayed. For example, it allows an
 * application to handle intents, or to flexibly provide capabilities.
 *
 * @ignore
 */
export class ApplicationActivator implements PreDestroy {

  private _destroy$ = new Subject<void>();
  private _whenDestroy = this._destroy$.pipe(first()).toPromise();

  constructor() {
    Beans.get(PlatformManifestService).lookupCapabilityProviders$({type: PlatformCapabilityTypes.Activator})
      .pipe(
        take(1),
        mergeMap(activators => of(...activators)),
        reduce((activatorsByApp, activator) => Maps.addListValue(activatorsByApp, activator.metadata.appSymbolicName, activator), new Map<string, ActivatorProvider[]>()),
      )
      .subscribe((activatorsByApp: Map<string, ActivatorProvider[]>) => {
        activatorsByApp.forEach((activators: ActivatorProvider[]) => {
          // Nominate one activator of each app as primary activator.
          const primaryActivator = activators[0];
          activators.forEach(activator => this.mountActivator(activator, activator === primaryActivator));
        });
      });
  }

  /**
   * Mounts a hidden <sci-router-outlet> and loads the activator endpoint.
   */
  private mountActivator(activator: ActivatorProvider, primary: boolean): void {
    if (!activator.properties || !activator.properties.path) {
      Beans.get(Logger).error(`[ActivatorError] Failed to activate the application '${activator.metadata.appSymbolicName}'. Missing required 'path' property in the provided activator capability.`);
      return;
    }

    const application = Beans.get(ApplicationRegistry).getApplication(activator.metadata.appSymbolicName);
    const activatorUrl = `${trimPath(application.baseUrl)}/${trimPath(activator.properties.path)}`;

    // Create the router outlet and navigate to the activator endpoint.
    const routerOutlet = document.createElement('sci-router-outlet') as SciRouterOutletElement;
    routerOutlet.name = UUID.randomUUID();
    Beans.get(OutletRouter).navigate(activatorUrl, {outlet: routerOutlet.name}).then();

    // Provide the activation context
    routerOutlet.setContextValue<ActivationContext>(ACTIVATION_CONTEXT, {primary, activator});
    // Add CSS classes for debugging purposes
    routerOutlet.classList.add('sci-activator', application.symbolicName);
    // Make the router outlet invisible
    routerOutlet.style.display = 'none';
    // Take the router outlet out of the document flow
    routerOutlet.style.position = 'absolute';
    // Add the router outlet to the DOM
    document.body.appendChild(routerOutlet);
    // Unmount the router outlet on platform shutdown
    this._whenDestroy.then(() => document.body.removeChild(routerOutlet));
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Removes leading and trailing slashes from the path, if any.
 *
 * @ignore
 */
function trimPath(path: string): string {
  let trimmedPath = path;
  if (trimmedPath.startsWith('/')) {
    trimmedPath = trimmedPath.substr(1);
  }
  if (trimmedPath.endsWith('/')) {
    trimmedPath = trimmedPath.slice(0, -1);
  }
  return trimmedPath;
}

/**
 * Key for obtaining the current activation context using {@link ContextService}.
 *
 * The activation context is only available to microfrontends loaded by an activator.
 *
 * @see {@link ActivationContext}
 * @see {@link ContextService}
 * @category Platform
 */
export const ACTIVATION_CONTEXT = 'ɵACTIVATION_CONTEXT';

/**
 * Information about the activator that loaded a microfrontend.
 *
 * This context is available to a microfrontend if loaded by an application activator.
 * This object can be obtained from the {@link ContextService} using the name {@link ACTIVATION_CONTEXT}.
 *
 * ```ts
 * Beans.get(ContextService).observe$(ACTIVATION_CONTEXT).subscribe((activationContext: ActivationContext) => {
 *   if (activationContext.primary) {
 *     ...
 *   }
 * });
 * ```
 *
 * @see {@link ACTIVATION_CONTEXT}
 * @see {@link ContextService}
 * @category Platform
 */
export interface ActivationContext {
  /**
   * Indicates whether running in the context of the primary activator.
   * The platform nominates one activator of each app as primary activator.
   */
  primary: boolean;
  /**
   * Metadata about the activator that activated the microfrontend.
   */
  activator: ActivatorProvider;
}
