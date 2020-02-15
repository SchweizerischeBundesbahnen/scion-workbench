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
import { MessageClient } from '../messaging/message-client';
import { OUTLET_CONTEXT, OutletContext, RouterOutlets } from './router-outlet.element';
import { ContextService } from '../context/context-service';
import { take } from 'rxjs/operators';
import { Urls } from '../../url.util';
import { RelativePathResolver } from './relative-path-resolver';

/**
 * Allows navigating to a site in a {@link SciRouterOutletElement `<sci-router-outlet>`} element.
 *
 * Any site can be navigated to unless having set the HTTP header `X-Frame-Options`. If not specifying an outlet when navigating, then the navigation
 * refers to the outlet of the current outlet context, if any, or to the {@link RouterOutlets.PRIMARY_OUTLET primary} outlet otherwise. If multiple
 * outlets have the same name, then they all show the same content. To clear an outlet's content, use `null` as the URL when navigating.
 *
 * The outlet does not necessarily have to exist at the time of the navigation. When the outlet is added to the DOM, it will display the last URL
 * navigated for it. When navigation is repeated for an outlet, its content is replaced.
 *
 * #### Browser history
 * Outlet navigation does not create entries in the browser history. You can override this behavior by registering a custom {@link RouterOutletUrlAssigner}
 * in the {@link Beans bean manager}.
 *
 * #### Persistent navigation
 * The platform does not support persistent navigation out-of-the-box, because depending on the application, a different persistence strategy is imaginable.
 * However, you can easily implement persistent navigation yourself as the navigation is topic-based. By subscribing to the wildcard topic `sci-router-outlets/:outlet/url`,
 * all navigations can be listened to and persisted accordingly. The persisted URLs can then be replayed via {@link OutletRouter.navigate} when starting the host app.
 *
 * #### Hash-based routing preferred
 * The platform recommends using *hash-based routing* over *HTML 5 push-state routing* for microfrontends integrated into the platform; this because the router sets the
 * URL externally, which, when navigating within the same app, would otherwise cause the application to load anew. Hash-based routing works around this behavior because
 * it uses the fragment part (`#`) of the URL to simulate different routes, not causing the user agent to load the site anew.
 *
 * @see {@link SciRouterOutletElement}
 *
 * @category Routing
 */
export class OutletRouter {

  /**
   * Navigates to the given URL in the given outlet. If not specifying an outlet when navigating, then the navigation
   * refers to the outlet of the current outlet context, if any, or to the {@link RouterOutlets.PRIMARY_OUTLET primary}
   * outlet otherwise.
   *
   * @param  url - Specifies the URL which to display in the outlet. To clear the outlet's content, use `null` as the URL.
   * @param  options - Controls navigation, e.g. in which outlet to navigate.
   * @return a Promise that resolves when navigated.
   */
  public async navigate(url: string | null, options?: NavigationOptions): Promise<never> {
    const outlet = await this.resolveOutlet(options);
    const outletUrlTopic = RouterOutlets.urlTopic(outlet);
    const navigationUrl = this.computeNavigationUrl(url);
    const messageClient = options && options.messageClient || Beans.get(MessageClient);

    return messageClient.publish$(outletUrlTopic, navigationUrl, {retain: true}).toPromise();
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
    const outletContext = await Beans.get(ContextService).observe$<OutletContext>(OUTLET_CONTEXT).pipe(take(1)).toPromise();
    if (outletContext) {
      return outletContext.name;
    }

    // Otherwise, navigate in the primary outlet.
    return RouterOutlets.PRIMARY_OUTLET;
  }
}

/**
 * Options to control outlet navigation.
 *
 * @category Routing
 */
export interface NavigationOptions {
  /**
   * Specifies the outlet in which you want to navigate. If not specifying an outlet, then the navigation refers to the outlet of the current
   * outlet context, if any, or to the {@link RouterOutlets.PRIMARY_OUTLET primary} outlet otherwise.
   */
  outlet?: string;
  /**
   * @internal
   */
  messageClient?: MessageClient;
}
