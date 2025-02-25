/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, ElementRef, inject, Injector, Input, OnInit, runInInjectionContext, StaticProvider} from '@angular/core';
import {WorkbenchMessageBox, WorkbenchMessageBoxCapability} from '@scion/workbench-client';
import {Routing} from '../../routing/routing.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {MESSAGE_BOX_ID_PREFIX} from '../../workbench.constants';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog';
import {Microfrontends} from '../common/microfrontend.util';
import {ANGULAR_ROUTER_MUTEX} from '../../executor/single-task-executor';
import {setStyle} from '../../common/dom.util';

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
export class MicrofrontendHostMessageBoxComponent implements OnInit {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _dialog = inject(ɵWorkbenchDialog);
  private readonly _injector = inject(Injector);
  private readonly _router = inject(Router);
  /** Mutex to serialize Angular Router navigation requests, preventing the cancellation of previously initiated asynchronous navigations. */
  private readonly _angularRouterMutex = inject(ANGULAR_ROUTER_MUTEX);

  protected readonly outletName = MESSAGE_BOX_ID_PREFIX.concat(UUID.randomUUID());

  protected outletInjector!: Injector;

  @Input({required: true})
  public capability!: WorkbenchMessageBoxCapability;

  @Input({required: true})
  public params!: Map<string, unknown>;

  constructor() {
    inject(DestroyRef).onDestroy(() => void this.navigate(null)); // Remove the outlet from the URL
  }

  public ngOnInit(): void {
    this.setSizeProperties();
    this.createOutletInjector();
    void this.navigate(this.capability.properties.path, {params: this.params}).then(success => {
      if (!success) {
        this._dialog.close(Error('[MessageBoxNavigateError] Navigation canceled, most likely by a route guard or a parallel navigation.'));
      }
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
    this.outletInjector = Injector.create({
      parent: this._injector,
      providers: [provideWorkbenchClientMessageBoxHandle(this.capability, this.params)],
    });
  }

  private setSizeProperties(): void {
    setStyle(this._host, {
      'width': this.capability.properties.size?.width ?? null,
      'min-width': this.capability.properties.size?.minWidth ?? null,
      'max-width': this.capability.properties.size?.maxWidth ?? null,
      'height': this.capability.properties.size?.height ?? null,
      'min-height': this.capability.properties.size?.minHeight ?? null,
      'max-height': this.capability.properties.size?.maxHeight ?? null,
    });
  }
}

/**
 * Provides the {WorkbenchMessageBox} handle to the routed component.
 */
export function provideWorkbenchClientMessageBoxHandle(capability: WorkbenchMessageBoxCapability, params: Map<string, unknown>): StaticProvider {
  return {
    provide: WorkbenchMessageBox,
    useFactory: (): WorkbenchMessageBox => {

      return new class implements WorkbenchMessageBox {
        public readonly capability = capability;
        public readonly params = params;

        public signalReady(): void {
          // nothing to do since not an iframe-based microfrontend
        }
      }();
    },
  };
}
