import * as _angular_forms from '@angular/forms';
import { ControlValueAccessor } from '@angular/forms';
import * as _angular_core from '@angular/core';
import { OnDestroy } from '@angular/core';

/**
 * Provides a simple filter control.
 */
declare class SciFilterFieldComponent implements ControlValueAccessor, OnDestroy {
    /**
     * Sets focus order in sequential keyboard navigation. If not specified, the focus order is according to the position in the document (tabindex=0).
     */
    readonly tabindex: _angular_core.InputSignal<number | undefined>;
    /**
     * Specifies the hint displayed when this field is empty.
     */
    readonly placeholder: _angular_core.InputSignal<string | undefined>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Emits on filter change.
     */
    readonly filter: _angular_core.OutputEmitterRef<string>;
    private readonly _host;
    private readonly _focusManager;
    private readonly _cd;
    private readonly _formBuilder;
    private readonly _inputElement;
    private readonly _disabled;
    protected readonly id: string;
    protected readonly formControl: _angular_forms.FormControl<string>;
    private _cvaChangeFn;
    private _cvaTouchedFn;
    protected componentTabindex: number;
    protected get empty(): boolean;
    constructor();
    focus(): void;
    /**
     * Invoke to propagate keyboard events to the filter field.
     *
     * If the keyboard event represents an alphanumeric character, filter text is cleared and the cursor set into the filter field.
     * This allows to start filtering without having to focus the filter field, e.g. if another element has the focus.
     */
    focusAndApplyKeyboardEvent(event: KeyboardEvent): void;
    protected onClear(): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    registerOnChange(fn: (value: unknown) => void): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    registerOnTouched(fn: () => void): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    setDisabledState(isDisabled: boolean): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     * @docs-private
     */
    writeValue(value: string | undefined | null): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciFilterFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciFilterFieldComponent, "sci-filter-field", never, { "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "filter": "filter"; }, never, never, true, never>;
}
/**
 * Creates a regular expression of the given filter text.
 */
declare function toFilterRegExp(filterText: string): RegExp | null;

export { SciFilterFieldComponent, toFilterRegExp };
