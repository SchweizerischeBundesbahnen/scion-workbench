/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {PreferredSizeService} from '@scion/microfrontend-platform';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';

/**
 * Popup test component which can grow and shrink.
 */
@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.scss'],
})
export class PopupPageComponent {

  public uuid = UUID.randomUUID();

  @HostBinding('style.width')
  public width: string;

  @HostBinding('style.height')
  public height: string;

  @HostBinding('style.min-height')
  public minHeight: string;

  @HostBinding('style.max-height')
  public maxHeight: string;

  /**
   * Since the component is positioned absolutely, we set its 'minWidth' to '100VW'
   * so that it can fill the available space horizontally if the popup overlay defines
   * a fixed width.
   */
  @HostBinding('style.min-width')
  public minWidth = '100vw';

  @HostBinding('style.max-width')
  public maxWidth: string;

  public result: string;

  constructor(host: ElementRef<HTMLElement>,
              public route: ActivatedRoute,
              public popup: WorkbenchPopup) {
    // Use the size of this component as the popup size.
    Beans.get(PreferredSizeService).fromDimension(host.nativeElement);

    const configuredPopupSize = popup.capability.properties.size;
    this.width = configuredPopupSize?.width ?? 'max-content';
    this.height = configuredPopupSize?.height ?? 'max-content';
  }

  public onClose(): void {
    this.popup.close(this.result);
  }

  public onCloseWithError(): void {
    this.popup.closeWithError(this.result);
  }
}
