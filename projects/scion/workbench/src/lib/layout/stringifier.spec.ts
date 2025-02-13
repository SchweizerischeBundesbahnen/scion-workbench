/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Exclusion, stringify} from './stringifier';

describe('Stringifier', () => {

  const object = {
    A: 'A',
    B: {
      A: 'B.A',
      B: {
        A: 'B.B.A',
        B: 'B.B.B',
      },
    },
    C: 'C',
    D: {
      A: 'D.A',
      B: 'D.B',
      C: {
        A: 'D.C.A',
        B: 'D.C.B',
        C: 'D.C.C',
        D: 'D.C.D',
        E: 'D.C.E',
        F: [
          {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
          {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
          {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
        ],
      },
      D: [
        {A: 'D.D.0.A', B: 'D.D.0.B'},
        {A: 'D.D.1.A', B: 'D.D.1.B'},
      ],
    },
    E: 'E',
    F: [
      {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
      {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
      {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
    ],
  };

  it('should stringify object (1)', async () => {
    expect(JSON.parse(stringify(null, {exclusions: ['path/to/field']}))).toBeNull();
  });

  it('should stringify object (2)', async () => {
    expect(JSON.parse(stringify(0, {exclusions: ['path/to/field']}))).toBe(0);
  });

  it('should stringify object (3)', async () => {
    expect(JSON.parse(stringify(['a', 'b', 'c'], {exclusions: ['path/to/field']}))).toEqual(['a', 'b', 'c']);
  });

  it('should stringify object (4)', async () => {
    const object = {
      field1: 'text',
      field2: 123,
      field3: true,
      field4: [],
      field5: ['text', 123, true, false, ['a', 'b', 'c']],
    };

    expect(JSON.parse(stringify(object, {exclusions: ['path/to/field']}))).toEqual(object);
  });

  it('should stringify object (5)', async () => {
    const object = {
      field1: null,
      field2: undefined,
    };

    expect(JSON.parse(stringify(object, {exclusions: ['path/to/field']}))).toEqual({field1: null});
  });

  it('should stringify object (6)', async () => {
    expect(JSON.parse(stringify(['a', 'b', 'c'], {exclusions: ['1']}))).toEqual(['a', null, 'c']);
  });

  it('should stringify object (7)', async () => {
    expect(JSON.parse(stringify(object))).toEqual(object);
  });

  it('should stringify object (8)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['A', 'B', 'C', 'D', 'E', 'F']}))).toEqual({});
  });

  it('should stringify object (9)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['B']}))).toEqual({
      A: 'A',
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (10)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['A', 'B']}))).toEqual({
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (11)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['A', 'B', 'D']}))).toEqual({
      C: 'C',
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (12)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['A', 'B', 'D', 'E']}))).toEqual({
      C: 'C',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (13)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['B.B.B', 'B.B.A', 'B.B', 'B.A']}))).toEqual({
      A: 'A',
      B: {},
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (14)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['B.B.B', 'B.B.A', 'B.B', 'B.A', 'B']}))).toEqual({
      A: 'A',
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (15)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['B.B.B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (16)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['B.B.B', 'B.B.A']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {},
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (17)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['B.B.B', 'B.B.A', 'B.B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (18)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['D.C.F.1.B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (19)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['D.C.F.1']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            null,
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (20)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['D.C.F']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (21)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['F.2.B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (22)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/A']}))).toEqual({
      A: 'A',
      B: {
        B: {
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        B: 'D.B',
        C: {
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {B: 'D.D.0.B'},
          {B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {B: 'F.0.B', C: 'F.0.C'},
        {B: 'F.1.B', C: 'F.1.C'},
        {B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (23)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/C/**/B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (24)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/C/**/B', '**/B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
      },
      C: 'C',
      D: {
        A: 'D.A',
        C: {
          A: 'D.C.A',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A'},
          {A: 'D.D.1.A'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', C: 'F.0.C'},
        {A: 'F.1.A', C: 'F.1.C'},
        {A: 'F.2.A', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (25)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/F/*/B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (26)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/F/2', '**/D/0']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            null,
          ],
        },
        D: [
          null,
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (27)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['D/*/B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', B: 'D.C.F.0.B', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', B: 'D.C.F.1.B', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', B: 'D.C.F.2.B', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (28)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['D/**/B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A'},
          {A: 'D.D.1.A'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (29)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/B']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
      },
      C: 'C',
      D: {
        A: 'D.A',
        C: {
          A: 'D.C.A',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
          F: [
            {A: 'D.C.F.0.A', C: 'D.C.F.0.C'},
            {A: 'D.C.F.1.A', C: 'D.C.F.1.C'},
            {A: 'D.C.F.2.A', C: 'D.C.F.2.C'},
          ],
        },
        D: [
          {A: 'D.D.0.A'},
          {A: 'D.D.1.A'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', C: 'F.0.C'},
        {A: 'F.1.A', C: 'F.1.C'},
        {A: 'F.2.A', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (30)', async () => {
    expect(JSON.parse(stringify(object, {exclusions: ['**/F/*']}))).toEqual({
      A: 'A',
      B: {
        A: 'B.A',
        B: {
          A: 'B.B.A',
          B: 'B.B.B',
        },
      },
      C: 'C',
      D: {
        A: 'D.A',
        B: 'D.B',
        C: {
          A: 'D.C.A',
          B: 'D.C.B',
          C: 'D.C.C',
          D: 'D.C.D',
          E: 'D.C.E',
        },
        D: [
          {A: 'D.D.0.A', B: 'D.D.0.B'},
          {A: 'D.D.1.A', B: 'D.D.1.B'},
        ],
      },
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });
});

describe('Stringifier (extended checks)', () => {

  interface Tree {
    id: string;
    root: Node | Leaf;
  }

  class Node {

    public id!: string;
    public type = 'node';
    public child1!: Node | Leaf;
    public child2!: Node | Leaf;

    constructor(node: {id: string; child1: Node | Leaf; child2: Node | Leaf}) {
      Object.assign(this, node);
    }
  }

  class Leaf {

    public id!: string;
    public type = 'leaf';

    constructor(leaf: {id: string}) {
      Object.assign(this, leaf);
    }
  }

  const tree: Tree = {
    id: 'tree',
    root: new Node({
      id: 'node.1',
      child1: new Leaf({id: 'leaf.1'}),
      child2: new Node({
        id: 'node.2',
        child1: new Node({
          id: 'node.3',
          child1: new Leaf({id: 'leaf.2'}),
          child2: new Leaf({id: 'leaf.3'}),
        }),
        child2: new Leaf({id: 'leaf.4'}),
      }),
    }),
  };

  it('should stringify object (1)', async () => {
    expect(JSON.parse(stringify(tree, {exclusions: [{path: '**/id', predicate: objectPath => objectPath.at(-1) instanceof Node}]}))).toEqual({
      id: 'tree',
      root: {
        type: 'node',
        child1: {
          id: 'leaf.1',
          type: 'leaf',
        },
        child2: {
          type: 'node',
          child1: {
            type: 'node',
            child1: {
              id: 'leaf.2',
              type: 'leaf',
            },
            child2: {
              id: 'leaf.3',
              type: 'leaf',
            },
          },
          child2: {
            id: 'leaf.4',
            type: 'leaf',
          },
        },
      },
    });
  });

  it('should stringify object (2)', async () => {
    expect(JSON.parse(stringify(tree, {exclusions: [{path: '**/id', predicate: objectPath => objectPath.at(-1) instanceof Leaf}]}))).toEqual({
      id: 'tree',
      root: {
        id: 'node.1',
        type: 'node',
        child1: {
          type: 'leaf',
        },
        child2: {
          id: 'node.2',
          type: 'node',
          child1: {
            id: 'node.3',
            type: 'node',
            child1: {
              type: 'leaf',
            },
            child2: {
              type: 'leaf',
            },
          },
          child2: {
            type: 'leaf',
          },
        },
      },
    });
  });

  it('should stringify object (3)', async () => {
    expect(JSON.parse(stringify(tree, {exclusions: [{path: '**/child1/id', predicate: objectPath => objectPath.at(-1) instanceof Node}]}))).toEqual({
      id: 'tree',
      root: {
        id: 'node.1',
        type: 'node',
        child1: {
          id: 'leaf.1',
          type: 'leaf',
        },
        child2: {
          id: 'node.2',
          type: 'node',
          child1: {
            type: 'node',
            child1: {
              id: 'leaf.2',
              type: 'leaf',
            },
            child2: {
              id: 'leaf.3',
              type: 'leaf',
            },
          },
          child2: {
            id: 'leaf.4',
            type: 'leaf',
          },
        },
      },
    });
  });

  it('should stringify object (4)', async () => {
    expect(JSON.parse(stringify(tree, {exclusions: [{path: '**/child2/id', predicate: objectPath => objectPath.at(-1) instanceof Node}]}))).toEqual({
      id: 'tree',
      root: {
        id: 'node.1',
        type: 'node',
        child1: {
          id: 'leaf.1',
          type: 'leaf',
        },
        child2: {
          type: 'node',
          child1: {
            id: 'node.3',
            type: 'node',
            child1: {
              id: 'leaf.2',
              type: 'leaf',
            },
            child2: {
              id: 'leaf.3',
              type: 'leaf',
            },
          },
          child2: {
            id: 'leaf.4',
            type: 'leaf',
          },
        },
      },
    });
  });

  it('should stringify object (5)', async () => {
    const exclusions: Array<Exclusion | string> = [
      'root/id',
      {path: '**/child2/id', predicate: objectPath => objectPath.at(-1) instanceof Leaf},
      {path: '**/type', predicate: objectPath => objectPath.at(-1) instanceof Node},
    ];
    expect(JSON.parse(stringify(tree, {exclusions}))).toEqual({
      id: 'tree',
      root: {
        child1: {
          id: 'leaf.1',
          type: 'leaf',
        },
        child2: {
          id: 'node.2',
          child1: {
            id: 'node.3',
            child1: {
              id: 'leaf.2',
              type: 'leaf',
            },
            child2: {
              type: 'leaf',
            },
          },
          child2: {
            type: 'leaf',
          },
        },
      },
    });
  });
});

describe('Stringifier (property order)', () => {
  it('should not sort properties by default', async () => {
    const given = {
      c: 'c',
      b: {
        c: 'c',
        b: 'b',
        a: 'a',
      },
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given)) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['c', 'b', 'a']);
    expect(Object.keys(deserialized.b)).toEqual(['c', 'b', 'a']);
  });

  it('should sort properties', async () => {
    const given = {
      c: 'c',
      b: {
        c: 'c',
        b: 'b',
        a: 'a',
      },
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given, {sort: true})) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['a', 'b', 'c']);
    expect(Object.keys(deserialized.b)).toEqual(['a', 'b', 'c']);
  });

  it('should not sort Array', async () => {
    const given = {
      c: 'c',
      b: ['c', 'b', 'a'],
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given, {sort: true})) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['a', 'b', 'c']);
    expect(deserialized.b).toEqual(['c', 'b', 'a']);
  });

  it('should not sort Map', async () => {
    const given = {
      c: 'c',
      b: new Map().set('c', 'c').set('b', 'b').set('a', 'a'),
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given, {sort: true})) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['a', 'b', 'c']);
    expect<unknown>(deserialized.b).toEqual({});
  });

  it('should not sort Set', async () => {
    const given = {
      c: 'c',
      b: new Set().add('c').add('b').add('a'),
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given, {sort: true})) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['a', 'b', 'c']);
    expect<unknown>(deserialized.b).toEqual({});
  });

  it('should not sort `null`', async () => {
    const given = {
      c: 'c',
      b: null,
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given, {sort: true})) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['a', 'b', 'c']);
    expect(deserialized.b).toEqual(null);
  });

  it('should not sort `undefined`', async () => {
    const given = {
      c: 'c',
      b: undefined,
      a: 'a',
    };

    const deserialized = JSON.parse(stringify(given, {sort: true})) as typeof given;
    expect(Object.keys(deserialized)).toEqual(['a', 'c']);
    expect(deserialized.b).toEqual(undefined);
  });
});
