/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostBinding, Injector } from '@angular/core';
import { PopupConfig } from './popup.config';
import { ComponentPortal } from '@angular/cdk/portal';

/**
 * Displays the configured popup component in the popup overlay.
 *
 * The component is added to a viewport so that it scrolls when it exceeds the maximum allowed popup overlay size.
 * A focus trap is installed and the initial focus is set.
 */
@Component({
  selector: 'wb-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent {

  public portal: ComponentPortal<any>;

  @HostBinding('style.width')
  public get popupWidth(): string {
    return this._popupConfig.size?.width;
  }

  @HostBinding('style.min-width')
  public get popupMinWidth(): string {
    return this._popupConfig.size?.minWidth;
  }

  @HostBinding('style.max-width')
  public get popupMaxWidth(): string {
    return this._popupConfig.size?.maxWidth;
  }

  @HostBinding('style.height')
  public get popupHeight(): string {
    return this._popupConfig.size?.height;
  }

  @HostBinding('style.min-height')
  public get popupMinHeight(): string {
    return this._popupConfig.size?.minHeight;
  }

  @HostBinding('style.max-height')
  public get popupMaxHeight(): string {
    return this._popupConfig.size?.maxHeight;
  }

  constructor(private _popupConfig: PopupConfig, injector: Injector) {
    this.portal = new ComponentPortal(this._popupConfig.component, this._popupConfig.componentConstructOptions?.viewContainerRef || null, Injector.create({
      parent: injector,
      providers: [
        {provide: PopupConfig, useValue: undefined}, // Injector barrier for the popup config
      ],
    }), this._popupConfig.componentConstructOptions?.componentFactoryResolver || null);
  }
}
