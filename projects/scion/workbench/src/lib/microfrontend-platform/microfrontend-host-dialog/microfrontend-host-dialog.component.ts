/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, effect, inject, Injector, input, runInInjectionContext, StaticProvider, untracked} from '@angular/core';
import {WorkbenchDialog as WorkbenchClientDialog, WorkbenchDialogCapability} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog';
import {NgTemplateOutlet} from '@angular/common';
import {DIALOG_ID_PREFIX} from '../../workbench.constants';
import {Observable, Subject} from 'rxjs';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {Observables} from '@scion/toolkit/util';
import {takeUntil} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Navigates to the microfrontend of a given {@link WorkbenchDialogCapability} via {@link Router}.
 *
 * Unlike {@link MicrofrontendDialogComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * to allow direct integration of the content provided by the workbench host application via the Angular router.
 *
 * This component is designed to be displayed in a workbench dialog.
 */
@Component({
  selector: 'wb-microfrontend-host-dialog',
  styleUrls: ['./microfrontend-host-dialog.component.scss'],
  templateUrl: './microfrontend-host-dialog.component.html',
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostDialogComponent {

  public readonly capability = input.required<WorkbenchDialogCapability>();
  public readonly params = input.required<Map<string, unknown>>();

  private readonly _dialog = inject(ɵWorkbenchDialog);
  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly outletName = DIALOG_ID_PREFIX.concat(this._dialog.id);

  protected outletInjector!: Injector;

  constructor() {
    this.setDialogProperties();
    this.createOutletInjector();
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
            this._dialog.close(Error('[DialogNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.'));
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
    return this._angularRouterMutex.submit(() => this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'}));
  }

  private createOutletInjector(): void {
    effect(() => {
      const capability = this.capability();
      const params = this.params();

      untracked(() => {
        this.outletInjector = Injector.create({
          parent: this._injector,
          providers: [provideWorkbenchClientDialogHandle(capability, params)],
        });
      });
    });
  }

  private setDialogProperties(): void {
    effect(() => {
      const properties = this.capability().properties;
      const params = this.params();

      untracked(() => {
        this._dialog.size.width = properties.size?.width;
        this._dialog.size.height = properties.size?.height;
        this._dialog.size.minWidth = properties.size?.minWidth;
        this._dialog.size.maxWidth = properties.size?.maxWidth;
        this._dialog.size.minHeight = properties.size?.minHeight;
        this._dialog.size.maxHeight = properties.size?.maxHeight;

        this._dialog.title = Microfrontends.substituteNamedParameters(properties.title, params);
        this._dialog.closable = properties.closable ?? true;
        this._dialog.resizable = properties.resizable ?? true;
        this._dialog.padding = properties.padding ?? true;
      });
    });
  }
}

/**
 * Provides the {WorkbenchDialog} handle to the routed component.
 */
function provideWorkbenchClientDialogHandle(capability: WorkbenchDialogCapability, params: Map<string, unknown>): StaticProvider {
  return {
    provide: WorkbenchClientDialog,
    useFactory: (): WorkbenchClientDialog => {
      const dialog = inject(ɵWorkbenchDialog);
      const titleChange$ = new Subject<void>();

      return new class implements WorkbenchClientDialog {
        public readonly capability = capability;
        public readonly params = params;

        public setTitle(title: string | Observable<string>): void {
          titleChange$.next();

          Observables.coerce(title)
            .pipe(
              takeUntilDestroyed(dialog.injector.get(DestroyRef)),
              takeUntil(titleChange$),
            )
            .subscribe(title => dialog.title = title);
        }

        public close(result?: unknown | Error): void {
          dialog.close(result);
        }

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      }();
    },
  };
}
