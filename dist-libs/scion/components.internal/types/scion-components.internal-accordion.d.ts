import * as _angular_core from '@angular/core';
import { TemplateRef, OnInit, Signal, TrackByFunction } from '@angular/core';
import { CdkAccordionItem } from '@angular/cdk/accordion';

/**
 * Use this directive to model an accordion item for {SciAccordionComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * ---
 * Example usage:
 *
 * <sci-accordion>
 *   @for (item of items$ | async; track item.id) {
 *     <!-- item -->
 *     <ng-template sciAccordionItem [key]="item.id" [panel]="panel">
 *       ...
 *     </ng-template>
 *
 *     <!-- item panel -->
 *     <ng-template #panel>
 *       ...
 *     </ng-template>
 *   }
 * </sci-accordion>
 */
declare class SciAccordionItemDirective {
    readonly template: TemplateRef<void>;
    /**
     * Provide template(s) to be rendered as actions of this list item.
     */
    readonly panel: _angular_core.InputSignal<TemplateRef<void>>;
    /**
     * Optional key to identify this item and is used as key for the {TrackBy} function.
     */
    readonly key: _angular_core.InputSignal<string | undefined>;
    /**
     * Indicates whether to expand this item.
     */
    readonly expanded: _angular_core.InputSignal<boolean | undefined>;
    /**
     * Specifies CSS class(es) added to the <section> and <wb-view> elements, e.g. used for e2e testing.
     */
    readonly cssClass: _angular_core.InputSignal<string | string[] | null | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciAccordionItemDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<SciAccordionItemDirective, "ng-template[sciAccordionItem]", never, { "panel": { "alias": "panel"; "required": true; "isSignal": true; }; "key": { "alias": "key"; "required": false; "isSignal": true; }; "expanded": { "alias": "expanded"; "required": false; "isSignal": true; }; "cssClass": { "alias": "cssClass"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Component that shows items in an accordion.
 *
 * An accordion item is contributed as content child in the form of a `<ng-template>` decorated with `sciAccordionItem` directive,
 * and its panel modelled in the form of a `<ng-template>` and given as input to its `sciAccordionItem` directive.
 *
 * Accordion panel content is added to a CSS grid container with a single column, filling remaining space vertically and horizontally.
 *
 * ---
 * Example of a simple accordion:
 *
 * <sci-accordion>
 *   @for (item of items$ | async; track item.id) {
 *     <!-- item -->
 *     <ng-template sciAccordionItem [key]="item.id" [panel]="panel">
 *       ...
 *     </ng-template>
 *
 *     <!-- item panel -->
 *     <ng-template #panel>
 *       ...
 *     </ng-template>
 *   }
 * </sci-accordion>
 */
declare class SciAccordionComponent implements OnInit {
    /**
     * Whether the accordion should allow multiple expanded accordion items simultaneously.
     */
    readonly multi: _angular_core.InputSignal<boolean>;
    /**
     * Specifies the style of the accordion.
     */
    readonly variant: _angular_core.InputSignal<"solid" | "bubble">;
    private readonly _host;
    /** Workaround for setting the filled state on initialization: https://github.com/angular/angular/issues/22560#issuecomment-473958144 */
    private readonly _cd;
    private readonly _destroyRef;
    private readonly _cdkAccordion;
    protected readonly items: Signal<readonly SciAccordionItemDirective[]>;
    protected get isBubbleVariant(): boolean;
    protected get isSolidVariant(): boolean;
    protected filled: boolean;
    ngOnInit(): void;
    protected trackByFn: TrackByFunction<SciAccordionItemDirective>;
    protected onToggle(item: CdkAccordionItem): void;
    /**
     * Computes whether this accordion fills the boundaries of this component.
     * It does this on each dimension change and sets the CSS class 'filled'
     * accordingly.
     */
    private computeFilledStateOnDimensionChange;
    /**
     * Returns animation metadata to expand accordion panel.
     */
    private static provideEnterAnimation;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciAccordionComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciAccordionComponent, "sci-accordion", never, { "multi": { "alias": "multi"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; }, {}, ["items"], never, true, never>;
}

export { SciAccordionComponent, SciAccordionItemDirective };
