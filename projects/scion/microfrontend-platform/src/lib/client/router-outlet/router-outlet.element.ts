/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { RouterOutletContextProvider } from '../context/router-outlet-context-provider';
import { runSafe } from '../../safe-runner';
import { distinctUntilChanged, map, pairwise, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { RouterOutletUrlAssigner } from './router-outlet-url-assigner';
import { Beans } from '../../bean-manager';
import { mapToBody, MessageClient } from '../message-client';
import { UUID } from '@scion/toolkit/util';

const ELEMENT_NAME = 'sci-router-outlet';
const ATTR_NAME = 'name';
const ATTR_SCROLLABLE = 'scrollable';
const HTML_TEMPLATE = `
  <style>
    :host {
      display: block;
      overflow: hidden;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
      margin: 0;
    }
  </style>
  <iframe src="about:blank" scrolling="no" marginheight="0" marginwidth="0"></iframe>
`;

/**
 * Allows embedding web content from any origin. The content is displayed inside an iframe to provide a separate browsing context.
 *
 * Using the router service {@link OutletRouter}, you can navigate to a site displayed in the outlet. The content can be any web content allowed to
 * be embedded in an iframe, that is which has the HTTP response header 'X-Frame-Options' not set.
 *
 * The outlet can be given a name by the optional name attribute. If not set, it defaults to {@link RouterOutlets.PRIMARY_OUTLET primary}.
 *
 * The outlet does not necessarily have to exist for navigation yet. As soon as the outlet is mounted, the last routed URL for that outlet
 * is loaded and displayed. When navigation is repeated for an outlet, its content is replaced.
 *
 * The router supports multiple outlets to co-exist and outlets can be nested. If outlets have the same name, then they show the same content.
 *
 * The outlet allows arbitrary data to be associated which is available in its embedded web content using {@link ContextService}. To do this, the
 * embedded app must be registered in the platform.
 * A context is a hierarchical key-value map which are linked together to form a tree structure. When a key is
 * not found in a context, the lookup is retried on the parent, repeating until either a value is found or the root of the tree has been reached.
 *
 * The router outlet will emit an `activate` event when a URL is set, and a `deactivate` event when navigating away from the URL.
 *
 * ```
 * <sci-router-outlet></sci-router-outlet>
 * <sci-router-outlet name="detail"></router-outlet>
 * ```
 *
 * ---
 * The outlet is registered as a custom element as defined by the Web Components standard. See https://developer.mozilla.org/en-US/docs/Web/Web_Components.
 *
 * @see OutletRouter
 */
export class SciRouterOutletElement extends HTMLElement {

  private _shadowRoot: ShadowRoot;
  private _disconnect$ = new Subject<void>();

  private _uid = UUID.randomUUID();
  private _iframe: HTMLIFrameElement;
  private _outletName$: BehaviorSubject<string>;
  private _contextProvider: RouterOutletContextProvider;

  constructor() {
    super();

    this._outletName$ = new BehaviorSubject<string>(RouterOutlets.PRIMARY_OUTLET);
    this._shadowRoot = this.attachShadow({mode: 'closed'});
    this._shadowRoot.innerHTML = HTML_TEMPLATE.trim();
    this._iframe = this._shadowRoot.querySelector('iframe');
    this._contextProvider = new RouterOutletContextProvider(this._iframe);
  }

  /**
   * Sets the name of this outlet.
   *
   * The outlet name is used to obtain the URL from {@link OutletRouter}. When a navigation for that outlet
   * name takes place, the web content of this outlet is replaced.
   *
   * If not specifying an outlet name, it defaults to {@link RouterOutlets.PRIMARY_OUTLET primary}.
   */
  public set name(name: string) {
    if (name) {
      this.setAttribute(ATTR_NAME, name);
    }
    else {
      this.removeAttribute(ATTR_NAME);
    }
  }

  /**
   * Returns the name of this outlet.
   */
  public get name(): string {
    return this.getAttribute(ATTR_NAME);
  }

  /**
   * Specifies whether to enable or disable page scrolling in the embedded document. If not set, page scrolling is disabled.
   *
   * If set to `false`, native page scrolling cannot be enabled in the embedded document. Instead, the embedded web content
   * must provide a scrollable viewport itself.
   */
  public set scrollable(scrollable: boolean) {
    if (scrollable) {
      this.setAttribute(ATTR_SCROLLABLE, 'true');
    }
    else {
      this.removeAttribute(ATTR_SCROLLABLE);
    }
  }

  /**
   * Returns whether the embedded document is natively page scrollable.
   */
  public get scrollable(): boolean {
    return this.getAttribute(ATTR_SCROLLABLE) === 'true';
  }

  /**
   * Sets a value to be associated with a given name in this outlet context.
   *
   * @param name
   *        Specifies the name to store a value for.
   * @param value
   *        Specifies the value to be stored. It can be any object which is serializable with the structured clone algorithm.
   */
  public setContextValue(name: string, value: any): void {
    this._contextProvider.set(name, value);
  }

  /**
   * Removes the given name and any corresponding value from this outlet context.
   *
   * Removal does not affect parent contexts, so it is possible that a subsequent call to {@link ContextService#observe$} with the same name
   * will return a non-null result, due to a value being stored in a parent context.
   *
   * @param  name
   *         Specifies the name to remove.
   * @return `true` if the value in the outlet context has been removed successfully; otherwise `false`.
   */
  public removeContextValue(name: string): boolean {
    return this._contextProvider.remove(name);
  }

  /**
   * Returns an Observable that emits the values registered in this outlet. Values inherited from parent contexts are not returned.
   * The Observable never completes, and emits when a context value is added or removed.
   */
  public get contextValues$(): Observable<Map<string, any>> {
    return this._contextProvider.entries$;
  }

  /**
   * Resets the preferred size which may have been set by the embedded content.
   */
  public resetPreferredSize(): void {
    Beans.get(MessageClient).publish$(RouterOutlets.outletPreferredSizeTopic(this._uid), null).subscribe();
  }

  /**
   * Returns the preferred size, if any, or `undefined` otherwise.
   */
  public get preferredSize(): PreferredSize | undefined {
    const preferredSize: PreferredSize = {
      minWidth: this.style.minWidth || undefined,
      width: this.style.width || undefined,
      maxWidth: this.style.maxWidth || undefined,
      minHeight: this.style.minHeight || undefined,
      height: this.style.height || undefined,
      maxHeight: this.style.maxHeight || undefined,
    };
    if (Object.values(preferredSize).some(Boolean)) {
      return preferredSize;
    }
    return undefined;
  }

  /**
   * Returns the reference to the {@link HTMLIFrameElement} of this outlet.
   */
  public get iframe(): HTMLIFrameElement {
    return this._iframe;
  }

  private installOutletContext(): void {
    this._outletName$
      .pipe(takeUntil(this._disconnect$))
      .subscribe((name: string) => {
        const outletContext: OutletContext = {name: name, uid: this._uid};
        this.setContextValue(RouterOutlets.OUTLET_CONTEXT, outletContext);
      });
  }

  private installOutletUrlListener(): void {
    this._outletName$
      .pipe(
        // Listen for navigations directed to this outlet.
        // If the outlet name is changed, the empty page 'about:blank' is displayed before the actual content is displayed.
        // This is for the case that no navigation has yet taken place for the specified URL, and to initialize {@link pairwise} operator.
        switchMap((name: string) => Beans.get(MessageClient).observe$<string>(RouterOutlets.outletUrlTopic(name)).pipe(mapToBody(), startWith('about:blank'))),
        map(url => url || 'about:blank'),
        distinctUntilChanged(),
        pairwise(),
        takeUntil(this._disconnect$),
      )
      .subscribe(([prevUrl, currUrl]: [string, string]) => runSafe(() => {
        this.dispatchEvent(new CustomEvent('deactivate', {detail: prevUrl}));
        Beans.get(RouterOutletUrlAssigner).assign(this._iframe, currUrl, prevUrl);
        this.dispatchEvent(new CustomEvent('activate', {detail: currUrl}));
      }));
  }

  private installPreferredSizeListener(): void {
    Beans.get(MessageClient).observe$<PreferredSize>(RouterOutlets.outletPreferredSizeTopic(this._uid))
      .pipe(
        takeUntil(this._disconnect$),
        mapToBody(),
      )
      .subscribe((preferredSize: PreferredSize) => {
        this.style.minWidth = preferredSize && preferredSize.minWidth || null;
        this.style.width = preferredSize && preferredSize.width || null;
        this.style.maxWidth = preferredSize && preferredSize.maxWidth || null;
        this.style.minHeight = preferredSize && preferredSize.minHeight || null;
        this.style.height = preferredSize && preferredSize.height || null;
        this.style.maxHeight = preferredSize && preferredSize.maxHeight || null;
      });
  }

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Invoked each time the custom element is appended into a document-connected element.
   * This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   */
  public connectedCallback(): void {
    this.installOutletUrlListener();
    this.installOutletContext();
    this.installPreferredSizeListener();
    this._contextProvider.onOutletMount();
  }

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Invoked each time the custom element is disconnected from the document's DOM.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   */
  public disconnectedCallback(): void {
    this._disconnect$.next();
    this._contextProvider.onOutletUnmount();
  }

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Specifies the attributes which to observe in {@link attributeChangedCallback} method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   */
  public static observedAttributes = [ATTR_NAME, ATTR_SCROLLABLE]; // tslint:disable-line:member-ordering

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Invoked each time one of the custom element's attributes is added, removed, or changed.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   */
  public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    switch (name) {
      case ATTR_NAME: {
        this._outletName$.next(newValue || RouterOutlets.PRIMARY_OUTLET);
        break;
      }
      case ATTR_SCROLLABLE: {
        this._iframe.setAttribute('scrolling', coerceBooleanProperty(newValue) ? 'yes' : 'no');
        break;
      }
    }
  }

  /**
   * Defines this outlet as custom element in the browser custom element registry; has no effect if the element was already defined.
   *
   * @return A Promise that resolves once this custom element is defined.
   */
  public static define(): Promise<void> {
    if (customElements.get(ELEMENT_NAME)) {
      return Promise.resolve();
    }
    else {
      customElements.define(ELEMENT_NAME, SciRouterOutletElement);
      return customElements.whenDefined(ELEMENT_NAME);
    }
  }
}

