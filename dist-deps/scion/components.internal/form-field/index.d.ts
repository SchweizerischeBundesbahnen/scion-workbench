import * as _angular_core from '@angular/core';
import { OnDestroy } from '@angular/core';

declare class SciFormFieldComponent implements OnDestroy {
    readonly label: _angular_core.InputSignal<string>;
    readonly direction: _angular_core.InputSignal<"row" | "column">;
    private _focusTrap;
    protected get isColumnDirection(): boolean;
    constructor();
    onLabelClick(): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciFormFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciFormFieldComponent, "sci-form-field", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "direction": { "alias": "direction"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

export { SciFormFieldComponent };
