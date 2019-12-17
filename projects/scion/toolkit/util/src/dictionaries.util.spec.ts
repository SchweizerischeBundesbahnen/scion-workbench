/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Dictionaries } from './dictionaries.util';

fdescribe('Dictionaries', () => {

  describe('Dictionaries.toDictionary', () => {

    it('should create a new dictionary from a Map', () => {
      const map = new Map()
        .set('firstname', 'John')
        .set('lastname', 'Smith')
        .set('age', 42)
        .set('male', true);
      expect(Dictionaries.toDictionary(map)).toEqual({firstname: 'John', lastname: 'Smith', age: 42, male: true});
    });

    it('should return `null` for a `null` Map', () => {
      expect(Dictionaries.toDictionary(null)).toBeNull();
    });

    it('should return `null` for an `undefined` Map', () => {
      expect(Dictionaries.toDictionary(undefined)).toBeUndefined();
    });
  });

  describe('Dictionaries.toMap', () => {

    it('should create a new Map from a dictionary', () => {
      const dictionary = {firstname: 'John', lastname: 'Smith', age: 42, male: true};
      expect(Dictionaries.toMap(dictionary)).toEqual(new Map().set('firstname', 'John').set('lastname', 'Smith').set('age', 42).set('male', true));
    });

    it('should return `null` for a `null` dictionary', () => {
      expect(Dictionaries.toMap(null)).toBeNull();
    });

    it('should return `null` for an `undefined` dictionary', () => {
      expect(Dictionaries.toMap(undefined)).toBeUndefined();
    });
  });
});
