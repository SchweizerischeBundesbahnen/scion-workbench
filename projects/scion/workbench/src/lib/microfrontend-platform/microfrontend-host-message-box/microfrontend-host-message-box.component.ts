/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DestroyRef, effect, ElementRef, inject, Injector, input, runInInjectionContext, Signal, StaticProvider, untracked} from '@angular/core';
import {WorkbenchMessageBox, WorkbenchMessageBoxCapability, ɵMessageBoxContext} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog.model';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {setStyle} from '../../common/dom.util';
import {toObservable} from '@angular/core/rxjs-interop';

/**
 * Navigates to the microfrontend of a given {@link WorkbenchMessageBoxCapability} via {@link Router}.
 *
 * Unlike {@link MicrofrontendMessageBoxComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * to allow direct integration of the content provided by the workbench host application via the Angular router.
 *
 * This component is designed to be displayed in a workbench message box.
 */
@Component({
  selector: 'wb-microfrontend-host-message-box',
  styleUrls: ['./microfrontend-host-message-box.component.scss'],
  templateUrl: './microfrontend-host-message-box.component.html',
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostMessageBoxComponent {

  public readonly capability = input.required<WorkbenchMessageBoxCapability>();
  public readonly params = input.required<Map<string, unknown>>();
  public readonly referrer = input.required<string>();

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly dialog = inject(ɵWorkbenchDialog);
  protected readonly outletInjector = this.computeOutletInjector();

  constructor() {
    this.setMessageBoxProperties();
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
            this.dialog.close(Error('[MessageBoxNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.'));
          }
        });
      });
    });
  }

  /**
   * Performs navigation in the named outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, unknown>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras?.params);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => Routing.pathToCommands(path)) : null);
    const commands: Commands = [{outlets: {[this.dialog.id]: outletCommands}}];
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
  }

  private computeOutletInjector(): Signal<Injector> {
    const injector = inject(Injector);

    return computed(() => {
      const context: ɵMessageBoxContext = {
        capability: this.capability(),
        params: this.params(),
        dialogId: this.dialog.id,
        referrer: {
          appSymbolicName: this.referrer(),
        },
      };

      return untracked(() => Injector.create({
        parent: injector,
        providers: [provideWorkbenchClientMessageBoxHandle(context)],
      }));
    });
  }

  private setMessageBoxProperties(): void {
    effect(() => {
      const properties = this.capability().properties;

      untracked(() => {
        setStyle(this._host, {
          'width': properties.size?.width ?? null,
          'min-width': properties.size?.minWidth ?? null,
          'max-width': properties.size?.maxWidth ?? null,
          'height': properties.size?.height ?? null,
          'min-height': properties.size?.minHeight ?? null,
          'max-height': properties.size?.maxHeight ?? null,
        });
      });
    });
  }
}

/**
 * Provides the {WorkbenchMessageBox} handle to the routed component.
 */
function provideWorkbenchClientMessageBoxHandle(context: ɵMessageBoxContext): StaticProvider {
  return {
    provide: WorkbenchMessageBox,
    useFactory: (): WorkbenchMessageBox => {
      const dialog = inject(ɵWorkbenchDialog);

      return new class implements WorkbenchMessageBox {
        public readonly capability = context.capability;
        public readonly params = context.params;
        public readonly referrer = context.referrer;
        public readonly id = dialog.id;
        public readonly focused$ = toObservable(dialog.focused, {injector: dialog.injector});

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      }();
    },
  };
}
