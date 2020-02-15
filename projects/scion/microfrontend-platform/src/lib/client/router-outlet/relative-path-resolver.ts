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
   * @param  relativePath - Specifies the relative path to be converted into an absolute path.
   * @param  params - Specifies the path which the given `relativePath` is relative to.
   * @return converted absolute path.
   */
  public resolve(relativePath: string, params: { relativeTo: string }): string {
    const relativeToLocation = new URL(params.relativeTo);
    const hashBasedRouting = relativeToLocation.hash && relativeToLocation.hash.startsWith('#/');

    const url = new URL(relativePath, relativeToLocation.origin);
    if (hashBasedRouting) {
      const truncatedRelativeToPath = this.truncateQueryParamsAndFragment(relativeToLocation.hash.substring(1));
      url.pathname = relativeToLocation.pathname;
      url.search = '';
      url.hash = this.computeNavigationPath(relativePath, {relativeTo: truncatedRelativeToPath});
    }
    else {
      const truncatedPath = this.truncateQueryParamsAndFragment(relativePath); // truncate the path as query params and fragment are already contained in the URL
      url.pathname = this.computeNavigationPath(truncatedPath, {relativeTo: relativeToLocation.pathname});
    }
    return url.toString();
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
   * Computes the absolute path for the given relative path, with all navigational symbols, if any,
   * resolved. Supported navigational symbols are  `/`, `../` and `./`.
   */
  protected computeNavigationPath(relativePath: string, params: { relativeTo: string }): string {
    const segments = relativePath
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
      }, params.relativeTo.split('/').filter(Boolean));

    return `/${segments.join('/')}`;
  }
}
