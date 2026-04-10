/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, inject} from '@angular/core';
import {noop} from 'rxjs';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {MultiValueInputComponent} from 'workbench-testing-app-common';
import {contributeMenu} from '@scion/sci-components/menu';
import {UUID} from '@scion/toolkit/uuid';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-menu-contribution',
  templateUrl: './menu-contribution.component.html',
  styleUrls: ['./menu-contribution.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciCheckboxComponent,
    MultiValueInputComponent,
    SciMaterialIconDirective,

  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => MenuContributionComponent)},
  ],
})
export class MenuContributionComponent implements ControlValueAccessor {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly context = new Map().set('id', UUID.randomUUID());
  protected readonly form = this._formBuilder.group({
    menuItems: this._formBuilder.array<FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>>([]),
  });

  private _cvaChangeFn: (value: Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor>) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    contributeMenu('toolbar:test-page', toolbar => toolbar
      .addMenu('add', menu => menu
        .addMenuItem({label: 'Menu Item', onSelect: () => this.onAddMenuItem(), cssClass: 'e2e-add-menu-item'})
        .addMenuItem({label: 'Menu', onSelect: () => this.onAddMenu(), cssClass: 'e2e-add-menu'})
        .addMenuItem({label: 'Group', onSelect: () => this.onAddGroup(), cssClass: 'e2e-add-group'}),
      ), {requiredContext: this.context});

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.menuItems.controls.map(formGroup => {
          switch (formGroup.controls.type.value) {
            case 'menuitem':
              const menuItemGroup = formGroup as FormGroup<SciMenuItemFormGroup>;
              return ({
                type: menuItemGroup.controls.type.value,
                name: menuItemGroup.controls.name.value,
                icon: menuItemGroup.controls.icon.value,
                label: menuItemGroup.controls.label.value,
                tooltip: menuItemGroup.controls.tooltip.value,
                accelerator: menuItemGroup.controls.accelerator.value,
                cssClass: menuItemGroup.controls.cssClass.value,
                checked: menuItemGroup.controls.checked.value,
                disabled: menuItemGroup.controls.disabled.value,
              });
            case 'menu':
              const menuFormGroup = formGroup as FormGroup<SciMenuFormGroup>;
              return ({
                type: menuFormGroup.controls.type.value,
                name: menuFormGroup.controls.name.value,
                label: menuFormGroup.controls.label.value,
                icon: menuFormGroup.controls.icon.value,
                tooltip: menuFormGroup.controls.tooltip.value,
                cssClass: menuFormGroup.controls.cssClass.value,
                disabled: menuFormGroup.controls.disabled.value,
                children: menuFormGroup.controls.children.value,
              });
            case 'group':
              const menuGroupFormGroup = formGroup as FormGroup<SciMenuGroupFormGroup>;
              return ({
                type: menuGroupFormGroup.controls.type.value,
                name: menuGroupFormGroup.controls.name.value,
                label: menuGroupFormGroup.controls.label.value,
                cssClass: menuGroupFormGroup.controls.cssClass.value,
                disabled: menuGroupFormGroup.controls.disabled.value,
                children: menuGroupFormGroup.controls.children.value,
              });
          }
        }));
        this._cvaTouchedFn();
      });
  }

  protected onAddMenuItem(): void {
    this.addMenuItem({
      type: 'menuitem',
      name: undefined,
      icon: undefined,
      label: '',
    });
  }

  protected onAddMenu(): void {
    this.addMenuItem({
      type: 'menu',
      name: undefined,
      icon: undefined,
      label: '',
      children: [],
    });
  }

  protected onAddGroup(): void {
    this.addMenuItem({
      type: 'group',
      name: undefined,
      label: '',
      children: [],
    });
  }

  protected onRemoveMenuItem(index: number): void {
    this.form.controls.menuItems.removeAt(index);
  }

  private addMenuItem(item: SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor, options?: {emitEvent?: boolean}): void {
    switch (item.type) {
      case 'menuitem':
        const menuItemFormGroup = this._formBuilder.group({
          type: this._formBuilder.control<'menuitem'>('menuitem'),
          name: this._formBuilder.control<`menuitem:${string}` | undefined>(item.name, Validators.required),
          label: this._formBuilder.control<string>(item.label, Validators.required),
          icon: this._formBuilder.control<string | undefined>(item.icon, Validators.required),
          tooltip: this._formBuilder.control<string | undefined>(item.tooltip),
          accelerator: this._formBuilder.control<string[] | undefined>(item.accelerator),
          cssClass: this._formBuilder.control<string | string[] | undefined>(item.cssClass),
          checked: this._formBuilder.control<boolean | undefined>(item.checked),
          disabled: this._formBuilder.control<boolean | undefined>(item.disabled),
        }) as FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>;
        this.form.controls.menuItems.push(menuItemFormGroup, {emitEvent: options?.emitEvent ?? true});
        return;
      case 'menu':
        const menuFormGroup = this._formBuilder.group({
          type: this._formBuilder.control<'menu'>('menu'),
          name: this._formBuilder.control<`menu:${string}` | undefined>(item.name, Validators.required),
          label: this._formBuilder.control<string>(item.label, Validators.required),
          icon: this._formBuilder.control<string | undefined>(item.icon, Validators.required),
          tooltip: this._formBuilder.control<string | undefined>(item.tooltip),
          cssClass: this._formBuilder.control<string | string[] | undefined>(item.cssClass),
          disabled: this._formBuilder.control<boolean | undefined>(item.disabled),
          children: this._formBuilder.control(item.children ?? []),
        }) as FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>;
        this.form.controls.menuItems.push(menuFormGroup, {emitEvent: options?.emitEvent ?? true});
        return;
      case 'group':
        const menuGroupFormGroup = this._formBuilder.group({
          type: this._formBuilder.control<'group'>('group'),
          name: this._formBuilder.control<`menu:${string}` | undefined>(item.name, Validators.required),
          label: this._formBuilder.control<string>(item.label, Validators.required),
          cssClass: this._formBuilder.control<string | string[] | undefined>(item.cssClass),
          disabled: this._formBuilder.control<boolean | undefined>(item.disabled),
          children: this._formBuilder.control(item.children ?? []),
        }) as FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>;
        this.form.controls.menuItems.push(menuGroupFormGroup, {emitEvent: options?.emitEvent ?? true});
        return;
    }
  }

  protected asMenuItemFormGroup(menuItemFormGroup: FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>): FormGroup<SciMenuItemFormGroup> {
    return menuItemFormGroup as FormGroup<SciMenuItemFormGroup>;
  }

  protected asMenuFormGroup(menuItemFormGroup: FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>): FormGroup<SciMenuFormGroup> {
    return menuItemFormGroup as FormGroup<SciMenuFormGroup>;
  }

  protected asMenuGroupFormGroup(menuItemFormGroup: FormGroup<SciMenuItemFormGroup | SciMenuFormGroup | SciMenuGroupFormGroup>): FormGroup<SciMenuGroupFormGroup> {
    return menuItemFormGroup as FormGroup<SciMenuGroupFormGroup>;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(items: Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor> | undefined | null): void {
    this.form.controls.menuItems.clear({emitEvent: false});
    items?.forEach(item => this.addMenuItem(item, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor>) => void): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: () => void): void {
    this._cvaTouchedFn = fn;
  }

  /**
   * Method implemented as part of `Validator` to work with Angular forms API
   * @docs-private
   */
  public validate(control: AbstractControl): ValidationErrors | null {
    return this.form.controls.menuItems.valid ? null : {valid: false};
  }
}

