/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {UrlSegment} from '@angular/router';
import {Objects} from '@scion/toolkit/util';

/**
 * Matches an array of URL segments against another array of URL segments.
 *
 * Flags:
 * - matchWildcardPath: Indicates if wildcard path matching is enabled. If enabled, the asterisk `*` path matches any path of the segment.
 * - matchMatrixParams: Controls whether to match matrix parameters.
 */
export class UrlSegmentMatcher {

  constructor(private _pattern: UrlSegment[], private _flags: {matchWildcardPath: boolean; matchMatrixParams: boolean}) {
  }

  /**
   * Matches given array of URL segments.
   */
  public matches(segments: UrlSegment[]): boolean {
    if (segments === this._pattern) {
      return true;
    }

    if (segments.length !== this._pattern.length) {
      return false;
    }

    return segments.every((segment, index) => {
      const checkMatrixParams = this._flags.matchMatrixParams;
      const checkPath = !this._flags.matchWildcardPath || this._pattern[index]!.path !== '*';

      if (checkPath && segment.path !== this._pattern[index]!.path) {
        return false;
      }
      if (checkMatrixParams && !Objects.isEqual(segment.parameters, this._pattern[index]!.parameters)) {
        return false;
      }
      return true;
    });
  }
}
