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
import { mapToBody, MessageClient } from '../messaging/message-client';
import { UUID } from '@scion/toolkit/util';
import { TopicMessage } from '../../messaging.model';
import { Keystroke } from '../keyboard-event/keystroke';
import { PreferredSize } from '../preferred-size/preferred-size';

/** @ignore **/
const ELEMENT_NAME = 'sci-router-outlet';
/** @ignore **/
const ATTR_NAME = 'name';
/** @ignore **/
const ATTR_SCROLLABLE = 'scrollable';
/** @ignore **/
const ATTR_KEYSTROKES = 'keystrokes';
/** @ignore **/
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
  <iframe src="about:blank" scrolling="yes" marginheight="0" marginwidth="0"></iframe>
`;

/**
 * Web component allowing to embed web content from any origin. The content is displayed inside an iframe to provide the highest possible
 * isolation between the microfrontends via a separate browsing context.
 *
 * To embed a microfrontend, place this custom HMTL element `<sci-router-outlet></sci-router-outlet>` in an HTML template, give it a name via
 * its `name` attribute and navigate via {@link OutletRouter} to instruct the outlet to load the microfrontend.
 *
 * 1. Place the web component in an HTML template:
 * ```html
 * <sci-router-outlet name="detail"></router-outlet>
 * ```
 *
 * 2. Control the outlet's content:
 * ```ts
 * Beans.get(OutletRouter).navigate('https://micro-frontends.org', {outlet: 'detail'});
 * ```
 *
 * ***
 *
 * #### Navigation
 * Using the {@link OutletRouter}, you can control which site to display in the outlet. Any site can be displayed unless having set the HTTP header `X-Frame-Options`.
 * By giving the outlet a name, you can reference the outlet when navigating. The name is optional; if not set, it defaults to {@link PRIMARY_OUTLET primary},
 * which is also the name used if not specifying an outlet for the navigation.
 *
 * Multiple outlets can co-exist, and outlets can be nested. If multiple outlets have the same name, then they all show the same content.
 *
 * The outlet does not necessarily have to exist at the time of the navigation. When it is added to the DOM, the outlet will display the last URL navigated
 * for it. When navigation is repeated for an outlet, its content is replaced.
 *
 * #### Outlet size
 * The embedded microfrontend can report its preferred size via {@link PreferredSizeService.setPreferredSize}, causing the outlet to adapt its size to the content's preferred size.
 * The preferred size of an element is the minimum size that allows it to display normally. Setting a preferred size is useful if the outlet is displayed in a layout
 * that aligns its items based on the items' content size.
 *
 * The platform provides a convenience API to bind an arbitrary DOM element via {@link PreferredSizeService.fromDimension} to automatically report size changes of that
 * element to the outlet.
 *
 * #### Contextual data
 * The platform allows associating contextual data with an outlet, which then is available in embedded content using {@link ContextService}.
 * Contextual data must be serializable with the structured clone algorithm.
 *
 * Each outlet spans a new context. A context is similar to a `Map`, but is linked to its parent outlet context, if any, thus forming a hierarchical tree structure.
 * When looking up a value and if the value is not found in the outlet context, the lookup is retried on the parent context, repeating until either a value
 * is found or the root of the context tree has been reached.
 *
 * ```ts
 *  // set some contextual data
 *  const outlet: SciRouterOutletElement = document.querySelector('sci-router-outlet');
 *  outlet.setContextValue('key', 'value');
 *
 *  // observe contextual data in embedded content:
 *  Beans.get(ContextService).observe$('key').subscribe(value => {
 *    ...
 *  });
 * ```
 *
 * #### Keystrokes
 * The outlet allows the registration of keystrokes to receive keyboard events triggered in embedded content at any nesting level across iframe boundaries.
 * You can register keystrokes via the `keystrokes` attribute in the HTML template, or via the `keystrokes` property on the DOM element. If setting keystrokes via
 * the HTML template, multiple keystrokes are separated by a comma.
 *
 * A keystroke is specified as a string that has several parts, each separated with a dot. The first part specifies the event type (`keydown` or `keyup`), followed by
 * optional modifier part(s) (`alt`, `shift`, `control`, `meta`, or a combination thereof) and with the keyboard key as the last part. The key is a case-insensitive
 * value of the `KeyboardEvent#key` property. For a complete list of valid key values, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values.
 * Two keys are an exception to the value of the `KeyboardEvent#key` property: `dot` and `space`.
 *
 * Keyboard events are dispatched as synthetic keyboard events via this outlet's event dispatcher, thus bubbling up the DOM tree like regular events.
 * They are of the original type, meaning that when the user presses a key on the keyboard, a `keydown` keyboard event is triggered, or a `keyup` event
 * when releasing a key, respectively.
 *
 * HTML template:
 * ```html
 * <sci-router-outlet keystrokes="keydown.control.alt.enter,keydown.escape,keydown.control.space"></router-outlet>
 * ```
 * TypeScript:
 * ```ts
 *  const outlet: SciRouterOutletElement = document.querySelector('sci-router-outlet');
 *  outlet.keystrokes = [
 *      'keydown.control.alt.enter',
 *      'keydown.escape',
 *      'keydown.control.space'
 *  ];
 * ```
 *
 * #### Page scrolling
 * By default, native page scrolling is enabled for the embedded content. If disabled, the embedded microfrontend cannot enable it and must
 * provide a scrollable viewport itself. Native page scrolling can be disabled using {@link SciRouterOutletElement.scrollable}.
 *
 * #### Lifecycle events
 * The router outlet emits an `activate` event when a URL is set, and a `deactivate` event when navigating away from the URL.
 *
 * #### Web component
 * The outlet is registered as a custom element in the browser's custom element registry as defined by the Web Components standard.
 * See https://developer.mozilla.org/en-US/docs/Web/Web_Components for more information.
 *
 * @see {@link OutletRouter}
 * @see {@link PreferredSizeService}
 * @see {@link ContextService}
 *
 * @category Routing
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
    this._outletName$ = new BehaviorSubject<string>(PRIMARY_OUTLET);
    this._shadowRoot = this.attachShadow({mode: 'closed'});
    this._shadowRoot.innerHTML = HTML_TEMPLATE.trim();
    this._iframe = this._shadowRoot.querySelector('iframe');
    this._contextProvider = new RouterOutletContextProvider(this._iframe);
  }

  /**
   * Sets the name of this outlet.
   *
   * By giving the outlet a name, you can reference the outlet when navigating. The name is optional;
   * if not set, it defaults to {@link PRIMARY_OUTLET primary}
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
   * Specifies whether to enable or disable native page scrolling in the embedded document. If not set, page scrolling is enabled.
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
   * Instructs embedded content at any nesting level to propagate keyboard events to this outlet. The keyboard events are then dispatched as synthetic
   * keyboard events via this outlet's event dispatcher, thus bubbling up the DOM tree like regular events. They are of the original type, meaning that
   * when the user presses a key on the keyboard, a `keydown` keyboard event is triggered, or a `keyup` event when releasing a key, respectively.
   *
   * @param keystrokes - A keystroke is specified as a string that has several parts, each separated with a dot. The first part specifies the event type
   *                   (`keydown` or `keyup`), followed by optional modifier part(s) (`alt`, `shift`, `control`, `meta`, or a combination thereof) and
   *                   with the keyboard key as the last part. The key is a case-insensitive value of the `KeyboardEvent#key` property. For a complete
   *                   list of valid key values, see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values. Two keys are an
   *                   exception to the value of the `KeyboardEvent#key` property: `dot` and `space`.
   *
   * `keydown.control.z`, `keydown.escape`, `keyup.enter`, `keydown.control.alt.enter`, `keydown.control.space`.
   */
  public set keystrokes(keystrokes: string[]) {
    if (keystrokes && keystrokes.length) {
      this.setAttribute(ATTR_KEYSTROKES, KeystrokesAttributeUtil.join(keystrokes));
    }
    else {
      this.removeAttribute(ATTR_KEYSTROKES);
    }
  }

  /**
   * Returns the keystrokes which to bubble across the iframe boundaries.
   */
  public get keystrokes(): string[] {
    return KeystrokesAttributeUtil.split(this.getAttribute(ATTR_KEYSTROKES));
  }

  /**
   * Sets contextual data to be available in embedded content using {@link ContextService}.
   * Contextual data must be serializable with the structured clone algorithm.
   */
  public setContextValue<T = any>(name: string, value: T): void {
    this._contextProvider.set(name, value);
  }

  /**
   * Removes given contextual data from this outlet context.
   *
   * Removal does not affect parent contexts, so it is possible that a subsequent call to {@link ContextService.observe$} with the same name
   * will return a non-null result, due to a value being stored in a parent context.
   *
   * @return `true` if the value in the outlet context has been removed successfully; otherwise `false`.
   */
  public removeContextValue(name: string): boolean {
    return this._contextProvider.remove(name);
  }

  /**
   * Returns an Observable that emits the contextual values registered in this outlet. Values inherited from parent contexts are not returned.
   * The Observable never completes, and emits when a context value is added to or removed from the outlet context.
   */
  public get contextValues$(): Observable<Map<string, any>> {
    return this._contextProvider.entries$;
  }

  /**
   * Resets the preferred size which may have been set by the embedded content.
   */
  public resetPreferredSize(): void {
    Beans.get(MessageClient).publish$(RouterOutlets.preferredSizeTopic(this._uid), null).subscribe();
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
   * Returns the reference to the iframe of this outlet.
   */
  public get iframe(): HTMLIFrameElement {
    return this._iframe;
  }

  private installOutletContext(): void {
    this._outletName$
      .pipe(takeUntil(this._disconnect$))
      .subscribe((name: string) => {
        const outletContext: OutletContext = {name: name, uid: this._uid};
        this.setContextValue(OUTLET_CONTEXT, outletContext);
      });
  }

  private installOutletUrlListener(): void {
    this._outletName$
      .pipe(
        // Listen for navigations directed to this outlet.
        // If the outlet name is changed, the empty page 'about:blank' is displayed before the actual content is displayed.
        // This is for the case that no navigation has yet taken place for the specified URL, and to initialize {@link pairwise} operator.
        switchMap((name: string) => Beans.get(MessageClient).observe$<string>(RouterOutlets.urlTopic(name)).pipe(mapToBody(), startWith('about:blank'))),
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
    Beans.get(MessageClient).observe$<PreferredSize>(RouterOutlets.preferredSizeTopic(this._uid))
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

  private installKeyboardEventDispatcher(): void {
    Beans.get(MessageClient).observe$<KeyboardEventInit>(RouterOutlets.keyboardEventTopic(this._uid, ':eventType'))
      .pipe(takeUntil(this._disconnect$))
      .subscribe((event: TopicMessage<KeyboardEventInit>) => {
        const type = event.params.get('eventType');
        this.dispatchEvent(new KeyboardEvent(type, event.body));
      });
  }

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Invoked each time the custom element is appended into a document-connected element.
   * This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   * @internal
   */
  public connectedCallback(): void {
    this.installOutletUrlListener();
    this.installOutletContext();
    this.installPreferredSizeListener();
    this.installKeyboardEventDispatcher();
    this._contextProvider.onOutletMount();
  }

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Invoked each time the custom element is disconnected from the document's DOM.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   * @internal
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
   * @internal
   */
  public static observedAttributes = [ATTR_NAME, ATTR_SCROLLABLE, ATTR_KEYSTROKES]; // tslint:disable-line:member-ordering

  /**
   * Lifecycle callback of the 'Custom element' Web Component standard.
   *
   * Invoked each time one of the custom element's attributes is added, removed, or changed.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks
   * @internal
   */
  public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    switch (name) {
      case ATTR_NAME: {
        this._outletName$.next(newValue || PRIMARY_OUTLET);
        break;
      }
      case ATTR_SCROLLABLE: {
        this._iframe.setAttribute('scrolling', coerceBooleanProperty(newValue) ? 'yes' : 'no');
        break;
      }
      case ATTR_KEYSTROKES: {
        KeystrokesAttributeUtil.split(oldValue).forEach(keystroke => this.removeContextValue(KEYSTROKE_CONTEXT_NAME_PREFIX + Keystroke.fromString(keystroke).parts));
        KeystrokesAttributeUtil.split(newValue).forEach(keystroke => this.setContextValue(KEYSTROKE_CONTEXT_NAME_PREFIX + Keystroke.fromString(keystroke).parts, undefined));
        break;
      }
    }
  }

  /**
   * Defines this outlet as custom element in the browser custom element registry; has no effect if the element was already defined.
   *
   * @return A Promise that resolves once this custom element is defined.
   * @internal
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
 * Information about the outlet which embeds a microfrontend.
 *
 * This object can be obtained from the {@link ContextService} using the name {@link OUTLET_CONTEXT}.
 *
 * ```ts
 * Beans.get(ContextService).observe$(OUTLET_CONTEXT).subscribe((outletContext: OutletContext) => {
 *   ...
 * });
 * ```
 *
 * @see {@link OUTLET_CONTEXT}
 * @see {@link ContextService}
 * @category Routing
 */
export interface OutletContext {
  name: string;
  uid: string;
}

/**
 * Coerces a data-bound value (typically a string) to a boolean.
 *
 * @ignore
 */
function coerceBooleanProperty(value: any): boolean {
  return value != null && `${value}` !== 'false';
}

/**
 * Key for obtaining the current outlet context using {@link ContextService}.
 *
 * @see {@link OutletContext}
 * @see {@link ContextService}
 */
export const OUTLET_CONTEXT = 'ɵOUTLET';

/**
 * Default name for an outlet if no explicit name is specified.
 */
export const PRIMARY_OUTLET = 'primary';

/**
 * Defines constants for {@link SciRouterOutletElement} and {@link OutletRouter}.
 *
 * @category Routing
 */
export namespace RouterOutlets {

  /**
   * Computes the topic via which the URL for an outlet is exchanged as retained message.
   *
   * @internal
   */
  export function urlTopic(outletName: string): string {
    return `sci-router-outlets/${outletName}/url`;
  }

  /**
   * Computes the topic where to post keyboard events to be dispatched.
   *
   * @internal
   */
  export function keyboardEventTopic(outletUid: string, eventType: string): string {
    return `sci-router-outlets/${outletUid}/keyboard-events/${eventType}`;
  }

  /**
   * Computes the topic to which the preferred outlet size can be published to.
   *
   * @internal
   */
  export function preferredSizeTopic(outletUid: string): string {
    return `sci-router-outlets/${outletUid}/preferred-size`;
  }
}

/**
 * @ignore
 */
namespace KeystrokesAttributeUtil {

  const delimiter = ',';

  export function split(attributeValue: string | null): string[] {
    return attributeValue ? attributeValue.split(delimiter) : [];
  }

  export function join(keystrokes: string[] | null): string | null {
    return keystrokes ? keystrokes.join(delimiter) : null;
  }
}

/**
 * Keystroke bindings are prefixed with `keystroke:` when registered in the outlet context.
 * @internal
 */
export const KEYSTROKE_CONTEXT_NAME_PREFIX = 'keystroke:';
