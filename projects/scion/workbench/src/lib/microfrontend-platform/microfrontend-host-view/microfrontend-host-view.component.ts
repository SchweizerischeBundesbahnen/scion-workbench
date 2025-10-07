/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DestroyRef, effect, inject, Injector, runInInjectionContext, Signal, untracked} from '@angular/core';
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {createRemoteTranslatable} from '../text/remote-text-provider';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {Maps} from '@scion/toolkit/util';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {MicrofrontendViewNavigationData} from '../microfrontend-view/microfrontend-view-navigation-data';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';

/**
 * Navigates to the microfrontend of a given {@link WorkbenchViewCapability} via {@link Router}.
 *
 * Unlike {@link MicrofrontendViewComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * to allow direct integration of the content provided by the workbench host application via the Angular router.
 */
@Component({
  selector: 'wb-microfrontend-host-view',
  styleUrls: ['./microfrontend-host-view.component.scss'],
  templateUrl: './microfrontend-host-view.component.html',
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
    RouterOutletRootContextDirective,
  ],
})
export class MicrofrontendHostViewComponent {

  public readonly capability = this.computeCapability();
  public readonly params = computed(() => {
    const navigation = this.view.navigation()!.data as unknown as MicrofrontendViewNavigationData;
    return navigation.params;
  });

  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly view = inject(ɵWorkbenchView);
  protected readonly outletInjector = this.computeOutletInjector();
  protected readonly outletName = `host-${this.view.id}`;

  constructor() {
    this.setViewProperties();
    this.navigateCapability();

    inject(DestroyRef).onDestroy(() => this.navigate(null)); // Remove the outlet from the URL
  }

  private navigateCapability(): void {
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        void this.navigate(capability.properties.path, {params: Maps.coerce(params)}).then(success => {
          if (!success) {
            console.log('>>> [ViewNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.');
          }
        });
      });
    });
  }

  /**
   * Performs navigation in the named outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, any>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras?.params);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => Routing.pathToCommands(path)) : null);
    const commands: Commands = [{outlets: {[this.outletName]: outletCommands}}];
    console.log(`>>> navigate host view`, commands);
    // return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {queryParamsHandling: 'preserve'}));
  }

  private computeOutletInjector(): Signal<Injector> {
    const injector = inject(Injector);

    return computed(() => {
      // const capability = this.capability();
      // const params = this.params();

      return untracked(() => Injector.create({
        parent: injector,
        providers: [],
        // providers: [provideWorkbenchClientDialogHandle(capability, params)],
      }));
    });
  }

  private computeCapability(): Signal<WorkbenchViewCapability> {
    const manifestObjectCache = inject(ManifestObjectCache);
    return computed(() => {
      const navigation = this.view.navigation()!.data as unknown as MicrofrontendViewNavigationData;

      return untracked(() => manifestObjectCache.getCapability(navigation.capabilityId));
    });
  }

  private setViewProperties(): void {
    effect(() => {
      const properties = this.capability().properties;
      const params = this.params();
      const appSymbolicName = this.capability().metadata!.appSymbolicName;

      untracked(() => {
        this.view.title = properties?.title ?? null;
        this.view.heading = properties?.heading ? createRemoteTranslatable(properties.heading, {appSymbolicName, valueParams: params, topicParams: properties.resolve}) : null;
      });
    });
  }
}
