/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Beans } from '../../bean-manager';
import { MessageClient } from '../message-client';
import { OutletContext, RouterOutlets } from './router-outlet.element';
import { ContextService } from '../context/context-service';
import { take } from 'rxjs/operators';
import { Urls } from '../../url.util';
import { RelativePathResolver } from './relative-path-resolver';

/**
 * Allows navigating to a site in a router outlet.
 *
 * The content can be any web content allowed to be embedded in an iframe, that is which has the HTTP response header 'X-Frame-Options' not set.
 *
 * The outlet does not necessarily have to exist for navigation yet. As soon as the outlet is mounted, the last routed URL for that outlet
 * is loaded and displayed. When navigation is repeated for an outlet, its content is replaced.
 */
export class OutletRouter {

  /**
   * Navigates to the given URL in the given outlet. If not specifying an outlet, it defaults to the primary outlet.
   *
   * @param url
   *        Specifies the URL which to display in the outlet. To clear the outlet's content, use `null` as the URL.
   * @param options
   *        Controls navigation, e.g. in which outlet to navigate.
   */
  public async navigate(url: string | null, options?: NavigationOptions): Promise<void> {
    const outlet = await this.resolveOutlet(options);
    const outletUrlTopic = RouterOutlets.outletUrlTopic(outlet);
    const navigationUrl = this.computeNavigationUrl(url);
    const messageClient = options && options.messageClient || Beans.get(MessageClient);

    return messageClient.publish$(outletUrlTopic, navigationUrl, {retain: true})
      .toPromise()
      .then(() => Promise.resolve()); // do not emit `undefined` as resolved value.
  }

  private computeNavigationUrl(url: string): string {
    if (!url) {
      return 'about:blank';
    }
    if (Urls.isAbsoluteUrl(url)) {
      return url;
    }
    else {
      // Resolve the URL relative to the current window location.
      return Beans.get(RelativePathResolver).resolve(url, {relativeTo: window.location.href});
    }
  }

  private async resolveOutlet(options: NavigationOptions): Promise<string> {
    const outlet = options && options.outlet;
    if (outlet) {
      return outlet;
    }

    // If no outlet is specified, navigate in the current outlet, if any.
    const outletContext = await Beans.get(ContextService).observe$<OutletContext>(RouterOutlets.OUTLET_CONTEXT).pipe(take(1)).toPromise();
    if (outletContext) {
      return outletContext.name;
    }

    // Otherwise, navigate in the primary outlet.
    return RouterOutlets.PRIMARY_OUTLET;
  }
}

/**
 * Options that modify the navigation strategy.
 */
export interface NavigationOptions {
  /**
   * Specifies which outlet to navigate. If not specified, it defaults to the primary outlet.
   */
  outlet?: string;
  /**
   * @internal
   */
  messageClient?: MessageClient;
}
