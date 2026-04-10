/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, runInInjectionContext} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {contributeMenu, SciMenuFactory, SciMenuService} from '@scion/sci-components/menu';
import {ActivatedRoute} from '@angular/router';
import {MenuContributionComponent, SciMenuDescriptor, SciMenuGroupDescriptor, SciMenuItemDescriptor} from './menu-contribution/menu-contribution.component';

@Component({
  selector: 'app-menu-contribution-internal-page',
  templateUrl: './menu-contribution-internal.page.component.html',
  styleUrls: ['./menu-contribution-internal.page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    MenuContributionComponent,
  ],
})
export class MenuContributionInternalPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _menuService = inject(SciMenuService);
  private readonly _injector = inject(Injector);

  protected readonly route = inject(ActivatedRoute);

  protected readonly form = this._formBuilder.group({
    location: this._formBuilder.control('menu:testee'),
    menuItems: this._formBuilder.control<Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor>>([]),
    // menus: this._formBuilder.control<SciToolbarItemDescriptor[]>([]),
    // groups: this._formBuilder.control<SciToolbarItemDescriptor[]>([]),
  });

  protected onContributeMenu(): void {
    const location = this.form.controls.location.value;
    const menuItems = this.form.controls.menuItems.value;

    runInInjectionContext(this._injector, () => {
      contributeMenu(location as `menu:${string}`, menu => menuItems.forEach(menuItem => addMenu(menu, menuItem)));
    });
  }

  protected onContextMenuOpen(event: MouseEvent): void {
    this._menuService.open('menu:testee', {
      anchor: event,
    });
  }
}

export function addMenu(menu: SciMenuFactory, item: SciMenuDescriptor | SciMenuItemDescriptor | SciMenuGroupDescriptor): void {
  switch (item.type) {
    case 'menuitem':
      menu.addMenuItem({
        name: item.name,
        icon: item.icon,
        label: item.label ?? '',
        onSelect: () => {
        },
      });
      return;
    case 'menu':
      menu.addMenu({
        name: item.name,
        icon: item.icon,
        label: item.label ?? '',
      }, menu => {
        for (const child of item.children ?? []) {
          addMenu(menu, child);
        }
      });
      return;
    case 'group':
      menu.addGroup({
        name: item.name,
        label: item.label ?? '',
      }, menu => {
        for (const child of item.children ?? []) {
          addMenu(menu, child);
        }
      });
      return;
  }
}
