/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Params } from '@angular/router';
import { Qualifier } from './platform.model';

const QUERY_PARAM_KEY = 'queryParams';
const MATRIX_PARAM_KEY = 'matrixParams';
const ABSOLUTE_URL_REGEX = new RegExp('^http[s]?:\/\/');

export class Url {

  private constructor() {
  }

  /**
   * Replaces variables in the given path with values of the given qualifier.
   *
   * Returns the substituted path as path segments.
   */
  public static substitutePathVariables(path: string, qualifier: Qualifier): string[] {
    if (!qualifier) {
      return Url.toSegments(path);
    }
    return Url.toSegments(path).map(segment => `${segment.startsWith(':') && qualifier[segment.substr(1)] || segment}`);
  }

  /**
   * Replaces variables in the given params with values of the given qualifier.
   *
   * Returns the substituted params object.
   */
  public static substituteParamVariables(params: Params, qualifier: Qualifier): Params {
    if (!params || !qualifier) {
      return params;
    }

    return Object.keys(params).reduce((acc, paramKey) => {
      const paramValue = params[paramKey];
      acc[paramKey] = typeof paramValue === 'string' && paramValue.startsWith(':') && qualifier[paramValue.substr(1)] || paramValue;
      return acc;
    }, {});
  }

  /**
   * Creates a matrix param object which contains given query params and matrix params.
   * The object returned can be given to Angular router's navigate method.
   *
   * @see readMatrixParamObject
   */
  public static writeMatrixParamObject(params: { queryParams?: Params; matrixParams?: Params; }): any | null {
    const serialized = {};

    if (params.queryParams && Object.keys(params.queryParams).length > 0) {
      serialized[QUERY_PARAM_KEY] = JSON.stringify(params.queryParams);
    }
    if (params.matrixParams && Object.keys(params.matrixParams).length > 0) {
      serialized[MATRIX_PARAM_KEY] = JSON.stringify(params.matrixParams);
    }
    return Object.keys(serialized).length ? serialized : null;
  }

  /**
   * Reads query and matrix params from routing parameters.
   *
   * @see writeMatrixParamObject
   */
  public static readMatrixParamObject(params: Params): { queryParams?: Params; matrixParams?: Params; } {
    return {
      queryParams: params[QUERY_PARAM_KEY] && JSON.parse(params[QUERY_PARAM_KEY]),
      matrixParams: params[MATRIX_PARAM_KEY] && JSON.parse(params[MATRIX_PARAM_KEY]),
    };
  }

  /**
   * Creates the URL which consists of the given segments.
   */
  public static createUrl(segments: { base: string; path: string[]; matrixParams?: Params; queryParams?: Params }): string {
    //  localhost:4200/foobar/foo/bar;foobar=foobar;foo=foo;bar=bar?foobar=foobar&foo=foo&bar=bar
    // |<    base    >|<    path    >|<       matrix params       >|<       query params        >|

    const trailSlashRegex = /\/+$/;
    let url = `${segments.base.replace(trailSlashRegex, '')}/${segments.path.join('/')}`.replace(trailSlashRegex, '');

    const matrixParams = segments.matrixParams;
    if (matrixParams && Object.keys(matrixParams).length) {
      url += `;${Object.keys(matrixParams).map(key => `${key}=${matrixParams[key]}`).join(';')}`;
    }

    const queryParams = segments.queryParams;
    if (queryParams && Object.keys(queryParams).length) {
      url += `?${Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&')}`;
    }
    return url;
  }

  /**
   * Returns `true` if given URL is an absolute URL.
   */
  public static isAbsoluteUrl(url: string): boolean {
    return ABSOLUTE_URL_REGEX.test(url);
  }

  /**
   * Returns the segments of the given path.
   */
  public static toSegments(path: string): string[] {
    return path && path.split('/').filter(Boolean) || [];
  }
}
