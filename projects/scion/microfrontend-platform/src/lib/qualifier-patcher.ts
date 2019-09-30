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
 * Returns a copy of the given qualifier with all its wildcard qualifier values replaced with values of the given capability qualifier, if any.
 * Also, if the qualifier specifies a wildcard key, it is merged with the capability qualifier.
 *
 * @param qualifier
 *        qualifier, which may contain wildcards as qualifier key (*) and/or qualifier value (* or ?).
 * @param capabilityQualifier
 *        qualifier for a capability as specified in the manifest, may contain wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 */
export function patchQualifier(qualifier: Qualifier, capabilityQualifier: Qualifier): Qualifier {
  if (!qualifier || !capabilityQualifier) {
    return qualifier || NilQualifier;
  }

  // Create a working copy of the intent qualifier
  const _intentQualifier: Qualifier = {...qualifier};
  delete _intentQualifier['*'];

  Object.keys(capabilityQualifier)
    .forEach(key => {
      if (qualifier[key] === '*' || qualifier[key] === '?') {
        _intentQualifier[key] = capabilityQualifier[key];
      }
      else if (qualifier.hasOwnProperty('*') && !qualifier.hasOwnProperty(key)) {
        _intentQualifier[key] = capabilityQualifier[key];
      }
    });

  return _intentQualifier;
}
