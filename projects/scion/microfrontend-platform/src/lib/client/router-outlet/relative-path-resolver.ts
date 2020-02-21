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
 * Used by {@link OutletRouter} to convert relative paths to absolute paths.
 *
 * Replace this bean to use a different relative path resolution strategy.
 *
 * @see {@link OutletRouter}
 * @category Routing
 */
export class RelativePathResolver {

  /**
   * Converts the given relative path into a navigable URL with relative symbols like `/`, `./`, or `../` resolved.
   *
   * @param  path - Specifies the path which to convert into an absolute path.
   * @param  options - Specifies to which path the given path is relative to.
   * @return the absolute path.
   */
  public resolve(path: string, options: { relativeTo: string }): string {
    const relativeToUrl = new URL(options.relativeTo);
    const isHashBasedRouting = relativeToUrl.hash && relativeToUrl.hash.startsWith('#/');

    const absolutePath = new URL(path, relativeToUrl.origin);
    if (isHashBasedRouting) {
      const relativeToPath = this.truncateQueryParamsAndFragment(relativeToUrl.hash.substring(1));
      absolutePath.pathname = relativeToUrl.pathname;
      absolutePath.search = '';
      absolutePath.hash = this.computeNavigationPath(path, {relativeTo: relativeToPath});
    }
    else {
      const pathname = this.truncateQueryParamsAndFragment(path); // truncate the path as query params and fragment are already contained in the URL
      absolutePath.pathname = this.computeNavigationPath(pathname, {relativeTo: relativeToUrl.pathname});
    }

    return absolutePath.toString();
  }

  /**
   * Removes query params and the fragment from the given path, if any.
   */
  protected truncateQueryParamsAndFragment(path: string): string {
    const fragmentIndex = path.indexOf('#');
    if (fragmentIndex !== -1) {
      path = path.substring(0, fragmentIndex);
    }

    const queryParamIndex = path.indexOf('?');
    if (queryParamIndex !== -1) {
      path = path.substring(0, queryParamIndex);
    }
    return path;
  }

  /**
   * Computes the absolute path for the given path, with all navigational symbols, if any, resolved.
   * Supported navigational symbols are  `/`, `../` and `./`.
   */
  protected computeNavigationPath(path: string, options: { relativeTo: string }): string {
    const segments = path
      .split('/')
      .reduce((location, segment, index) => {
        switch (segment) {
          case '': { // '/segment'
            return (index === 0) ? [] : location;
          }
          case '.': { // './segment'
            return location;
          }
          case '..': { // '../segment'
            return location.slice(0, -1);
          }
          default: {
            return location.concat(segment);
          }
        }
      }, options.relativeTo.split('/').filter(Boolean));

    return `/${segments.join('/')}`;
  }
}

