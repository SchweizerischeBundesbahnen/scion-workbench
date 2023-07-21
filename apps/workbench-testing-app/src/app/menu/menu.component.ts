/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, HostListener, Inject, InjectionToken, OnInit} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {fromEvent} from 'rxjs';
import {MenuItem, MenuItemSeparator} from './menu-item';
import {KeyValuePipe, NgClass, NgFor, NgIf} from '@angular/common';
import {InstanceofPipe} from '../common/instanceof.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * DI token to provide menu items to the menu.
 */
export const MENU_ITEMS = new InjectionToken<Array<MenuItem | MenuItemSeparator>>('MENU_ITEMS');

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    KeyValuePipe,
    InstanceofPipe,
  ],
})
export class MenuComponent implements OnInit {

  public MenuItem = MenuItem;

  constructor(private _overlayRef: OverlayRef,
              private _destroyRef: DestroyRef,
              @Inject(MENU_ITEMS) public menuItems: Array<MenuItem | MenuItemSeparator>) {
  }

  public ngOnInit(): void {
    fromEvent(this._overlayRef.backdropElement!, 'mousedown')
      .pipe(takeUntilDestroyed(this._destroyRef))
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
}
