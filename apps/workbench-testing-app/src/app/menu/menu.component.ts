/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, HostListener, inject, InjectionToken, Injector, OnInit, runInInjectionContext} from '@angular/core';
import {OverlayRef} from '@angular/cdk/overlay';
import {fromEvent} from 'rxjs';
import {MenuAction, MenuItem, MenuItemSeparator} from './menu-item';
import {InstanceofPipe} from '../common/instanceof.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {AttributesDirective} from '../common/attributes.directive';

/**
 * DI token to provide menu items to the menu.
 */
export const MENU_ITEMS = new InjectionToken<Array<MenuItem | MenuItemSeparator>>('MENU_ITEMS');

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    InstanceofPipe,
    SciMaterialIconDirective,
    AttributesDirective,
  ],
})
export class MenuComponent implements OnInit {

  private readonly _overlayRef = inject(OverlayRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _injector = inject(Injector);

  protected readonly menuItems = inject(MENU_ITEMS);
  protected readonly MenuItem = MenuItem;
  protected readonly MenuItemSeparator = MenuItemSeparator;

  public ngOnInit(): void {
    // Run in `ngOnInit` because the backdrop element is not available until initial change detection.
    fromEvent(this._overlayRef.backdropElement!, 'mousedown')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.closeMenu());
  }

  protected onMenuItemClick(menuItem: MenuItem): void {
    if (menuItem.disabled) {
      return;
    }

    runInInjectionContext(this._injector, () => void menuItem.onAction());
    this.closeMenu();
  }

  protected onMenuItemActionClick(action: MenuAction, event: Event): void {
    runInInjectionContext(this._injector, () => void action.onAction());
    event.stopPropagation();
    this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  private closeMenu(): void {
    this._overlayRef.dispose();
  }
}
