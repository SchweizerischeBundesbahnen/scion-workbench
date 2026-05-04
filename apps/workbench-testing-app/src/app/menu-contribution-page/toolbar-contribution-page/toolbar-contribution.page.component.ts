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
import {contributeMenu, SciToolbarComponent, SciToolbarFactory} from '@scion/sci-components/menu';
import {ActivatedRoute} from '@angular/router';
import {SciToolbarGroupDescriptor, SciToolbarItemDescriptor, SciToolbarMenuDescriptor, ToolbarContributionComponent} from './toolbar-contribution/toolbar-contribution.component';
import {addMenu} from '../menu-contribution-page/menu-contribution-internal.page.component';

@Component({
  selector: 'app-toolbar-contribution-page',
  templateUrl: './toolbar-contribution.page.component.html',
  styleUrls: ['./toolbar-contribution.page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciToolbarComponent,
    ToolbarContributionComponent,
  ],
})
export class ToolbarContributionPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _injector = inject(Injector);

  protected readonly route = inject(ActivatedRoute);

  protected readonly form = this._formBuilder.group({
    location: this._formBuilder.control('toolbar:testee'),
    toolbarItems: this._formBuilder.control<Array<SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor>>([]),
  });

  protected onContributeToolbar(): void {
    const location = this.form.controls.location.value;
    const toolbarItems = this.form.controls.toolbarItems.value;

    runInInjectionContext(this._injector, () => {
      contributeMenu(location as `toolbar:${string}`, toolbar => toolbarItems.forEach(item => addToolbarItem(toolbar, item)));
    });

    function addToolbarItem(toolbar: SciToolbarFactory, item: SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor): void {
      switch (item.type) {
        case 'menuitem':
          toolbar.addToolbarItem({
            name: item.name,
            icon: item.icon,
            onSelect: () => {
            },
          });
          return;
        case 'menu':
          toolbar.addMenu({
            name: item.name,
            icon: item.icon,
            label: item.label ?? '',
          }, menu => (item.children ?? []).forEach(child => addMenu(menu, child)));
          return;
        case 'group':
          toolbar.addGroup({
            name: item.name,
          }, toolbar => (item.children ?? []).forEach(child => addToolbarItem(toolbar, child)));
          return;
      }
    }
  }
}
