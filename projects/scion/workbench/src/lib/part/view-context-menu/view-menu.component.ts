/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, HostListener} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkbenchMenuItem} from '../../workbench.model';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {AsyncPipe, KeyValuePipe, NgClass, NgFor, NgIf} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {WbFormatAcceleratorPipe} from './accelerator-format.pipe';
import {MapCoercePipe} from '../../common/map-coerce.pipe';

type MenuItemGroups = Map<string, WorkbenchMenuItem[]>;

/**
 * Renders the menu items of a {@link WorkbenchView} grouped by their menu item group.
 */
@Component({
  selector: 'wb-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    KeyValuePipe,
    PortalModule,
    WbFormatAcceleratorPipe,
    MapCoercePipe,
  ],
})
export class ViewMenuComponent {

  public menuItemGroups$: Observable<MenuItemGroups>;

  constructor(private _overlayRef: OverlayRef,
              private _view: ɵWorkbenchView) {
    this.menuItemGroups$ = this._view.menuItems$.pipe(groupMenuItems());
  }

  public onMenuItemClick(menuItem: WorkbenchMenuItem): void {
    if (menuItem.isDisabled?.()) {
      return;
    }
    menuItem.onAction();
    this._overlayRef.dispose();
  }

  @HostBinding('attr.data-viewid')
  public get viewId(): string {
    return this._view.id;
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this._overlayRef.dispose();
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('sci-microfrontend-focusin', ['$event'])
  public onHostCloseEvent(event: Event): void {
    event.stopPropagation(); // Prevent closing this overlay if emitted from a child of this overlay.
  }

  @HostListener('document:mousedown')
  @HostListener('document:sci-microfrontend-focusin')
  public onDocumentCloseEvent(): void {
    this._overlayRef.dispose();
  }
}

function groupMenuItems(): OperatorFunction<WorkbenchMenuItem[], MenuItemGroups> {
  return map((menuItems: WorkbenchMenuItem[]): MenuItemGroups => {
    return menuItems.reduce((groups: MenuItemGroups, menuItem: WorkbenchMenuItem) => {
      const groupName = menuItem.group || 'default';
      return groups.set(groupName, (groups.get(groupName) || []).concat(menuItem));
    }, new Map<string, WorkbenchMenuItem[]>());
  });
}
