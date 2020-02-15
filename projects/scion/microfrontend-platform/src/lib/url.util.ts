/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/** @ignore **/
const ABSOLUTE_URL_REGEX = new RegExp('^http[s]?:\/\/');

/**
 * @ignore
 */
export class Urls {

  private constructor() {
  }

  /**
   * Returns `true` if the given URL is an absolute URL or the 'about:blank' page.
   */
  public static isAbsoluteUrl(url: string): boolean {
    return url === 'about:blank' || ABSOLUTE_URL_REGEX.test(url);
  }
}
