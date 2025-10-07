/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DestroyRef, inject, Injector, runInInjectionContext, Signal, untracked} from '@angular/core';
import {WorkbenchPartCapability} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {createRemoteTranslatable} from '../text/remote-text-provider';
import {ɵWorkbenchPart} from '../../part/ɵworkbench-part.model';
import {MicrofrontendPartNavigationData} from '../microfrontend-part/microfrontend-part-navigation-data';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {Maps} from '@scion/toolkit/util';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';

/**
 * Navigates to the microfrontend of a given {@link WorkbenchPartCapability} via {@link Router}.
 *
 * Unlike {@link MicrofrontendPartComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * to allow direct integration of the content provided by the workbench host application via the Angular router.
 */
@Component({
  selector: 'wb-microfrontend-host-part',
  styleUrls: ['./microfrontend-host-part.component.scss'],
  templateUrl: './microfrontend-host-part.component.html',
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
    RouterOutletRootContextDirective,
  ],
})
export class MicrofrontendHostPartComponent {

  public readonly capability: WorkbenchPartCapability;
  public readonly params: Map<string, unknown>;

  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly outletInjector = this.computeOutletInjector();
  protected readonly outletName = `host-${this.part.id}`;

  constructor() {
    console.log('>>> MicrofrontendHostPartComponent');
    const {capabilityId, params} = this.part.navigation()!.data as unknown as MicrofrontendPartNavigationData;
    this.capability = inject(ManifestObjectCache).getCapability(capabilityId);
    this.params = Maps.coerce(params);
    void this.navigate(this.capability.properties!.path!, {params: this.params});

    this.setPartProperties();
    inject(DestroyRef).onDestroy(() => console.log('>>> destroy host part')); // Remove the outlet from the URL
  }

  /**
   * Performs navigation in the named outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, any>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras?.params);
    console.log(`>>> navigate host part path=${path}`);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => Routing.pathToCommands(path)) : null);
    const commands: Commands = [{outlets: {[this.outletName]: outletCommands}}];
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
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

  private setPartProperties(): void {
    const properties = this.capability.properties;
    const params = this.params;
    const appSymbolicName = this.capability.metadata!.appSymbolicName;
    this.part.title = properties?.title ? createRemoteTranslatable(properties.title, {appSymbolicName, valueParams: params, topicParams: properties.resolve}) : undefined;
  }
}

/**
 * Provides the {WorkbenchDialog} handle to the routed component.
 */
// function provideWorkbenchClientDialogHandle(capability: WorkbenchDialogCapability, params: Map<string, unknown>): StaticProvider {
//   return {
//     provide: WorkbenchClientDialog,
//     useFactory: (): WorkbenchClientDialog => {
//       const dialog = inject(ɵWorkbenchDialog);
//       const titleChange$ = new Subject<void>();
//
//       return new class implements WorkbenchClientDialog {
//         public readonly id = dialog.id;
//         public readonly capability = capability;
//         public readonly params = params;
//         public readonly focused$ = toObservable(dialog.focused, {injector: dialog.injector});
//
//         public setTitle(title: Translatable | Observable<Translatable>): void {
//           titleChange$.next();
//
//           Observables.coerce(title)
//             .pipe(
//               takeUntilDestroyed(dialog.injector.get(DestroyRef)),
//               takeUntil(titleChange$),
//             )
//             .subscribe(title => dialog.title = createRemoteTranslatable(title, {appSymbolicName: capability.metadata!.appSymbolicName}));
//         }
//
//         public close(result?: unknown | Error): void {
//           dialog.close(result);
//         }
//
//         public signalReady(): void {
//           // nothing to do since not an iframe-based microfrontend
//         }
//       }();
//     },
//   };
// }
