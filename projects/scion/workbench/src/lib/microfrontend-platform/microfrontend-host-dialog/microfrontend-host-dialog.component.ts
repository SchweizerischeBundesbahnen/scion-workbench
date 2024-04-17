/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, Input, OnDestroy, OnInit, runInInjectionContext, StaticProvider} from '@angular/core';
import {WorkbenchDialog as WorkbenchClientDialog, WorkbenchDialogCapability} from '@scion/workbench-client';
import {RouterUtils} from '../../routing/router.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog';
import {WorkbenchDialog} from '../../dialog/workbench-dialog';
import {NgTemplateOutlet} from '@angular/common';
import {DIALOG_ID_PREFIX} from '../../workbench.constants';
import {Observable} from 'rxjs';
import {throwError} from '../../common/throw-error.util';
import {Microfrontends} from '../common/microfrontend.util';

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
  standalone: true,
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostDialogComponent implements OnDestroy, OnInit {

  @Input({required: true})
  public capability!: WorkbenchDialogCapability;

  @Input({required: true})
  public params!: Map<string, unknown>;

  protected outletName: string;
  protected outletInjector!: Injector;

  constructor(private _dialog: ɵWorkbenchDialog,
              private _injector: Injector,
              private _router: Router) {
    this.outletName = DIALOG_ID_PREFIX.concat(this._dialog.id);
  }

  public ngOnInit(): void {
    this.setDialogProperties();
    this.createOutletInjector();
    this.navigate(this.capability.properties.path, {params: this.params}).then(success => {
      if (!success) {
        this._dialog.close(Error('[DialogNavigateError] Navigation canceled, most likely by a route guard.'));
      }
    });
  }

  /**
   * Performs navigation in the named outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, any>}): Promise<boolean> {
    path = Microfrontends.substituteNamedParameters(path, extras?.params);

    const outletCommands: Commands | null = (path !== null ? runInInjectionContext(this._injector, () => RouterUtils.pathToCommands(path!)) : null);
    const commands: Commands = [{outlets: {[this.outletName]: outletCommands}}];
    return this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'});
  }

  private createOutletInjector(): void {
    this.outletInjector = Injector.create({
      parent: this._injector,
      providers: [provideWorkbenchClientDialogHandle(this.capability, this.params),
        // Prevent injecting the dialog handle in host dialog component.
        {provide: WorkbenchDialog, useFactory: () => throwError(`[NullInjectorError] No provider for 'WorkbenchDialog'`)},
      ],
    });
  }

  private setDialogProperties(): void {
    this._dialog.size.width = this.capability.properties.size?.width;
    this._dialog.size.height = this.capability.properties.size?.height;
    this._dialog.size.minWidth = this.capability.properties.size?.minWidth;
    this._dialog.size.maxWidth = this.capability.properties.size?.maxWidth;
    this._dialog.size.minHeight = this.capability.properties.size?.minHeight;
    this._dialog.size.maxHeight = this.capability.properties.size?.maxHeight;

    this._dialog.title = Microfrontends.substituteNamedParameters(this.capability.properties.title, this.params);
    this._dialog.closable = this.capability.properties.closable ?? true;
    this._dialog.resizable = this.capability.properties.resizable ?? true;
    this._dialog.padding = this.capability.properties.padding ?? true;
  }

  public ngOnDestroy(): void {
    this.navigate(null).then(); // Remove the outlet from the URL
  }
}

/**
 * Provides the {WorkbenchDialog} handle to the routed component.
 */
export function provideWorkbenchClientDialogHandle(capability: WorkbenchDialogCapability, params: Map<string, unknown>): StaticProvider {
  return {
    provide: WorkbenchClientDialog,
    useFactory: (): WorkbenchClientDialog => {
      const dialog = inject(ɵWorkbenchDialog);

      return new class<R = unknown> implements WorkbenchClientDialog<R> {
        public readonly capability = capability;
        public readonly params = params;

        public setTitle(title: string | Observable<string>): void {
          dialog.title = title;
        }

        public close(result?: R | Error): void {
          dialog.close(result);
        }

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      };
    },
  };
}
