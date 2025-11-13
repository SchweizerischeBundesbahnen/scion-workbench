import * as _angular_core from '@angular/core';
import { OnDestroy, ViewContainerRef } from '@angular/core';

/**
 * Use this directive to model a tab item for {SciTabbarComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * Tab content is constructed lazily when displayed for the first time. Tab content is not destroyed when selecting another tab.
 *
 * ---
 * Example usage:
 *
 * <sci-tabbar>
 *   @for (item of items$ | async; track item.id) {
 *     <ng-template sciTab [label]="item.label">
 *       ...
 *     </ng-template>
 *   }
 * </sci-tabbar>
 */
declare class SciTabDirective implements OnDestroy {
    /**
     * Specifies the title of the tab.
     */
    readonly label: _angular_core.InputSignal<string>;
    /**
     * Specifies the identity of this tab.
     *
     * Can be used to activate this tab via {@link SciTabbarComponent.activateTab}.
     */
    readonly name: _angular_core.InputSignal<string | undefined>;
    /**
     * Specifies CSS class(es) added to the tab item, e.g., to select the tab in end-to-end tests.
     */
    readonly cssClass: _angular_core.InputSignal<string | string[] | null | undefined>;
    private readonly _templateRef;
    private _vcr;
    private _viewRef;
    /**
     * Attaches the content of this tab.
     *
     * @param vcr
     *        Specifies where to attach this tab's content.
     */
    attachContent(vcr: ViewContainerRef): void;
    /**
     * Detaches the content of this tab, but does not destroy it.
     */
    detachContent(): void;
    /**
     * Returns whether the tab content is currently attached to the DOM, meaning that the user has selected the tab.
     */
    isContentAttached(): boolean;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciTabDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<SciTabDirective, "ng-template[sciTab]", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "cssClass": { "alias": "cssClass"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Organizes content into separate tabs where only one tab can be visible at a time.
 *
 * A tab's content is constructed lazily when displayed for the first time. Tab content is not destroyed when selecting another tab.
 *
 * Tabs are modelled as content children in the form of a `<ng-template>` decorated with the `sciTab` directive, as following:
 *
 * ```
 * <sci-tabbar>
 *   @for (item of items$ | async; track item.id) {
 *     <ng-template sciTab [label]="item.label">
 *       ...
 *     </ng-template>
 *   }
 * </sci-tabbar>
 * ```
 */
declare class SciTabbarComponent {
    private readonly _cd;
    private readonly _vcr;
    protected readonly tabs: _angular_core.Signal<readonly SciTabDirective[]>;
    constructor();
    /**
     * Activates the given tab.
     */
    activateTab(tabOrIdentity: SciTabDirective | string | undefined): void;
    protected onTabClick(tab: SciTabDirective | undefined): void;
    private getActiveTab;
    private coerceTab;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SciTabbarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SciTabbarComponent, "sci-tabbar", never, {}, {}, ["tabs"], never, true, never>;
}

export { SciTabDirective, SciTabbarComponent };
