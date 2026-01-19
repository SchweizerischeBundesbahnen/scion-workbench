/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DestroyRef, effect, inject, Injector, input, runInInjectionContext, Signal, StaticProvider, untracked} from '@angular/core';
import {WorkbenchPopup, WorkbenchPopupCapability, WorkbenchPopupReferrer} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {toObservable} from '@angular/core/rxjs-interop';
import {ɵWorkbenchPopup} from '../../popup/ɵworkbench-popup.model';

/**
 * Displays the microfrontend of a popup capability provided by the host.
 *
 * Unlike {@link MicrofrontendPopupComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * to allow direct integration of the content provided by the workbench host application via the Angular router.
 *
 * This component is designed to be displayed in a workbench popup.
 */
@Component({
  selector: 'wb-microfrontend-host-popup',
  styleUrls: ['./microfrontend-host-popup.component.scss'],
  templateUrl: './microfrontend-host-popup.component.html',
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostPopupComponent {

  public readonly capability = input.required<WorkbenchPopupCapability>();
  public readonly params = input.required<Map<string, unknown>>();
  public readonly referrer = input.required<WorkbenchPopupReferrer>();

  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly popup = inject(ɵWorkbenchPopup);
  protected readonly outletInjector = this.computeOutletInjector();

  constructor() {
    this.setPopupSize();
    this.navigateCapability();

    inject(DestroyRef).onDestroy(() => void this.navigate(null)); // Remove the outlet from the URL
  }

  private navigateCapability(): void {
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        void this.navigate(capability.properties.path, {params}).then(success => {
          if (!success) {
            this.popup.close(Error('[PopupNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.'));
          }
        });
      });
    });
  }

  /**
   * Performs navigation in the specified outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, unknown>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras?.params);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => Routing.pathToCommands(path)) : null);
    const commands: Commands = [{outlets: {[this.popup.id]: outletCommands}}];
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
  }

  private computeOutletInjector(): Signal<Injector> {
    const injector = inject(Injector);

    return computed(() => {
      const capability = this.capability();
      const params = this.params();
      const referrer = this.referrer();

      return untracked(() => Injector.create({
        parent: injector,
        providers: [provideWorkbenchPopupHandle(capability, params, referrer)],
      }));
    });
  }

  private setPopupSize(): void {
    effect(() => {
      const size = this.capability().properties.size;
      untracked(() => {
        this.popup.size.width = size?.width;
        this.popup.size.height = size?.height;
        this.popup.size.minWidth = size?.minWidth;
        this.popup.size.maxWidth = size?.maxWidth;
        this.popup.size.minHeight = size?.minHeight;
        this.popup.size.maxHeight = size?.maxHeight;
      });
    });
  }
}

/**
 * Provides the {WorkbenchPopup} handle to the routed component.
 */
function provideWorkbenchPopupHandle(capability: WorkbenchPopupCapability, params: Map<string, unknown>, referrer: WorkbenchPopupReferrer): StaticProvider {
  return {
    provide: WorkbenchPopup,
    useFactory: (): WorkbenchPopup => {
      const popup = inject(ɵWorkbenchPopup);

      return new class implements WorkbenchPopup {
        public readonly id = popup.id;
        public readonly capability = capability;
        public readonly params = params;
        public readonly referrer = referrer;
        public readonly focused$ = toObservable(popup.focused, {injector: popup.injector});

        public setResult(result?: unknown): void {
          popup.setResult(result);
        }

        public close(result?: unknown | Error): void {
          popup.close(result);
        }

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      }();
    },
  };
}
