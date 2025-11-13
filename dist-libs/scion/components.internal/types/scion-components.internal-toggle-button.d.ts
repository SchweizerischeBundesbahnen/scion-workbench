import * as i0 from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';

declare class SciToggleButtonComponent implements ControlValueAccessor {
    readonly disabled: i0.InputSignalWithTransform<boolean, unknown>;
    private readonly _cd;
    private readonly _disabled;
    protected readonly formControl: FormControl<boolean>;
    protected readonly id: string;
    private _cvaChangeFn;
    private _cvaTouchedFn;
    constructor();
    get isToggled(): boolean;
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
    writeValue(value: boolean | null | undefined): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SciToggleButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SciToggleButtonComponent, "sci-toggle-button", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { SciToggleButtonComponent };
