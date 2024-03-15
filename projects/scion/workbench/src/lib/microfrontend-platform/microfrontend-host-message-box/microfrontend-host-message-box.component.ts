/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Injector, Input, OnDestroy, OnInit, StaticProvider} from '@angular/core';
import {WorkbenchMessageBox, WorkbenchMessageBoxCapability} from '@scion/workbench-client';
import {RouterUtils} from '../../routing/router.util';
import {Commands} from '../../routing/routing.model';
import {Router, RouterOutlet} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {MESSAGE_BOX_ID_PREFIX} from '../../workbench.constants';
import {NamedParameters} from '../common/named-parameters.util';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog';

/**
 * Navigates to the microfrontend of a given {@link WorkbenchMessageBoxCapability} via {@link Router}. The content is displayed inside a workbench message box.
 *
 * Unlike {@link MicrofrontendMessageBoxComponent}, this component uses a `<router-outlet>` instead of a `<sci-router-outlet>`
 * to allow direct integration of the content provided by the workbench host application via the Angular router.
 */
@Component({
  selector: 'wb-microfrontend-host-message-box',
  styleUrls: ['./microfrontend-host-message-box.component.scss'],
  templateUrl: './microfrontend-host-message-box.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    NgTemplateOutlet,
  ],
})
export class MicrofrontendHostMessageBoxComponent implements OnDestroy, OnInit {

  @Input({required: true})
  public capability!: WorkbenchMessageBoxCapability;

  @Input({required: true})
  public params!: Map<string, unknown>;

  public outletName: string;
  public outletInjector!: Injector;

  constructor(private _dialog: ɵWorkbenchDialog,
              private _injector: Injector,
              private _router: Router) {
    this.outletName = MESSAGE_BOX_ID_PREFIX.concat(UUID.randomUUID());
  }

  public ngOnInit(): void {
    this.createOutletInjector();
    this.navigate(this.capability.properties.path, {params: this.params}).then(success => {
      if (!success) {
        this._dialog.close(Error('[MessageBoxNavigateError] Navigation canceled, most likely by a route guard.'));
      }
    });
  }

  /**
   * Performs navigation in the named outlet, substituting path params if any. To clear navigation, pass `null` as the path.
   */
  private navigate(path: string | null, extras?: {params?: Map<string, any>}): Promise<boolean> {
    path = NamedParameters.substitute(path, extras?.params);

    const outletCommands: Commands | null = (path !== null ? RouterUtils.segmentsToCommands(RouterUtils.parsePath(this._router, path)) : null);
    const commands: Commands = [{outlets: {[this.outletName]: outletCommands}}];
    return this._router.navigate(commands, {skipLocationChange: true, queryParamsHandling: 'preserve'});
  }

  private createOutletInjector(): void {
    this.outletInjector = Injector.create({
      parent: this._injector,
      providers: [provideWorkbenchClientMessageBoxHandle(this.capability, this.params),
      ],
    });
  }

  public ngOnDestroy(): void {
    this.navigate(null).then(); // Remove the outlet from the URL
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
      };
    },
  };
}
