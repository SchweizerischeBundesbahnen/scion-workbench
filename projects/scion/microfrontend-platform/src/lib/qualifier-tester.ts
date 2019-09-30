/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NilQualifier, Qualifier } from './platform.model';

/**
 * Tests if the given qualifier matches the capability qualifier.
 *
 * @param capabilityQualifier
 *        qualifier for a capability as specified in the manifest, may contain wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 * @param testee
 *        the qualifier to test against the capability qualifier; must not contain wildcards.
 */
export function matchesCapabilityQualifier(capabilityQualifier: Qualifier, testee: Qualifier): boolean {
  const _capabilityQualifier = capabilityQualifier || NilQualifier;
  const _testee = testee || NilQualifier;
  if (_capabilityQualifier.hasOwnProperty('*')) {
    throw Error(`[IllegalCapabilityKeyError] Capability qualifiers do not support \`*\` as key`);
  }

  // Test if testee has all required entries
  if (!Object.keys(_capabilityQualifier).every(key => _capabilityQualifier[key] === '?' || _testee.hasOwnProperty(key))) {
    return false;
  }

  // Test if testee has no additional entries
  if (!Object.keys(_testee).every(key => _capabilityQualifier.hasOwnProperty(key))) {
    return false;
  }

  return Object.keys(_capabilityQualifier)
    .every(key => {
      if (_capabilityQualifier[key] === '*') {
        return _testee[key] !== undefined && _testee[key] !== null;
      }
      if (_capabilityQualifier[key] === '?') {
        return true;
      }
      return _capabilityQualifier[key] === _testee[key];
    });
}

/**
 * Tests if the given qualifier matches the intent qualifier.
 *
 * @param intentQualifier
 *        qualifier as specified in the manifest, may contain wildcards (*) as qualifier key or/and wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 * @param testee
 *        the qualifier to test against the intent qualifier; must not contain wildcards
 */
export function matchesIntentQualifier(intentQualifier: Qualifier, testee: Qualifier): boolean {
  const _intentQualifier = intentQualifier || NilQualifier;
  const _testee = testee || NilQualifier;

  // Test if testee has all required entries
  if (!Object.keys(_intentQualifier).filter(key => key !== '*').every(key => _intentQualifier[key] === '?' || _testee.hasOwnProperty(key))) {
    return false;
  }

  // Test if testee has no additional entries
  if (!_intentQualifier.hasOwnProperty('*') && !Object.keys(_testee).every(key => _intentQualifier.hasOwnProperty(key))) {
    return false;
  }

  return Object.keys(_intentQualifier)
    .filter(key => key !== '*')
    .every(key => {
      if (_intentQualifier[key] === '*') {
        return _testee[key] !== undefined && _testee[key] !== null;
      }
      if (_intentQualifier[key] === '?') {
        return true;
      }
      return _intentQualifier[key] === _testee[key];
    });
}

/**
 * Tests if the given qualifies are equal.
 */
export function isEqualQualifier(qualifier1: Qualifier, qualifier2: Qualifier): boolean {
  // Test if same instance
  if (qualifier1 === qualifier2) {
    return true;
  }

  // Test if one of the qualifiers is undefined
  if (!qualifier1 || !qualifier2) {
    return false;
  }

  // Test if qualifier2 has all required entries
  if (!Object.keys(qualifier1).every(key => qualifier2.hasOwnProperty(key))) {
    return false;
  }

  // Test if qualifier2 has no additional entries
  if (!Object.keys(qualifier2).every(key => qualifier1.hasOwnProperty(key))) {
    return false;
  }

  // Test if values match
  return Object.keys(qualifier1).every(key => qualifier1[key] === qualifier2[key]);
}
