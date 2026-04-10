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
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {MenuContributionComponent, SciMenuDescriptor, SciMenuGroupDescriptor, SciMenuItemDescriptor} from '../../menu-contribution-page/menu-contribution/menu-contribution.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-toolbar-contribution',
  templateUrl: './toolbar-contribution.component.html',
  styleUrls: ['./toolbar-contribution.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    MenuContributionComponent,
    SciCheckboxComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ToolbarContributionComponent)},
  ],
})
export class ToolbarContributionComponent implements ControlValueAccessor {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    toolbarItems: this._formBuilder.array<FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>>([]),
  });
  private _cvaChangeFn: (value: Array<SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor>) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.toolbarItems.controls.map(formGroup => {
          switch (formGroup.controls.type.value) {
            case 'menuitem':
              const toolbarItemFormGroup = formGroup as FormGroup<SciToolbarItemFormGroup>;
              return ({
                type: toolbarItemFormGroup.controls.type.value,
                name: toolbarItemFormGroup.controls.name.value,
                icon: toolbarItemFormGroup.controls.icon.value,
              });
            case 'menu':
              const menuFormGroup = formGroup as FormGroup<SciToolbarMenuFormGroup>;
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
              const menuGroupFormGroup = formGroup as FormGroup<SciToolbarGroupFormGroup>;
              return ({
                type: menuGroupFormGroup.controls.type.value,
                name: menuGroupFormGroup.controls.name.value,
                cssClass: menuGroupFormGroup.controls.cssClass.value,
                disabled: menuGroupFormGroup.controls.disabled.value,
                children: menuGroupFormGroup.controls.children.value,
              });
          }
        }));
        this._cvaTouchedFn();
      });
  }

  protected onAddToolbarItem(): void {
    this.addToolbarItem({
      type: 'menuitem',
      name: undefined,
      icon: '',
    });
  }

  protected onAddMenu(): void {
    this.addToolbarItem({
      type: 'menu',
      name: undefined,
      icon: undefined,
      label: '',
      children: [],
    });
  }

  protected onAddGroup(): void {
    this.addToolbarItem({
      type: 'group',
      name: undefined,
      children: [],
    });
  }

  protected onRemoveToolbarItem(index: number): void {
    this.form.controls.toolbarItems.removeAt(index);
  }

  private addToolbarItem(item: SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor, options?: {emitEvent?: boolean}): void {
    switch (item.type) {
      case 'menuitem':
        const toolbarItemFormGroup = this._formBuilder.group({
          type: this._formBuilder.control<'menuitem'>('menuitem'),
          name: this._formBuilder.control<`menuitem:${string}` | undefined>(item.name, Validators.required),
          icon: this._formBuilder.control<string | undefined>(item.icon, Validators.required),
        }) as FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>;
        this.form.controls.toolbarItems.push(toolbarItemFormGroup, {emitEvent: options?.emitEvent ?? true});
        return;
      case 'menu':
        const toolbarMenuFormGroup = this._formBuilder.group({
          type: this._formBuilder.control<'menu'>('menu'),
          name: this._formBuilder.control<`menu:${string}` | undefined>(item.name, Validators.required),
          label: this._formBuilder.control<string>(item.label, Validators.required),
          icon: this._formBuilder.control<string | undefined>(item.icon, Validators.required),
          tooltip: this._formBuilder.control<string | undefined>(item.tooltip),
          cssClass: this._formBuilder.control<string | string[] | undefined>(item.cssClass),
          disabled: this._formBuilder.control<boolean | undefined>(item.disabled),
          children: this._formBuilder.control(item.children ?? []),
        }) as FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>;
        this.form.controls.toolbarItems.push(toolbarMenuFormGroup, {emitEvent: options?.emitEvent ?? true});
        return;
      case 'group':
        const toolbarGroupFormGroup = this._formBuilder.group({
          type: this._formBuilder.control<'group'>('group'),
          name: this._formBuilder.control<`toolbar:${string}` | undefined>(item.name, Validators.required),
          cssClass: this._formBuilder.control<string | string[] | undefined>(item.cssClass),
          disabled: this._formBuilder.control<boolean | undefined>(item.disabled),
          children: this._formBuilder.control(item.children ?? []),
        }) as FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>;
        this.form.controls.toolbarItems.push(toolbarGroupFormGroup, {emitEvent: options?.emitEvent ?? true});
        return;
    }
  }

  protected asToolbarItemFormGroup(formGroup: FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>): FormGroup<SciToolbarItemFormGroup> {
    return formGroup as FormGroup<SciToolbarItemFormGroup>;
  }

  protected asToolbarMenuFormGroup(formGroup: FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>): FormGroup<SciToolbarMenuFormGroup> {
    return formGroup as FormGroup<SciToolbarMenuFormGroup>;
  }

  protected asToolbarGroupFormGroup(formGroup: FormGroup<SciToolbarItemFormGroup | SciToolbarMenuFormGroup | SciToolbarGroupFormGroup>): FormGroup<SciToolbarGroupFormGroup> {
    return formGroup as FormGroup<SciToolbarGroupFormGroup>;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(items: Array<SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor> | undefined | null): void {
    this.form.controls.toolbarItems.clear({emitEvent: false});
    items?.forEach(item => this.addToolbarItem(item, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: Array<SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor>) => void): void {
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
    return this.form.controls.toolbarItems.valid ? null : {valid: false};
  }
}

export interface SciToolbarItemDescriptor {
  type: 'menuitem';
  name?: `menuitem:${string}`;
  icon: string;
  // label?: Translatable;
  // checked?: boolean;
  // tooltip?: Translatable;
  // accelerator?: string[];
  // disabled?: boolean;
  // cssClass?: string | string[];
  // onSelect: () => void;
}

export interface SciToolbarItemFormGroup {
  type: FormControl<'menuitem'>;
  name: FormControl<`menuitem:${string}` | undefined>;
  icon: FormControl<string>;
  // label: FormControl<string>;
  // tooltip: FormControl<string>;
  // accelerator: FormControl<string[] | undefined>;
  // cssClass: FormControl<string | string[] | undefined>;
  // checked: FormControl<boolean | undefined>;
  // disabled: FormControl<boolean | undefined>;
}

export interface SciToolbarMenuDescriptor {
  type: 'menu';
  name?: `menu:${string}`;
  label: string;
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
  cssClass?: string | string[];
  // visualMenuHint
  // menu todo
  children?: Array<SciMenuDescriptor | SciMenuItemDescriptor | SciMenuGroupDescriptor>;
}

export interface SciToolbarMenuFormGroup {
  type: FormControl<'menu'>;
  name: FormControl<`menu:${string}` | undefined>;
  label: FormControl<string>;
  icon: FormControl<string | undefined>;
  tooltip: FormControl<string | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
  disabled: FormControl<boolean | undefined>;
  children: FormControl<Array<SciMenuItemDescriptor | SciMenuDescriptor | SciMenuGroupDescriptor>>
}

export interface SciToolbarGroupDescriptor {
  type: 'group';
  name?: `toolbar:${string}`;
  cssClass?: string | string[];
  disabled?: boolean;
  children?: Array<SciToolbarItemDescriptor | SciMenuDescriptor | SciToolbarGroupDescriptor>;
}

export interface SciToolbarGroupFormGroup {
  type: FormControl<'group'>;
  name: FormControl<`toolbar:${string}` | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
  disabled: FormControl<boolean | undefined>;
  children: FormControl<Array<SciToolbarItemDescriptor | SciToolbarMenuDescriptor | SciToolbarGroupDescriptor>>
}
