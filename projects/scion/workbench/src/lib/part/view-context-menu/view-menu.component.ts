/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, HostListener, OnInit} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {fromEvent, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkbenchMenuItem} from '../../workbench.model';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {AsyncPipe, KeyValuePipe, NgClass, NgFor} from '@angular/common';
import {PortalModule} from '@angular/cdk/portal';
import {WbFormatAcceleratorPipe} from './accelerator-format.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

declare type MenuItemGroups = Map<string, WorkbenchMenuItem[]>;

/**
 * Renders the menu items of a {@link WorkbenchView} grouped by their menu item group.
 */
@Component({
  selector: 'wb-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    AsyncPipe,
    KeyValuePipe,
    PortalModule,
    WbFormatAcceleratorPipe,
  ],
})
export class ViewMenuComponent implements OnInit {

  public menuItemGroups$: Observable<MenuItemGroups>;

  constructor(private _overlayRef: OverlayRef,
              private _destroyRef: DestroyRef,
              private _view: ɵWorkbenchView) {
    this.menuItemGroups$ = this._view.menuItems$.pipe(groupMenuItems());
  }

  public ngOnInit(): void {
    fromEvent(this._overlayRef.backdropElement!, 'mousedown')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.closeContextMenu());
  }

  public onMenuItemClick(menuItem: WorkbenchMenuItem): void {
    if (menuItem.isDisabled && menuItem.isDisabled()) {
      return;
    }
    menuItem.onAction();
    this.closeContextMenu();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.closeContextMenu();
  }

  private closeContextMenu(): void {
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
