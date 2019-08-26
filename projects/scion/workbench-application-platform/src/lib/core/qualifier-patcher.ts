/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NilQualifier, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Returns a copy of the given intent qualifier with all its wildcard qualifier values
 * replaced with values of the given capability qualifier, if any.
 * Also, if the intent qualifier specifies a wildcard key, it is merged with the capability qualifier.
 *
 * @param intentQualifier
 *        qualifier for an intent as specified in the manifest, may contain wildcards as qualifier key (*)
 *        and/or qualifier value (* or ?).
 * @param capabilityQualifier
 *        qualifier for a capability as specified in the manifest, may contain wildcards (* or ?) as qualifier value;
 *        if `null`, {NilQualifier} is used.
 */
export function patchQualifier(intentQualifier: Qualifier, capabilityQualifier: Qualifier): Qualifier {
  if (!intentQualifier || !capabilityQualifier) {
    return intentQualifier || NilQualifier;
  }

  // Create a working copy of the intent qualifier
  const _intentQualifier: Qualifier = {...intentQualifier};
  delete _intentQualifier['*'];

  Object.keys(capabilityQualifier)
    .forEach(key => {
      if (intentQualifier[key] === '*' || intentQualifier[key] === '?') {
        _intentQualifier[key] = capabilityQualifier[key];
      }
      else if (intentQualifier.hasOwnProperty('*') && !intentQualifier.hasOwnProperty(key)) {
        _intentQualifier[key] = capabilityQualifier[key];
      }
    });

  return _intentQualifier;
}
