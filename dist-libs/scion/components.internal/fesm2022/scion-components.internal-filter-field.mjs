import * as i0 from '@angular/core';
import { input, booleanAttribute, output, inject, ElementRef, ChangeDetectorRef, viewChild, linkedSignal, effect, untracked, forwardRef, HostListener, HostBinding, ChangeDetectionStrategy, Component } from '@angular/core';
import * as i1 from '@angular/forms';
import { NonNullableFormBuilder, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { UUID } from '@scion/toolkit/uuid';
import { SciMaterialIconDirective } from '@scion/components.internal/material-icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
 * Provides a simple filter control.
 */
class SciFilterFieldComponent {
    /**
     * Sets focus order in sequential keyboard navigation. If not specified, the focus order is according to the position in the document (tabindex=0).
     */
    tabindex = input(...(ngDevMode ? [undefined, { debugName: "tabindex" }] : []));
    /**
     * Specifies the hint displayed when this field is empty.
     */
    placeholder = input(...(ngDevMode ? [undefined, { debugName: "placeholder" }] : []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /**
     * Emits on filter change.
     */
    filter = output();
    _host = inject(ElementRef).nativeElement;
    _focusManager = inject(FocusMonitor);
    _cd = inject(ChangeDetectorRef);
    _formBuilder = inject(NonNullableFormBuilder);
    _inputElement = viewChild.required('input');
    _disabled = linkedSignal(() => this.disabled(), ...(ngDevMode ? [{ debugName: "_disabled" }] : []));
    id = UUID.randomUUID();
    formControl = this._formBuilder.control('', { updateOn: 'change' });
    _cvaChangeFn = noop;
    _cvaTouchedFn = noop;
    componentTabindex = -1; // component is not focusable in sequential keyboard navigation, but tabindex (if any) is installed on input field
    get empty() {
        return !this.formControl.value;
    }
    constructor() {
        this.formControl.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(value => {
            this._cvaChangeFn(value);
            this.filter.emit(value);
        });
        this._focusManager.monitor(this._host, true)
            .pipe(takeUntilDestroyed())
            .subscribe((focusOrigin) => {
            if (!focusOrigin) {
                this._cvaTouchedFn(); // triggers form field validation and signals a blur event
            }
        });
        effect(() => {
            const disabled = this._disabled();
            // Prevent value emission when changing form control enabled state.
            untracked(() => disabled ? this.formControl.disable({ emitEvent: false }) : this.formControl.enable({ emitEvent: false }));
        });
    }
    focus() {
        this._inputElement().nativeElement.focus();
    }
    /**
     * Invoke to propagate keyboard events to the filter field.
     *
     * If the keyboard event represents an alphanumeric character, filter text is cleared and the cursor set into the filter field.
     * This allows to start filtering without having to focus the filter field, e.g. if another element has the focus.
     */
    focusAndApplyKeyboardEvent(event) {
        if (event.target === this._inputElement().nativeElement) {
            return; // Ignore the keyboard event if its target is equal to the input element.
        }
        if (event.ctrlKey || event.altKey || event.shiftKey) {
            return;
        }
        if (!isAlphanumeric(event)) {
            return;
        }
        this.formControl.setValue('');
        this.focus();
        event.stopPropagation();
        this._cd.markForCheck();
    }
    onClear() {
        this.formControl.setValue('');
        this.focus(); // restore the focus
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
        this.formControl.setValue(value ?? '', { emitEvent: false });
        this._cd.markForCheck();
    }
    ngOnDestroy() {
        this._focusManager.stopMonitoring(this._host);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciFilterFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "21.0.0-rc.1", type: SciFilterFieldComponent, isStandalone: true, selector: "sci-filter-field", inputs: { tabindex: { classPropertyName: "tabindex", publicName: "tabindex", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { filter: "filter" }, host: { listeners: { "focus": "focus()" }, properties: { "attr.tabindex": "this.componentTabindex", "class.empty": "this.empty" } }, providers: [
            { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciFilterFieldComponent) },
        ], viewQueries: [{ propertyName: "_inputElement", first: true, predicate: ["input"], descendants: true, isSignal: true }], ngImport: i0, template: "<input #input\n       [attr.id]=\"id\"\n       autocomplete=\"off\"\n       [formControl]=\"formControl\"\n       [tabindex]=\"tabindex() ?? 0\"\n       [placeholder]=\"placeholder() ?? ''\">\n<button class=\"clear\" tabindex=\"-1\" (click)=\"onClear()\" sciMaterialIcon>\n  clear\n</button>\n<label [for]=\"id\" class=\"filter-icon\" sciMaterialIcon>search</label>\n", styles: [":host{all:unset;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:.5em;transition:border-color ease-in-out .15s,color ease-in-out .15s;background-color:var(--sci-color-background-input);color:var(--sci-color-text);appearance:auto}:host:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)){border-color:var(--sci-color-accent)}:host.ng-invalid.ng-touched{border-color:var(--sci-color-negative)}:host:disabled,:host:has(input:disabled),:host:has(select:disabled){color:var(--sci-color-text-subtlest);background-color:var(--sci-color-background-input-disabled)}:host:read-only{color:var(--sci-color-text-subtle)}:host>option{background-color:var(--sci-color-background-elevation);color:var(--sci-color-text)}:host>option:hover{background-color:var(--sci-color-background-elevation-hover)}:host{display:inline-flex;padding:.25em .5em;gap:.25em}:host>input{all:unset;flex:auto;min-width:0}:host>button.clear{flex:none;align-self:center;opacity:.75;font-size:1em}:host>button.clear:hover{opacity:1}:host>label.filter-icon{flex:none;align-self:center;-webkit-user-select:none;user-select:none;color:var(--sci-color-text-subtle)}:host:not(:focus-within):not(:hover)>button.clear,:host:has(>input:disabled)>button.clear,:host.empty>button.clear{visibility:hidden}:host:has(>input:disabled)>label.filter-icon{color:var(--sci-color-text-subtlest)}\n"], dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "directive", type: SciMaterialIconDirective, selector: "[sciMaterialIcon]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciFilterFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-filter-field', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        ReactiveFormsModule,
                        SciMaterialIconDirective,
                    ], providers: [
                        { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciFilterFieldComponent) },
                    ], template: "<input #input\n       [attr.id]=\"id\"\n       autocomplete=\"off\"\n       [formControl]=\"formControl\"\n       [tabindex]=\"tabindex() ?? 0\"\n       [placeholder]=\"placeholder() ?? ''\">\n<button class=\"clear\" tabindex=\"-1\" (click)=\"onClear()\" sciMaterialIcon>\n  clear\n</button>\n<label [for]=\"id\" class=\"filter-icon\" sciMaterialIcon>search</label>\n", styles: [":host{all:unset;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:.5em;transition:border-color ease-in-out .15s,color ease-in-out .15s;background-color:var(--sci-color-background-input);color:var(--sci-color-text);appearance:auto}:host:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)){border-color:var(--sci-color-accent)}:host.ng-invalid.ng-touched{border-color:var(--sci-color-negative)}:host:disabled,:host:has(input:disabled),:host:has(select:disabled){color:var(--sci-color-text-subtlest);background-color:var(--sci-color-background-input-disabled)}:host:read-only{color:var(--sci-color-text-subtle)}:host>option{background-color:var(--sci-color-background-elevation);color:var(--sci-color-text)}:host>option:hover{background-color:var(--sci-color-background-elevation-hover)}:host{display:inline-flex;padding:.25em .5em;gap:.25em}:host>input{all:unset;flex:auto;min-width:0}:host>button.clear{flex:none;align-self:center;opacity:.75;font-size:1em}:host>button.clear:hover{opacity:1}:host>label.filter-icon{flex:none;align-self:center;-webkit-user-select:none;user-select:none;color:var(--sci-color-text-subtle)}:host:not(:focus-within):not(:hover)>button.clear,:host:has(>input:disabled)>button.clear,:host.empty>button.clear{visibility:hidden}:host:has(>input:disabled)>label.filter-icon{color:var(--sci-color-text-subtlest)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { tabindex: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabindex", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], filter: [{ type: i0.Output, args: ["filter"] }], _inputElement: [{ type: i0.ViewChild, args: ['input', { isSignal: true }] }], componentTabindex: [{
                type: HostBinding,
                args: ['attr.tabindex']
            }], empty: [{
                type: HostBinding,
                args: ['class.empty']
            }], focus: [{
                type: HostListener,
                args: ['focus']
            }] } });
function isAlphanumeric(event) {
    return (/^[a-z0-9]$/i.test(event.key));
}
/**
 * Creates a regular expression of the given filter text.
 */
function toFilterRegExp(filterText) {
    if (!filterText) {
        return null;
    }
    // Escape the user filter input and add wildcard support
    const escapedString = filterText.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    return new RegExp(escapedString, 'i');
}

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
 * Secondary entrypoint: '@scion/components.internal/filter-field'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciFilterFieldComponent, toFilterRegExp };
//# sourceMappingURL=scion-components.internal-filter-field.mjs.map