/**
 * Contains information about the outlet in which web content is displayed.
 */
export interface OutletContext {
  name: string;
  uid: string;
}

/**
 * Represents the minimum size that will allow the element to display normally.
 */
export interface PreferredSize {
  minWidth?: string;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  height?: string;
  maxHeight?: string;
}

/**
 * Coerces a data-bound value (typically a string) to a boolean.
 */
function coerceBooleanProperty(value: any): boolean {
  return value != null && `${value}` !== 'false';
}

/**
 * Provides constants for {@link SciRouterOutletElement} and {@link OutletRouter}.
 */
export namespace RouterOutlets {

  /**
   * Computes the topic via which the URL for an outlet is exchanged as retained message.
   *
   * @internal
   */
  export function outletUrlTopic(outletName: string): string {
    return `sci-router-outlets/${outletName}/url`;
  }

  /**
   * Computes the topic to which the preferred outlet size can be published to.
   *
   * @internal
   */
  export function outletPreferredSizeTopic(outletUid: string): string {
    return `sci-router-outlets/${outletUid}/preferred-size`;
  }

  /**
   * Key for obtaining the current outlet context using {@link ContextService}.
   */
  export const OUTLET_CONTEXT = 'ɵOUTLET';

  /**
   * Default name for an outlet if no explicit name is specified.
   */
  export const PRIMARY_OUTLET = 'primary';
}
