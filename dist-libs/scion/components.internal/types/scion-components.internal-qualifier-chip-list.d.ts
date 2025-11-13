import * as _angular_core from '@angular/core';
import { KeyValue } from '@angular/common';

/**
 * Displays the type and qualifier of a capability as chips.
 *
 * ## Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-qualifier-chip-list` component, the following CSS variables can be set directly on the component.
 *
 * - --sci-qualifier-chip-list-type-background-color: Sets the background color of the type chip
 * - --sci-qualifier-chip-list-qualifier-background-color: Sets the background color of the qualifier chip
 *
 * ```css
 * sci-qualifier-chip-list {
 *   --sci-qualifier-chip-list-type-background-color: gray;
 * }
 * ```
 */
declare class SciQualifierChipListComponent {
    readonly type: _angular_core.InputSignal<string | undefined>;
    readonly qualifier: _angular_core.InputSignal<Qualifier | null | undefined>;
    /**
     * Compares qualifier entries by their position in the object.
     */
    protected qualifierKeyCompareFn: (a: KeyValue<string, any>, b: KeyValue<string, any>) => number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciQualifierChipListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciQualifierChipListComponent, "sci-qualifier-chip-list", never, { "type": { "alias": "type"; "required": false; "isSignal": true; }; "qualifier": { "alias": "qualifier"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
interface Qualifier {
    [key: string]: string | number | boolean;
}

export { SciQualifierChipListComponent };