export interface SciMenuItemDescriptor {
  type: 'menuitem';
  name?: `menuitem:${string}`;
  icon?: string;
  label: string;
  tooltip?: string;
  accelerator?: string[];
  cssClass?: string | string[];
  checked?: boolean;
  disabled?: boolean;
  // actions todo
  // onSelect: () => void;
}

export interface SciMenuItemFormGroup {
  type: FormControl<'menuitem'>;
  name: FormControl<`menuitem:${string}` | undefined>;
  label: FormControl<string>;
  icon: FormControl<string | undefined>;
  tooltip: FormControl<string>;
  accelerator: FormControl<string[] | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
  checked: FormControl<boolean | undefined>;
  disabled: FormControl<boolean | undefined>;
}

export interface SciMenuDescriptor {
  type: 'menu';
  name?: `menu:${string}`;
  label: string;
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
  cssClass?: string | string[];
  // menu todo
  children?: Array<SciMenuDescriptor | SciMenuItemDescriptor | SciMenuGroupDescriptor>;
}

export interface SciMenuFormGroup {
  type: FormControl<'menu'>;
  name: FormControl<`menu:${string}` | undefined>;
  label: FormControl<string>;
  icon: FormControl<string | undefined>;
  tooltip: FormControl<string | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
  disabled: FormControl<boolean | undefined>;
  children: FormControl<Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor>>
}

export interface SciMenuGroupDescriptor {
  type: 'group';
  name?: `menu:${string}`;
  label: string;
  // collapsible todo
  cssClass?: string | string[];
  disabled?: boolean;
  children?: Array<SciMenuDescriptor | SciMenuItemDescriptor | SciMenuGroupDescriptor>;
}

export interface SciMenuGroupFormGroup {
  type: FormControl<'group'>;
  name: FormControl<`menu:${string}` | undefined>;
  label: FormControl<string>;
  cssClass: FormControl<string | string[] | undefined>;
  disabled: FormControl<boolean | undefined>;
  children: FormControl<Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor>>
}
