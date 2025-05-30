import * as _angular_core from '@angular/core';
import { KeyValue } from '@angular/common';
import { Dictionary } from '@scion/toolkit/util';

/**
 * Displays key-value pairs of an object.
 */
declare class SciKeyValueComponent {
    readonly object: _angular_core.InputSignal<Dictionary<unknown> | Map<string, unknown> | null | undefined>;
    protected readonly flattenedProperties: _angular_core.Signal<Dictionary<unknown>>;
    /**
     * Compares qualifier entries by their position in the object.
     */
    protected keyCompareFn: (a: KeyValue<string, unknown>, b: KeyValue<string, unknown>) => number;
    private flattenObject;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciKeyValueComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciKeyValueComponent, "sci-key-value", never, { "object": { "alias": "object"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { SciKeyValueComponent };
