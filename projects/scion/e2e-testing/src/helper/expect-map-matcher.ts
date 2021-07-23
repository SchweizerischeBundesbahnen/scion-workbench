/**
 * Expects the resolved map to contain at least the given map entries.
 *
 * Jasmine 3.5 provides 'mapContaining' matcher.
 */
export function expectMap(actual: Map<any, any> | Promise<Map<any, any>>): ToContainMatcher & {not: ToContainMatcher} {
  return {
    toContain: async (expected: Map<any, any>): Promise<void> => {
      const expectedTuples = [...expected];
      const actualTuples = [...await actual];
      await expect(actualTuples).toEqual(jasmine.arrayContaining(expectedTuples));
    },
    not: {
      toContain: async (expected: Map<any, any>): Promise<void> => {
        const expectedTuples = [...expected];
        const actualTuples = [...await actual];
        await expect(actualTuples).not.toEqual(jasmine.arrayContaining(expectedTuples));
      },
    },
  };
}

export interface ToContainMatcher {
  toContain(expected: Map<any, any>): Promise<void>;
}
