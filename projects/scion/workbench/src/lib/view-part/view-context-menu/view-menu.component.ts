/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { fromEvent, Observable, OperatorFunction, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { WorkbenchMenuItem } from '../../workbench.model';
import { ɵWorkbenchView } from '../../view/ɵworkbench-view.model';

declare type MenuItemGroups = Map<string, WorkbenchMenuItem[]>;

/**
 * Renders the menu items of a {@link WorkbenchView} grouped by their menu item group.
 */
@Component({
  selector: 'wb-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss'],
})
export class ViewMenuComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  public menuItemGroups$: Observable<MenuItemGroups>;

  constructor(private _overlayRef: OverlayRef, private _view: ɵWorkbenchView) {
    this.menuItemGroups$ = this._view.menuItems$.pipe(groupMenuItems());
  }

  public ngOnInit(): void {
    fromEvent(this._overlayRef.backdropElement, 'mousedown')
      .pipe(takeUntil(this._destroy$))
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

  public ngOnDestroy(): void {
    this._destroy$.next();
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
