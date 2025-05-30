import * as _angular_core from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { Dictionary } from '@scion/toolkit/util';

/**
 * Allows entering key-value pairs.
 */
declare class SciKeyValueFieldComponent {
    readonly keyValueFormArray: _angular_core.InputSignal<FormArray<FormGroup<KeyValueEntry>>>;
    readonly title: _angular_core.InputSignal<string | undefined>;
    readonly removable: _angular_core.InputSignal<boolean>;
    readonly addable: _angular_core.InputSignal<boolean>;
    private readonly _formBuilder;
    private readonly _host;
    protected readonly id: string;
    protected tabindex: number;
    protected get isRemovable(): boolean;
    protected get isAddable(): boolean;
    protected onRemove(index: number): void;
    protected onAdd(): void;
    protected onClear(): void;
    /**
     * Creates a dictionary from the form controls in the given `FormArray`.
     *
     * By default, if empty, `null` is returned.
     */
    static toDictionary(formArray: FormArray<FormGroup<KeyValueEntry>>, returnNullIfEmpty?: true): Dictionary<string> | null;
    static toDictionary(formArray: FormArray<FormGroup<KeyValueEntry>>, returnNullIfEmpty: false): Dictionary<string>;
    static toDictionary(formArray: FormArray<FormGroup<KeyValueEntry>>, returnNullIfEmpty: boolean): Dictionary<string> | null;
    /**
     * Creates a {@link Map} from the form controls in the given `FormArray`.
     *
     * By default, if empty, `null` is returned.
     */
    static toMap(formArray: FormArray<FormGroup<KeyValueEntry>>, returnNullIfEmpty?: true): Map<string, any> | null;
    static toMap(formArray: FormArray<FormGroup<KeyValueEntry>>, returnNullIfEmpty: false): Map<string, any>;
    static toMap(formArray: FormArray<FormGroup<KeyValueEntry>>, returnNullIfEmpty: boolean): Map<string, any> | null;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciKeyValueFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciKeyValueFieldComponent, "sci-key-value-field", never, { "keyValueFormArray": { "alias": "keyValueFormArray"; "required": true; "isSignal": true; }; "title": { "alias": "title"; "required": false; "isSignal": true; }; "removable": { "alias": "removable"; "required": false; "isSignal": true; }; "addable": { "alias": "addable"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
/**
 * Represents the entry of the form array.
 */
interface KeyValueEntry {
    key: FormControl<string>;
    value: FormControl<string>;
}

export { SciKeyValueFieldComponent };
export type { KeyValueEntry };
