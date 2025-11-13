import * as i0 from '@angular/core';
import { input, inject, ElementRef, HostBinding, Component } from '@angular/core';
import * as i1 from '@angular/forms';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Maps } from '@scion/toolkit/util';
import { UUID } from '@scion/toolkit/uuid';
import { SciMaterialIconDirective } from '@scion/components.internal/material-icon';

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Allows entering key-value pairs.
 */
class SciKeyValueFieldComponent {
    keyValueFormArray = input.required(...(ngDevMode ? [{ debugName: "keyValueFormArray" }] : []));
    title = input(...(ngDevMode ? [undefined, { debugName: "title" }] : []));
    removable = input(false, ...(ngDevMode ? [{ debugName: "removable" }] : []));
    addable = input(false, ...(ngDevMode ? [{ debugName: "addable" }] : []));
    _formBuilder = inject(NonNullableFormBuilder);
    _host = inject(ElementRef).nativeElement;
    id = UUID.randomUUID();
    tabindex = -1;
    get isRemovable() {
        return this.removable();
    }
    get isAddable() {
        return this.addable();
    }
    onRemove(index) {
        this.keyValueFormArray().removeAt(index);
        // Focus the component to not lose the focus when the remove button is removed from the DOM.
        // Otherwise, if used in a popup, the popup would be closed because no element is focused anymore.
        this._host.focus({ preventScroll: true });
    }
    onAdd() {
        this.keyValueFormArray().push(this._formBuilder.group({
            key: this._formBuilder.control(''),
            value: this._formBuilder.control(''),
        }));
    }
    onClear() {
        this.keyValueFormArray().clear();
    }
    static toDictionary(formArray, returnNullIfEmpty = true) {
        const dictionary = {};
        formArray.controls.forEach(formGroup => {
            const key = formGroup.controls.key.value;
            dictionary[key] = formGroup.controls.value.value;
        });
        if (!Object.keys(dictionary).length && returnNullIfEmpty) {
            return null;
        }
        return dictionary;
    }
    static toMap(formArray, returnNullIfEmpty = true) {
        return Maps.coerce(SciKeyValueFieldComponent.toDictionary(formArray, returnNullIfEmpty), { coerceNullOrUndefined: false }) ?? null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciKeyValueFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.0-rc.1", type: SciKeyValueFieldComponent, isStandalone: true, selector: "sci-key-value-field", inputs: { keyValueFormArray: { classPropertyName: "keyValueFormArray", publicName: "keyValueFormArray", isSignal: true, isRequired: true, transformFunction: null }, title: { classPropertyName: "title", publicName: "title", isSignal: true, isRequired: false, transformFunction: null }, removable: { classPropertyName: "removable", publicName: "removable", isSignal: true, isRequired: false, transformFunction: null }, addable: { classPropertyName: "addable", publicName: "addable", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "attr.tabindex": "this.tabindex", "class.removable": "this.isRemovable", "class.addable": "this.isAddable" } }, ngImport: i0, template: "<header>\n  @if (title()) {\n    <h2>{{title()}}</h2>\n  }\n  <!-- add button -->\n  @if (addable()) {\n    <button (click)=\"onAdd()\" class=\"e2e-add\" type=\"button\" title=\"Add Entry\" sciMaterialIcon>add</button>\n  }\n  <!-- remove button -->\n  @if (removable()) {\n    <button (click)=\"onClear()\" class=\"e2e-clear\" type=\"button\" title=\"Clear All Entries\" sciMaterialIcon>clear</button>\n  }\n</header>\n\n@for (keyValueGroup of keyValueFormArray().controls; track keyValueGroup; let i = $index) {\n  <!-- key -->\n  @if (keyValueGroup.controls.key.disabled) {\n    <!-- readonly -->\n    <label [for]=\"id + '_' + i\">{{keyValueGroup.controls.key.value}}</label>\n  } @else {\n    <!-- editable -->\n    <input [formControl]=\"keyValueGroup.controls.key\" class=\"e2e-key\">\n  }\n  <!-- value -->\n  <input [formControl]=\"keyValueGroup.controls.value\" [attr.id]=\"id + '_' + i\" class=\"e2e-value\">\n  <!-- 'remove' button -->\n  @if (removable()) {\n    <button class=\"e2e-remove\" type=\"button\" (click)=\"onRemove(i)\" title=\"Remove Entry\" sciMaterialIcon>remove</button>\n  }\n}\n", styles: [":host{display:grid;outline:none;grid-template-columns:100px 1fr;gap:.5em;align-items:center;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:1em}:host.removable{grid-template-columns:100px 1fr auto}:host>header{grid-column:1/-1;display:flex;gap:.25em;justify-content:flex-end}:host>header>h2{flex:auto;font-size:1em;font-weight:700;margin-top:0}:host>header>button{flex:none}:host input{all:unset;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:.5em;transition:border-color ease-in-out .15s,color ease-in-out .15s;background-color:var(--sci-color-background-input);color:var(--sci-color-text);appearance:auto}:host input:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)){border-color:var(--sci-color-accent)}:host input.ng-invalid.ng-touched{border-color:var(--sci-color-negative)}:host input:disabled,:host input:has(input:disabled),:host input:has(select:disabled){color:var(--sci-color-text-subtlest);background-color:var(--sci-color-background-input-disabled)}:host input:read-only{color:var(--sci-color-text-subtle)}:host input>option{background-color:var(--sci-color-background-elevation);color:var(--sci-color-text)}:host input>option:hover{background-color:var(--sci-color-background-elevation-hover)}\n"], dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "directive", type: SciMaterialIconDirective, selector: "[sciMaterialIcon]" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciKeyValueFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-key-value-field', imports: [
                        ReactiveFormsModule,
                        SciMaterialIconDirective,
                    ], template: "<header>\n  @if (title()) {\n    <h2>{{title()}}</h2>\n  }\n  <!-- add button -->\n  @if (addable()) {\n    <button (click)=\"onAdd()\" class=\"e2e-add\" type=\"button\" title=\"Add Entry\" sciMaterialIcon>add</button>\n  }\n  <!-- remove button -->\n  @if (removable()) {\n    <button (click)=\"onClear()\" class=\"e2e-clear\" type=\"button\" title=\"Clear All Entries\" sciMaterialIcon>clear</button>\n  }\n</header>\n\n@for (keyValueGroup of keyValueFormArray().controls; track keyValueGroup; let i = $index) {\n  <!-- key -->\n  @if (keyValueGroup.controls.key.disabled) {\n    <!-- readonly -->\n    <label [for]=\"id + '_' + i\">{{keyValueGroup.controls.key.value}}</label>\n  } @else {\n    <!-- editable -->\n    <input [formControl]=\"keyValueGroup.controls.key\" class=\"e2e-key\">\n  }\n  <!-- value -->\n  <input [formControl]=\"keyValueGroup.controls.value\" [attr.id]=\"id + '_' + i\" class=\"e2e-value\">\n  <!-- 'remove' button -->\n  @if (removable()) {\n    <button class=\"e2e-remove\" type=\"button\" (click)=\"onRemove(i)\" title=\"Remove Entry\" sciMaterialIcon>remove</button>\n  }\n}\n", styles: [":host{display:grid;outline:none;grid-template-columns:100px 1fr;gap:.5em;align-items:center;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:1em}:host.removable{grid-template-columns:100px 1fr auto}:host>header{grid-column:1/-1;display:flex;gap:.25em;justify-content:flex-end}:host>header>h2{flex:auto;font-size:1em;font-weight:700;margin-top:0}:host>header>button{flex:none}:host input{all:unset;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:.5em;transition:border-color ease-in-out .15s,color ease-in-out .15s;background-color:var(--sci-color-background-input);color:var(--sci-color-text);appearance:auto}:host input:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)){border-color:var(--sci-color-accent)}:host input.ng-invalid.ng-touched{border-color:var(--sci-color-negative)}:host input:disabled,:host input:has(input:disabled),:host input:has(select:disabled){color:var(--sci-color-text-subtlest);background-color:var(--sci-color-background-input-disabled)}:host input:read-only{color:var(--sci-color-text-subtle)}:host input>option{background-color:var(--sci-color-background-elevation);color:var(--sci-color-text)}:host input>option:hover{background-color:var(--sci-color-background-elevation-hover)}\n"] }]
        }], propDecorators: { keyValueFormArray: [{ type: i0.Input, args: [{ isSignal: true, alias: "keyValueFormArray", required: true }] }], title: [{ type: i0.Input, args: [{ isSignal: true, alias: "title", required: false }] }], removable: [{ type: i0.Input, args: [{ isSignal: true, alias: "removable", required: false }] }], addable: [{ type: i0.Input, args: [{ isSignal: true, alias: "addable", required: false }] }], tabindex: [{
                type: HostBinding,
                args: ['attr.tabindex']
            }], isRemovable: [{
                type: HostBinding,
                args: ['class.removable']
            }], isAddable: [{
                type: HostBinding,
                args: ['class.addable']
            }] } });

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/*
 * Secondary entrypoint: '@scion/components.internal/key-value-field'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciKeyValueFieldComponent };
//# sourceMappingURL=scion-components.internal-key-value-field.mjs.map
