import * as i0 from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';

declare class SciCheckboxComponent implements ControlValueAccessor {
    readonly disabled: i0.InputSignalWithTransform<boolean, unknown>;
    private readonly _cd;
    private readonly _disabled;
    protected readonly formControl: FormControl<boolean>;
    protected readonly id: string;
    private _cvaChangeFn;
    private _cvaTouchedFn;
    constructor();
    get isChecked(): boolean;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    registerOnChange(fn: (value: unknown) => void): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    registerOnTouched(fn: () => void): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    setDisabledState(isDisabled: boolean): void;
    /**
     * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
     */
    writeValue(value: boolean | null | undefined): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SciCheckboxComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SciCheckboxComponent, "sci-checkbox", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { SciCheckboxComponent };
