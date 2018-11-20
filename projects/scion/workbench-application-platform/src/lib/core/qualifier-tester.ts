/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NilQualifier, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Tests if the qualifier matches the qualifier pattern.
 *
 * @param pattern
 *        qualifier as specified in the manifest, may contain wildcards as qualifier key or/and qualifier value;
 *        if `null`, {AnyQualifier} is used.
 * @param testee
 *        the qualifier to match the pattern; must not contain wildcards
 */
export function testQualifier(pattern: Qualifier, testee: Qualifier): boolean {
  const _pattern = pattern || NilQualifier;
  const _testee = testee || NilQualifier;
  if (!_pattern.hasOwnProperty('*') && Object.keys(_pattern).sort().join(',') !== Object.keys(_testee).sort().join(',')) {
    return false;
  }

  return Object.keys(_pattern)
    .filter(key => key !== '*')
    .every(key => {
      if (_pattern[key] === '*') {
        return _testee[key] !== undefined && _testee[key] !== null;
      }
      return _pattern[key] === _testee[key];
    });
}
