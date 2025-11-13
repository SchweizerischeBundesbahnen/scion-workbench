import * as i0 from '@angular/core';
import { input, inject, TemplateRef, Directive, ChangeDetectorRef, viewChild, ViewContainerRef, contentChildren, effect, untracked, ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { SciViewportComponent } from '@scion/components/viewport';

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
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
class SciTabDirective {
    /**
     * Specifies the title of the tab.
     */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /**
     * Specifies the identity of this tab.
     *
     * Can be used to activate this tab via {@link SciTabbarComponent.activateTab}.
     */
    name = input(...(ngDevMode ? [undefined, { debugName: "name" }] : []));
    /**
     * Specifies CSS class(es) added to the tab item, e.g., to select the tab in end-to-end tests.
     */
    cssClass = input(...(ngDevMode ? [undefined, { debugName: "cssClass" }] : []));
    _templateRef = inject(TemplateRef);
    _vcr;
    _viewRef;
    /**
     * Attaches the content of this tab.
     *
     * @param vcr
     *        Specifies where to attach this tab's content.
     */
    attachContent(vcr) {
        this._vcr = vcr;
        // Construct the view, if not already constructed.
        this._viewRef ??= this._templateRef.createEmbeddedView(undefined);
        // Attach the content, if not already attached.
        if (!this.isContentAttached()) {
            this._viewRef.reattach();
            vcr.insert(this._viewRef);
        }
    }
    /**
     * Detaches the content of this tab, but does not destroy it.
     */
    detachContent() {
        if (this.isContentAttached()) {
            this._vcr.detach(this._vcr.indexOf(this._viewRef));
            this._viewRef.detach();
        }
    }
    /**
     * Returns whether the tab content is currently attached to the DOM, meaning that the user has selected the tab.
     */
    isContentAttached() {
        return !!this._viewRef && this._vcr?.indexOf(this._viewRef) !== -1;
    }
    ngOnDestroy() {
        this._viewRef?.destroy();
        this._viewRef = undefined;
        this._vcr = undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciTabDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.0.0-rc.1", type: SciTabDirective, isStandalone: true, selector: "ng-template[sciTab]", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: false, transformFunction: null }, cssClass: { classPropertyName: "cssClass", publicName: "cssClass", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciTabDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[sciTab]' }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: false }] }], cssClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "cssClass", required: false }] }] } });

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
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
class SciTabbarComponent {
    _cd = inject(ChangeDetectorRef);
    _vcr = viewChild.required('tabcontent', { read: ViewContainerRef });
    tabs = contentChildren(SciTabDirective, ...(ngDevMode ? [{ debugName: "tabs" }] : []));
    constructor() {
        effect(() => {
            if (this.tabs().length && !this.getActiveTab()) {
                untracked(() => this.activateTab(this.tabs().at(0)));
            }
        });
    }
    /**
     * Activates the given tab.
     */
    activateTab(tabOrIdentity) {
        const tab = this.coerceTab(tabOrIdentity);
        // Deactivate the currently selected tab, if any.
        const selectedTab = this.getActiveTab();
        if (selectedTab && selectedTab === tab) {
            return;
        }
        if (selectedTab) {
            selectedTab.detachContent();
        }
        // Activate the new tab, if any.
        if (tab) {
            tab.attachContent(this._vcr());
        }
        this._cd.markForCheck();
    }
    onTabClick(tab) {
        this.activateTab(tab);
    }
    getActiveTab() {
        return this.tabs().find(tab => tab.isContentAttached());
    }
    coerceTab(tabOrIdentity) {
        if (!tabOrIdentity) {
            return undefined;
        }
        if (typeof tabOrIdentity === 'string') {
            return this.tabs().find(it => it.name() === tabOrIdentity) ?? undefined;
        }
        return tabOrIdentity;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciTabbarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.0-rc.1", type: SciTabbarComponent, isStandalone: true, selector: "sci-tabbar", queries: [{ propertyName: "tabs", predicate: SciTabDirective, isSignal: true }], viewQueries: [{ propertyName: "_vcr", first: true, predicate: ["tabcontent"], descendants: true, read: ViewContainerRef, isSignal: true }], ngImport: i0, template: "<sci-viewport class=\"tabbar\">\n  @for (tab of tabs(); track tab) {\n    <button class=\"tab e2e-tab\"\n            [class.selected]=\"tab.isContentAttached()\"\n            [ngClass]=\"tab.cssClass()\"\n            (click)=\"onTabClick(tab)\">\n      {{tab.label()}}\n      <div class=\"outline\"></div>\n    </button>\n  }\n  <span class=\"filler\"></span>\n</sci-viewport>\n\n<sci-viewport class=\"tabcontent\">\n  <ng-container #tabcontent></ng-container>\n</sci-viewport>\n", styles: [":host{display:flex;flex-direction:column;overflow:hidden}:host>sci-viewport.tabbar{flex:none;height:2rem}:host>sci-viewport.tabbar::part(content){display:flex;flex-wrap:nowrap}:host>sci-viewport.tabbar>button.tab{all:unset;flex:none;position:relative}:host>sci-viewport.tabbar>button.tab:focus-visible>div.outline{display:unset}:host>sci-viewport.tabbar>button.tab.selected{border-bottom-color:var(--sci-color-accent);color:var(--sci-color-accent)}:host>sci-viewport.tabbar>button.tab:hover:not(.selected){border-bottom-color:var(--sci-color-border-strong);color:var(--sci-color-accent)}:host>sci-viewport.tabbar>button.tab>div.outline{display:none;position:absolute;inset:1px;pointer-events:none;border-radius:var(--sci-corner);border:2px solid var(--sci-color-accent)}:host>sci-viewport.tabbar>span.filler{flex:auto}:host>sci-viewport.tabbar>button.tab,:host>sci-viewport.tabbar>span.filler{border-bottom:3px solid var(--sci-color-border);padding:0 1em}:host>sci-viewport.tabcontent{flex:auto;margin-top:1em}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: SciViewportComponent, selector: "sci-viewport", inputs: ["scrollbarStyle"], outputs: ["scroll"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciTabbarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-tabbar', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        NgClass,
                        SciViewportComponent,
                    ], template: "<sci-viewport class=\"tabbar\">\n  @for (tab of tabs(); track tab) {\n    <button class=\"tab e2e-tab\"\n            [class.selected]=\"tab.isContentAttached()\"\n            [ngClass]=\"tab.cssClass()\"\n            (click)=\"onTabClick(tab)\">\n      {{tab.label()}}\n      <div class=\"outline\"></div>\n    </button>\n  }\n  <span class=\"filler\"></span>\n</sci-viewport>\n\n<sci-viewport class=\"tabcontent\">\n  <ng-container #tabcontent></ng-container>\n</sci-viewport>\n", styles: [":host{display:flex;flex-direction:column;overflow:hidden}:host>sci-viewport.tabbar{flex:none;height:2rem}:host>sci-viewport.tabbar::part(content){display:flex;flex-wrap:nowrap}:host>sci-viewport.tabbar>button.tab{all:unset;flex:none;position:relative}:host>sci-viewport.tabbar>button.tab:focus-visible>div.outline{display:unset}:host>sci-viewport.tabbar>button.tab.selected{border-bottom-color:var(--sci-color-accent);color:var(--sci-color-accent)}:host>sci-viewport.tabbar>button.tab:hover:not(.selected){border-bottom-color:var(--sci-color-border-strong);color:var(--sci-color-accent)}:host>sci-viewport.tabbar>button.tab>div.outline{display:none;position:absolute;inset:1px;pointer-events:none;border-radius:var(--sci-corner);border:2px solid var(--sci-color-accent)}:host>sci-viewport.tabbar>span.filler{flex:auto}:host>sci-viewport.tabbar>button.tab,:host>sci-viewport.tabbar>span.filler{border-bottom:3px solid var(--sci-color-border);padding:0 1em}:host>sci-viewport.tabcontent{flex:auto;margin-top:1em}\n"] }]
        }], ctorParameters: () => [], propDecorators: { _vcr: [{ type: i0.ViewChild, args: ['tabcontent', { ...{ read: ViewContainerRef }, isSignal: true }] }], tabs: [{ type: i0.ContentChildren, args: [i0.forwardRef(() => SciTabDirective), { isSignal: true }] }] } });

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/*
 * Secondary entrypoint: '@scion/components.internal/tabbar'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciTabDirective, SciTabbarComponent };
//# sourceMappingURL=scion-components.internal-tabbar.mjs.map
