/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostListener, Inject, InjectionToken, OnDestroy, OnInit} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MenuItem, MenuItemSeparator} from './menu-item';
import {KeyValuePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {InstanceofPipe} from '../util/instanceof.pipe';

/**
 * DI token to provide menu items to the menu.
 */
export const MENU_ITEMS = new InjectionToken<Array<MenuItem | MenuItemSeparator>>('MENU_ITEMS');

@Component({
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    KeyValuePipe,
    InstanceofPipe,
  ],
})
export class MenuComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  public MenuItem = MenuItem;

  constructor(private _overlayRef: OverlayRef, @Inject(MENU_ITEMS) public menuItems: Array<MenuItem | MenuItemSeparator>) {
  }

  public ngOnInit(): void {
    fromEvent(this._overlayRef.backdropElement!, 'mousedown')
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.closeMenu());
  }

  public onMenuItemClick(menuItem: MenuItem): void {
    if (menuItem.disabled) {
      return;
    }
    menuItem.onAction();
    this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    this.closeMenu();
  }

  private closeMenu(): void {
    this._overlayRef.dispose();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
