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
 * Matcher function to test if two qualifiers matches.
 */
export type QualifierMatcher = (qualifier1: Qualifier, qualifier2: Qualifier) => boolean;

/**
 * Tests if the given qualifiers are equal.
 */
export function isEqualQualifier(qualifier1: Qualifier, qualifier2: Qualifier): boolean {
  qualifier1 = qualifier1 || NilQualifier;
  qualifier2 = qualifier2 || NilQualifier;

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

/**
 * Tests if the given intent qualifier matches the given intention qualifier.
 *
 * The intent qualifier must be exact, i.e. not contain wildcards. This in contrast to the intention qualifier
 * where wildcards are allowed.
 *
 * @param intentionQualifier
 *        qualifier as specified in the manifest, may contain wildcards (*) as qualifier key and wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 * @param intentQualifier
 *        the qualifier to test against the intent qualifier; must not contain wildcards, or if it does, they are interpreted as values;
 *        if `null`, {NilQualifier} is used.
 */
export function matchesIntentQualifier(intentionQualifier: Qualifier, intentQualifier: Qualifier): boolean {
  intentionQualifier = intentionQualifier || NilQualifier;
  intentQualifier = intentQualifier || NilQualifier;

  // Test if testee has all required entries
  if (!Object.keys(intentionQualifier).filter(key => key !== '*').every(key => intentionQualifier[key] === '?' || intentQualifier.hasOwnProperty(key))) {
    return false;
  }

  // Test if testee has no additional entries
  if (!intentionQualifier.hasOwnProperty('*') && !Object.keys(intentQualifier).every(key => intentionQualifier.hasOwnProperty(key))) {
    return false;
  }

  return Object.keys(intentionQualifier)
    .filter(key => key !== '*')
    .every(key => {
      if (intentionQualifier[key] === '*') {
        return intentQualifier[key] !== undefined && intentQualifier[key] !== null;
      }
      if (intentionQualifier[key] === '?') {
        return true;
      }
      return intentionQualifier[key] === intentQualifier[key];
    });
}

/**
 * Tests if the given qualifiers match, allowing wildcards (* and ?) in both of them.
 *
 * @param qualifier
 *        qualifier as specified in the manifest, may contain wildcards (*) as qualifier key and wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 * @param testee
 *        the qualifier to test against the above qualifier; may contain wildcards (*) as qualifier key and wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 */
export function matchesWildcardQualifier(qualifier: Qualifier, testee: Qualifier): boolean {
  qualifier = qualifier || NilQualifier;
  testee = testee || NilQualifier;

  // Test if testee has all required entries
  if (!testee.hasOwnProperty('*') && !Object.keys(qualifier).filter(key => key !== '*').every(key => qualifier[key] === '?' || testee.hasOwnProperty(key))) {
    return false;
  }

  // Test if testee has no additional entries
  if (!qualifier.hasOwnProperty('*') && !Object.keys(testee).filter(key => key !== '*').every(key => testee[key] === '?' || qualifier.hasOwnProperty(key))) {
    return false;
  }

  return Object.keys(qualifier)
    .filter(key => key !== '*')
    .every(key => {
      if (qualifier[key] === '*' && !testee.hasOwnProperty('*')) {
        return testee[key] !== undefined && testee[key] !== null;
      }
      if (qualifier[key] === '?' || testee[key] === '?' || testee[key] === '*' || testee.hasOwnProperty('*')) {
        return true;
      }
      return qualifier[key] === testee[key];
    });
}
