/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Maps } from '@scion/toolkit/util';

describe('Maps', () => {

  describe('Maps.addMultiValue', () => {

    it('should allow adding values', () => {
      const map = new Map();
      expect(Maps.addMultiValue(map, 'keydown', 'a')).toBe(map);
      expect(Maps.addMultiValue(map, 'keydown', 'b')).toBe(map);
      expect(Maps.addMultiValue(map, 'keydown', 'c')).toBe(map);
      expect(Maps.addMultiValue(map, 'keyup', 'x')).toBe(map);
      expect(Maps.addMultiValue(map, 'keyup', 'y')).toBe(map);
      expect(Maps.addMultiValue(map, 'keypress', 'k')).toBe(map);
      expect(Maps.addMultiValue(map, 'keypress', 'l')).toBe(map);

      expect(map).toEqual(new Map()
        .set('keydown', new Set(['a', 'b', 'c']))
        .set('keyup', new Set(['x', 'y']))
        .set('keypress', new Set(['k', 'l'])));
    });
  });

  describe('Maps.removeMultiValue', () => {

    it('should allow removing values', () => {
      const map = new Map();
      Maps.addMultiValue(map, 'keydown', 'a');
      Maps.addMultiValue(map, 'keydown', 'b');
      Maps.addMultiValue(map, 'keydown', 'c');
      Maps.addMultiValue(map, 'keyup', 'x');
      Maps.addMultiValue(map, 'keyup', 'y');
      Maps.addMultiValue(map, 'keypress', 'k');
      Maps.addMultiValue(map, 'keypress', 'l');

      // Remove a value
      expect(Maps.removeMultiValue(map, 'keyup', 'x')).toEqual(true);
      expect(map).toEqual(new Map()
        .set('keydown', new Set(['a', 'b', 'c']))
        .set('keyup', new Set(['y']))
        .set('keypress', new Set(['k', 'l'])));

      // Remove a value
      expect(Maps.removeMultiValue(map, 'keyup', 'y')).toEqual(true);
      expect(map).toEqual(new Map()
        .set('keydown', new Set(['a', 'b', 'c']))
        .set('keypress', new Set(['k', 'l'])));

      // Remove a value not contained in the Map
      expect(Maps.removeMultiValue(map, 'keyup', 'y')).toEqual(false);
      expect(Maps.removeMultiValue(map, 'click', 'div')).toEqual(false);
    });
  });

  describe('Maps.hasMultiValue', () => {

    it('should allow testing if a value is contained in the map', () => {
      const map = new Map();
      Maps.addMultiValue(map, 'keydown', 'a');
      Maps.addMultiValue(map, 'keydown', 'b');
      Maps.addMultiValue(map, 'keydown', 'c');
      Maps.addMultiValue(map, 'keyup', 'x');
      Maps.addMultiValue(map, 'keyup', 'y');
      Maps.addMultiValue(map, 'keypress', 'k');
      Maps.addMultiValue(map, 'keypress', 'l');

      expect(Maps.hasMultiValue(map, 'keyup', 'x')).toEqual(true);
      expect(Maps.hasMultiValue(map, 'keyup', 'a')).toEqual(false);
      expect(Maps.hasMultiValue(map, 'click', 'div')).toEqual(false);
    });
  });
});
