import * as i0 from '@angular/core';
import { input, booleanAttribute, inject, ChangeDetectorRef, linkedSignal, effect, untracked, forwardRef, ChangeDetectionStrategy, Component } from '@angular/core';
import * as i1 from '@angular/forms';
import { FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SciMaterialIconDirective } from '@scion/components.internal/material-icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UUID } from '@scion/toolkit/uuid';

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
class SciCheckboxComponent {
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    _cd = inject(ChangeDetectorRef);
    _disabled = linkedSignal(() => this.disabled(), ...(ngDevMode ? [{ debugName: "_disabled" }] : []));
    formControl = new FormControl(false, { nonNullable: true });
    id = UUID.randomUUID();
    _cvaChangeFn = noop;
    _cvaTouchedFn = noop;
    constructor() {
        this.formControl.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(checked => {
            this._cvaChangeFn(checked);
            this._cvaTouchedFn();
        });
        effect(() => {
            const disabled = this._disabled();
            // Prevent value emission when changing form control enabled state.
            untracked(() => disabled ? this.formControl.disable({ emitEvent: false }) : this.formControl.enable({ emitEvent: false }));
        });
    }
    get isChecked() {
        return this.formControl.value;
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    registerOnChange(fn) {
        this._cvaChangeFn = fn;
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    registerOnTouched(fn) {
        this._cvaTouchedFn = fn;
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    setDisabledState(isDisabled) {
        this._disabled.set(isDisabled);
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    writeValue(value) {
        this.formControl.setValue(coerceBooleanProperty(value), { emitEvent: false });
        this._cd.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciCheckboxComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.0-rc.1", type: SciCheckboxComponent, isStandalone: true, selector: "sci-checkbox", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, providers: [
            { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciCheckboxComponent) },
        ], ngImport: i0, template: "<input type=\"checkbox\" [id]=\"id\" [formControl]=\"formControl\">\n<label [for]=\"id\" sciMaterialIcon>\n  @if (isChecked) {\n    check\n  }\n</label>\n", styles: [":host{display:inline-grid;width:1.6rem;height:1.6rem;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner-small);background-color:var(--sci-color-background-input);transition:border-color ease-in-out .15s,color ease-in-out .15s}:host>input[type=checkbox]{all:unset;height:0;width:0;position:absolute}:host>label{display:inline-grid;color:var(--sci-color-accent-inverse);place-content:center;overflow:hidden;font-size:1.6rem;-webkit-user-select:none;user-select:none}:host:has(>input:disabled)>label{cursor:auto}:host:has(>input:checked:not(:disabled)){background-color:var(--sci-color-accent);border-color:var(--sci-color-accent);transition:unset}:host:has(>input:checked:disabled){background-color:var(--sci-color-gray-400);transition:unset}:host:has(>input:not(:checked):disabled){background-color:var(--sci-color-background-input-disabled)}:host:focus-within{border-color:var(--sci-color-accent)}:host:has(>input:focus-visible:checked){outline:1px solid var(--sci-color-accent);border-color:transparent;background-clip:content-box}:host:has(>input:focus-visible:not(:checked)){border-color:var(--sci-color-accent)}\n"], dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1.CheckboxControlValueAccessor, selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "directive", type: SciMaterialIconDirective, selector: "[sciMaterialIcon]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciCheckboxComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-checkbox', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        ReactiveFormsModule,
                        SciMaterialIconDirective,
                    ], providers: [
                        { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciCheckboxComponent) },
                    ], template: "<input type=\"checkbox\" [id]=\"id\" [formControl]=\"formControl\">\n<label [for]=\"id\" sciMaterialIcon>\n  @if (isChecked) {\n    check\n  }\n</label>\n", styles: [":host{display:inline-grid;width:1.6rem;height:1.6rem;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner-small);background-color:var(--sci-color-background-input);transition:border-color ease-in-out .15s,color ease-in-out .15s}:host>input[type=checkbox]{all:unset;height:0;width:0;position:absolute}:host>label{display:inline-grid;color:var(--sci-color-accent-inverse);place-content:center;overflow:hidden;font-size:1.6rem;-webkit-user-select:none;user-select:none}:host:has(>input:disabled)>label{cursor:auto}:host:has(>input:checked:not(:disabled)){background-color:var(--sci-color-accent);border-color:var(--sci-color-accent);transition:unset}:host:has(>input:checked:disabled){background-color:var(--sci-color-gray-400);transition:unset}:host:has(>input:not(:checked):disabled){background-color:var(--sci-color-background-input-disabled)}:host:focus-within{border-color:var(--sci-color-accent)}:host:has(>input:focus-visible:checked){outline:1px solid var(--sci-color-accent);border-color:transparent;background-clip:content-box}:host:has(>input:focus-visible:not(:checked)){border-color:var(--sci-color-accent)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }] } });

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
 * Secondary entrypoint: '@scion/components.internal/checkbox'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciCheckboxComponent };
//# sourceMappingURL=scion-components.internal-checkbox.mjs.map
