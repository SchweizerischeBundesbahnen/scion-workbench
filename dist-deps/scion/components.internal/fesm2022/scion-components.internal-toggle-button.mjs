import * as i0 from '@angular/core';
import { input, booleanAttribute, inject, ChangeDetectorRef, linkedSignal, effect, untracked, forwardRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { UUID } from '@scion/toolkit/uuid';
import * as i1 from '@angular/forms';
import { FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { noop } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
class SciToggleButtonComponent {
    disabled = input(false, { transform: booleanAttribute });
    _cd = inject(ChangeDetectorRef);
    _disabled = linkedSignal(() => this.disabled());
    formControl = new FormControl(false, { nonNullable: true });
    id = UUID.randomUUID();
    _cvaChangeFn = noop;
    _cvaTouchedFn = noop;
    constructor() {
        this.formControl.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(value => {
            this._cvaChangeFn(value);
            this._cvaTouchedFn();
        });
        effect(() => {
            const disabled = this._disabled();
            // Prevent value emission when changing form control enabled state.
            untracked(() => disabled ? this.formControl.disable({ emitEvent: false }) : this.formControl.enable({ emitEvent: false }));
        });
    }
    get isToggled() {
        return this.formControl.value;
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    registerOnChange(fn) {
        this._cvaChangeFn = fn;
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    registerOnTouched(fn) {
        this._cvaTouchedFn = fn;
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    setDisabledState(isDisabled) {
        this._disabled.set(isDisabled);
    }
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    writeValue(value) {
        this.formControl.setValue(coerceBooleanProperty(value), { emitEvent: false });
        this._cd.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciToggleButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.0.0", type: SciToggleButtonComponent, isStandalone: true, selector: "sci-toggle-button", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, providers: [
            { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciToggleButtonComponent) },
        ], ngImport: i0, template: "<input type=\"checkbox\" [id]=\"id\" [formControl]=\"formControl\">\n<label [for]=\"id\"></label>\n", styles: [":host{display:inline-grid;width:2.5rem;height:1.25rem;border-radius:1.25rem;padding:2px;background-color:var(--sci-color-border);box-sizing:content-box}:host>input[type=checkbox]{all:unset;height:0;width:0;position:absolute}:host>label:after{content:\"\";display:block;height:1.25rem;width:1.25rem;border-radius:50%;transition:transform 125ms ease-out;background-color:var(--sci-color-accent-inverse);border:1px solid var(--sci-color-border);box-sizing:border-box}:host:has(>input:disabled)>label{cursor:auto}:host>input:checked+label:after{transform:translate(100%)}:host:has(>input:checked:not(:disabled)){background-color:var(--sci-color-accent)}:host:has(>input:checked:not(:disabled))>label:after{border-color:var(--sci-color-accent)}:host:has(>input:checked:disabled){background-color:var(--sci-color-background-input-disabled)}:host:has(>input:checked:disabled)>label:after{background-color:var(--sci-color-gray-100);border-color:var(--sci-color-gray-100)}:host:has(>input:not(:checked):disabled){background-color:var(--sci-color-background-input-disabled)}:host:has(>input:not(:checked):disabled)>label:after{background-color:var(--sci-color-gray-100);border-color:var(--sci-color-background-input-disabled)}:host:has(>input:focus-visible:not(:disabled)){outline:1px solid var(--sci-color-accent);background-clip:content-box}\n"], dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1.CheckboxControlValueAccessor, selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciToggleButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-toggle-button', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        ReactiveFormsModule,
                    ], providers: [
                        { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciToggleButtonComponent) },
                    ], template: "<input type=\"checkbox\" [id]=\"id\" [formControl]=\"formControl\">\n<label [for]=\"id\"></label>\n", styles: [":host{display:inline-grid;width:2.5rem;height:1.25rem;border-radius:1.25rem;padding:2px;background-color:var(--sci-color-border);box-sizing:content-box}:host>input[type=checkbox]{all:unset;height:0;width:0;position:absolute}:host>label:after{content:\"\";display:block;height:1.25rem;width:1.25rem;border-radius:50%;transition:transform 125ms ease-out;background-color:var(--sci-color-accent-inverse);border:1px solid var(--sci-color-border);box-sizing:border-box}:host:has(>input:disabled)>label{cursor:auto}:host>input:checked+label:after{transform:translate(100%)}:host:has(>input:checked:not(:disabled)){background-color:var(--sci-color-accent)}:host:has(>input:checked:not(:disabled))>label:after{border-color:var(--sci-color-accent)}:host:has(>input:checked:disabled){background-color:var(--sci-color-background-input-disabled)}:host:has(>input:checked:disabled)>label:after{background-color:var(--sci-color-gray-100);border-color:var(--sci-color-gray-100)}:host:has(>input:not(:checked):disabled){background-color:var(--sci-color-background-input-disabled)}:host:has(>input:not(:checked):disabled)>label:after{background-color:var(--sci-color-gray-100);border-color:var(--sci-color-background-input-disabled)}:host:has(>input:focus-visible:not(:disabled)){outline:1px solid var(--sci-color-accent);background-clip:content-box}\n"] }]
        }], ctorParameters: () => [] });

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
 * Secondary entrypoint: '@scion/components.internal/toggle-button'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciToggleButtonComponent };
//# sourceMappingURL=scion-components.internal-toggle-button.mjs.map
