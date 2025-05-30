import * as _angular_core from '@angular/core';
import { TemplateRef, TrackByFunction } from '@angular/core';
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';

/**
 * Use this directive to model a list item for {SciListComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * ---
 * Example usage:
 *
 * <sci-list (filter)="onFilter($event)">
 *   @for (item of items$ | async; track item.id) {
 *     <ng-template sciListItem>
 *       <app-list-item [item]="item"></app-list-item>
 *     </ng-template>
 *   }
 * </sci-list>
 */
declare class SciListItemDirective {
    /**
     * Optional key to identify this item and is used to emit selection and internally as key for the {TrackBy} function.
     */
    readonly key: _angular_core.InputSignal<string | undefined>;
    /**
     * Provide template(s) to be rendered as actions of this list item.
     */
    readonly actions: _angular_core.InputSignalWithTransform<TemplateRef<void>[], TemplateRef<void> | TemplateRef<void>[]>;
    readonly template: TemplateRef<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciListItemDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<SciListItemDirective, "ng-template[sciListItem]", never, { "key": { "alias": "key"; "required": false; "isSignal": true; }; "actions": { "alias": "actions"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Styles for `<sci-list>`.
 */
declare type SciListStyle = 'list-item' | 'option-item';

declare class SciListItemComponent implements FocusableOption {
    readonly listItem: _angular_core.InputSignal<SciListItemDirective>;
    readonly style: _angular_core.InputSignal<SciListStyle>;
    readonly active: _angular_core.InputSignal<boolean>;
    private readonly _host;
    protected readonly tabindex = -1;
    protected get isActive(): boolean;
    protected get optionStyle(): boolean;
    /**
     * @implements FocusableOption
     */
    focus(origin?: FocusOrigin): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciListItemComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciListItemComponent, "sci-list-item", never, { "listItem": { "alias": "listItem"; "required": true; "isSignal": true; }; "style": { "alias": "style"; "required": true; "isSignal": true; }; "active": { "alias": "active"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Component that contains a list of items or options which can be optionally filtered and associated with actions.
 *
 * List items are contributed as content children in the form of a `<ng-template>` decorated with `sciListItem` directive.
 * Actions are modelled in the form of a `<ng-template>` and are inputs for respective `sciListItem` directive.
 *
 * ---
 * Example of a simple list:
 *
 * <sci-list (filter)="onFilter($event)">
 *   @for (item of items$ | async; track item.id) {
 *     <ng-template sciListItem>
 *       ...
 *     </ng-template>
 *   }
 * </sci-list>
 *
 *
 * ---
 * Example of a list with actions:
 *
 * <sci-list (filter)="onFilter($event)">
 *   @for (item of items$ | async; track item.id) {
 *     <!-- list item -->
 *     <ng-template sciListItem [actions]="delete_action">
 *       ...
 *     </ng-template>
 *
 *     <!-- action -->
 *     <ng-template #delete_action>
 *       <button class="material-icons" (click)="onDelete(item.id)">delete</button>
 *     </ng-template>
 *     }
 * </sci-list>
 *
 * ## Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-list` component, the following CSS variables can be set directly on the component.
 *
 * - --sci-list-item-padding: Sets the padding of a list item.
 *
 * ```css
 * sci-list {
 *   --sci-list-item-padding: 0;
 * }
 * ```
 */
declare class SciListComponent {
    /**
     * Specifies where to position the filter field.
     * If not specified, does not display the filter field.
     */
    readonly filterPosition: _angular_core.InputSignal<"top" | "bottom" | undefined>;
    /**
     * Specifies whether to render list items or option items.
     */
    readonly style: _angular_core.InputSignal<SciListStyle>;
    /**
     * Sets focus order in sequential keyboard navigation.
     * If not specified, the focus order is according to the position in the document (tabindex=0).
     */
    readonly tabindex: _angular_core.InputSignal<number | undefined>;
    /**
     * Emits selected item key on selection change.
     */
    readonly selection: _angular_core.OutputEmitterRef<string>;
    /**
     * Emits filter text on filter change.
     */
    readonly filter: _angular_core.OutputEmitterRef<string>;
    private readonly _listItemComponents;
    private readonly _filterField;
    private readonly _focusKeyManager;
    protected readonly listItems: _angular_core.Signal<readonly SciListItemDirective[]>;
    protected componentTabindex: number;
    constructor();
    protected onKeydown(event: KeyboardEvent): void;
    protected focus(): void;
    protected onItemClick(item: SciListItemComponent): void;
    protected onFilter(filterText: string): void;
    protected onAnyKey(event: KeyboardEvent): void;
    protected get activeItem(): SciListItemComponent | null;
    protected trackByFn: TrackByFunction<SciListItemDirective>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciListComponent, "sci-list", never, { "filterPosition": { "alias": "filterPosition"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; }, { "selection": "selection"; "filter": "filter"; }, ["listItems"], never, true, never>;
}

export { SciListComponent, SciListItemDirective };
