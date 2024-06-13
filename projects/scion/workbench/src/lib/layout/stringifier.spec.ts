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
    expect(JSON.parse(stringify(null))).toBeNull();
  });

  it('should stringify object (2)', async () => {
    expect(JSON.parse(stringify(0))).toBe(0);
  });

  it('should stringify object (3)', async () => {
    expect(JSON.parse(stringify(['a', 'b', 'c']))).toEqual(['a', 'b', 'c']);
  });

  it('should stringify object (4)', async () => {
    expect(JSON.parse(stringify(['a', 'b', 'c'], ['1']))).toEqual(['a', null, 'c']);
  });

  it('should stringify object (5)', async () => {
    expect(JSON.parse(stringify(object))).toEqual(object);
  });

  it('should stringify object (6)', async () => {
    expect(JSON.parse(stringify(object, ['A', 'B', 'C', 'D', 'E', 'F']))).toEqual({});
  });

  it('should stringify object (7)', async () => {
    expect(JSON.parse(stringify(object, ['B']))).toEqual({
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

  it('should stringify object (8)', async () => {
    expect(JSON.parse(stringify(object, ['A', 'B']))).toEqual({
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

  it('should stringify object (9)', async () => {
    expect(JSON.parse(stringify(object, ['A', 'B', 'D']))).toEqual({
      C: 'C',
      E: 'E',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (10)', async () => {
    expect(JSON.parse(stringify(object, ['A', 'B', 'D', 'E']))).toEqual({
      C: 'C',
      F: [
        {A: 'F.0.A', B: 'F.0.B', C: 'F.0.C'},
        {A: 'F.1.A', B: 'F.1.B', C: 'F.1.C'},
        {A: 'F.2.A', B: 'F.2.B', C: 'F.2.C'},
      ],
    });
  });

  it('should stringify object (11)', async () => {
    expect(JSON.parse(stringify(object, ['B.B.B', 'B.B.A', 'B.B', 'B.A']))).toEqual({
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

  it('should stringify object (12)', async () => {
    expect(JSON.parse(stringify(object, ['B.B.B', 'B.B.A', 'B.B', 'B.A', 'B']))).toEqual({
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

  it('should stringify object (13)', async () => {
    expect(JSON.parse(stringify(object, ['B.B.B']))).toEqual({
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

  it('should stringify object (14)', async () => {
    expect(JSON.parse(stringify(object, ['B.B.B', 'B.B.A']))).toEqual({
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

  it('should stringify object (15)', async () => {
    expect(JSON.parse(stringify(object, ['B.B.B', 'B.B.A', 'B.B']))).toEqual({
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

  it('should stringify object (16)', async () => {
    expect(JSON.parse(stringify(object, ['D.C.F.1.B']))).toEqual({
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

  it('should stringify object (17)', async () => {
    expect(JSON.parse(stringify(object, ['D.C.F.1']))).toEqual({
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

  it('should stringify object (18)', async () => {
    expect(JSON.parse(stringify(object, ['D.C.F']))).toEqual({
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

  it('should stringify object (19)', async () => {
    expect(JSON.parse(stringify(object, ['F.2.B']))).toEqual({
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

  it('should stringify object (20)', async () => {
    expect(JSON.parse(stringify(object, ['**/A']))).toEqual({
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

  it('should stringify object (21)', async () => {
    expect(JSON.parse(stringify(object, ['**/C/**/B']))).toEqual({
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

  it('should stringify object (22)', async () => {
    expect(JSON.parse(stringify(object, ['**/C/**/B', '**/B']))).toEqual({
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

  it('should stringify object (23)', async () => {
    expect(JSON.parse(stringify(object, ['**/F/*/B']))).toEqual({
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
    expect(JSON.parse(stringify(object, ['**/F/2', '**/D/0']))).toEqual({
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

  it('should stringify object (25)', async () => {
    expect(JSON.parse(stringify(object, ['D/*/B']))).toEqual({
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

  it('should stringify object (26)', async () => {
    expect(JSON.parse(stringify(object, ['D/**/B']))).toEqual({
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

  it('should stringify object (27)', async () => {
    expect(JSON.parse(stringify(object, ['**/B']))).toEqual({
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

  it('should stringify object (28)', async () => {
    expect(JSON.parse(stringify(object, ['**/F/*']))).toEqual({
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
    expect(JSON.parse(stringify(tree, [{path: '**/id', predicate: objectPath => objectPath.at(-1) instanceof Node}]))).toEqual({
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
    expect(JSON.parse(stringify(tree, [{path: '**/id', predicate: objectPath => objectPath.at(-1) instanceof Leaf}]))).toEqual({
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
    expect(JSON.parse(stringify(tree, [{path: '**/child1/id', predicate: objectPath => objectPath.at(-1) instanceof Node}]))).toEqual({
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
    expect(JSON.parse(stringify(tree, [{path: '**/child2/id', predicate: objectPath => objectPath.at(-1) instanceof Node}]))).toEqual({
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
    expect(JSON.parse(stringify(tree, exclusions))).toEqual({
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
