/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, HostBinding, HostListener, inject, Injector, runInInjectionContext, Signal} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {WorkbenchMenuItem} from '../../workbench.model';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {KeyValuePipe, NgClass} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {WbFormatAcceleratorPipe} from './accelerator-format.pipe';
import {ViewId} from '../../view/workbench-view.model';
import {Maps} from '@scion/toolkit/util';
import {MenuItemComponent} from './menu-item/menu-item.component';

/**
 * Renders the menu items of a {@link WorkbenchView} grouped by their menu item group.
 */
@Component({
  selector: 'wb-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss'],
  imports: [
    NgClass,
    KeyValuePipe,
    PortalModule,
    WbFormatAcceleratorPipe,
    MenuItemComponent,

  ],
})
export class ViewMenuComponent {

  private readonly _overlayRef = inject(OverlayRef);
  private readonly _view = inject(ɵWorkbenchView);
  private readonly _injector = inject(Injector);

  protected readonly menuItemGroups: Signal<Map<string, WorkbenchMenuItem[]>>;

  constructor() {
    this.menuItemGroups = this.groupMenuItems();
  }

  protected onMenuItemClick(menuItem: WorkbenchMenuItem): void {
    if (menuItem.disabled) {
      return;
    }
    runInInjectionContext(this._injector, () => menuItem.onAction());
    this._overlayRef.dispose();
  }

  @HostBinding('attr.data-viewid')
  protected get viewId(): ViewId {
    return this._view.id;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this._overlayRef.dispose();
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('sci-microfrontend-focusin', ['$event'])
  protected onHostCloseEvent(event: Event): void {
    event.stopPropagation(); // Prevent closing this overlay if emitted from a child of this overlay.
  }

  @HostListener('document:mousedown')
  @HostListener('document:sci-microfrontend-focusin')
  protected onDocumentCloseEvent(): void {
    this._overlayRef.dispose();
  }

  private groupMenuItems(): Signal<Map<string, WorkbenchMenuItem[]>> {
    return computed(() => this._view.menuItems().reduce((groups, menuItem) => {
      return Maps.addListValue(groups, menuItem.group ?? 'default', menuItem);
    }, new Map<string, WorkbenchMenuItem[]>()));
  }
}
