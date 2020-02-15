/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { runSafe } from '../../safe-runner';

/** @ignore **/
const BLANK_URL = new URL('about:blank');

/**
 * Assigns a URL to the iframe of a {@link SciRouterOutletElement `<sci-router-outlet>`}.
 *
 * The iframe URL is set using `Location#replace` method. A session history entry is not created.
 *
 * To work around a content loading issue in nested iframes in Chrome browser, the URL is added a fixed query parameter,
 * unless the URL already has some query parameter. See {@link RouterOutletUrlAssigner.patchUrl} for more information.
 *
 * To change this behavior, create a class that extends {@link RouterOutletUrlAssigner} and register it
 * under the symbol {@link RouterOutletUrlAssigner} in the bean manager.
 *
 * @category Routing
 */
export class RouterOutletUrlAssigner {

  /**
   * Assigns a URL to the iframe of a {@link SciRouterOutletElement `<sci-router-outlet>`}.
   *
   * @param iframe - Iframe for which to set the URL.
   * @param currUrl - URL to be set.
   * @param prevUrl - Previous URL, if any.
   */
  public assign(iframe: HTMLIFrameElement, currUrl: string, prevUrl?: string): void {
    // Patch the URL to force Chrome to load the content of specified URL.
    const patchedUrl = this.patchUrl(currUrl, prevUrl);

    // Set the iframe URL via {@link Location#replace} instead of modifying the iframe src attribute.
    // Otherwise, if changing the src attribute of an already mounted iframe, a history entry would be added to the browser history.
    // Removing the iframe from the DOM before setting the src attribute is also not applicable as this always causes the page to load
    // anew, which is not the desired effect if using hash-based routing and navigating within the same site.
    iframe.contentWindow.location.replace(patchedUrl);
  }

  /**
   * Patches the URL to force Chrome to load the content of the given URL into an iframe.
   *
   * #### Problem:
   * Chrome browser does not load the content of a nested iframe if already loaded a document from the same origin and path in a parent iframe.
   * The problem does not occur if the URL contains query parameters. Also, the hash fragment of the URL does not matter.
   *
   * This problem could not be observed in Firefox and Edge.
   *
   * #### Motivation:
   * If using hash-based routing, the microfrontends of an application are served under the same origin and path, and routing is based on the URL hash fragment only.
   * This Chrome issue would prevent a microfrontend from embedding other microfrontends of its application.
   *
   * #### Fix:
   * If the URL does not contain a query parameter, an arbitrary query parameter is appended to the URL to force Chrome to load the content.
   * The name and value of the query param do not matter. However, it is crucial always to use the same param to allow the browser to cache the request.
   *
   * The only exception to appending a query param is when replacing an outlet's content with content from the same app. Then, the browser already loaded
   * the application. Otherwise, if appending a query param, the application would load anew.
   *
   * #### Alternative fix:
   * An alternative (but partial) fix would be to initialize the iframe with a `null` source. This fix is partial because only working when setting the initial URL
   * of the iframe and not when changing it. Also, it has the drawback of temporarily loading the main entry point of the outlet host.
   *
   * @param currUrl - Specifies the URL to be patched.
   * @param prevUrl - Specifies the previous URL, if any.
   *
   * @see https://stackoverflow.com/q/36985731
   */
  protected patchUrl(currUrl: string, prevUrl?: string): string {
    const prevURL = prevUrl && runSafe((): URL => new URL(prevUrl)) || BLANK_URL;
    const currURL = currUrl && runSafe((): URL => new URL(currUrl)) || BLANK_URL;

    // Do not apply the fix for top-level iframes.
    if (window === window.top) {
      return currUrl;
    }

    // Do not apply the fix if the URL already contains query params.
    if (currURL.search) {
      return currUrl;
    }

    // Do not apply the fix when navigating within the same application using hash-based routing.
    if (prevUrl && prevURL.origin === currURL.origin && prevURL.pathname === currURL.pathname) {
      return currUrl;
    }

    // Do not apply the fix when navigating to a blank page.
    if (currURL.toString() === BLANK_URL.toString()) {
      return currUrl;
    }

    // Add an arbitrary but fixed query param to the URL.
    const patchedURL = new URL(currUrl);
    patchedURL.searchParams.set('_', '');
    return patchedURL.toString();
  }
}
