/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Stringifies given data, exluding specified fields from serialization.
 *
 * @param data - Data to serialize to json.
 * @param options - Controls how to serialize data.
 * @param options.exclusions - Controls which fields to exclude from serialization.\
 *                             To exclude a field, specify the path to the field in the object tree,
 *                             using the slash as delimiter. The path supports the asterisk (`*`) to match a
 *                             single segment or the globstar (`**`) to match multiple segments.
 * @param options.sort - Controls if to sort the fields by name. Defaults to `false`.
 */
export function stringify(data: unknown, options?: {exclusions?: Array<string | Exclusion>; sort?: true}): string {
  const exclusions = options?.exclusions ?? [];
  const sort = options?.sort ?? false;

  const objectStack = new Array<ObjectValue>();
  const compiledExclusions = exclusions.map(exclusion => new CompiledExclusion(exclusion));

  return JSON.stringify(data, (key, value) => {
    if (key === '') { // root node
      return sort ? sortProperties(value) : value;
    }

    // Remove object(s) from the stack if finished their serialization.
    while (objectStack.at(-1)?.fieldsToSerialize.size === 0) {
      objectStack.pop();
    }

    // Mark current field as serialized.
    objectStack.at(-1)?.fieldsToSerialize.delete(key);

    // Check if to exclude the current field from serialization.
    const exclude = compiledExclusions.some(exclusion => exclusion.matches(objectStack, key, value));

    // Push object to stack if type of object.
    if (!exclude && typeof value === 'object' && value !== null) {
      objectStack.push({key, value, fieldsToSerialize: new Set(Object.keys(value))});
    }

    if (exclude) {
      return undefined;
    }

    return sort ? sortProperties(value) : value;
  });
}

/**
 * Sorts the properties of the passed object literal by name. The original object literal will not be changed. Has no effect if not an object literal.
 */
function sortProperties(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value) || value instanceof Set || value instanceof Map) {
    return value;
  }

  const unsorted = value as Record<string, unknown>;
  return Object.keys(unsorted)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = unsorted[key];
      return sorted;
    }, {} as Record<string, unknown>);
}

/**
 * Represents an object in the object tree.
 */
interface ObjectValue {
  /**
   * Key under which the object is associated in the parent object.
   */
  key: string;
  /**
   * Represents the object.
   */
  value: unknown;
  /**
   * Fields of the object that have not yet been serialized.
   */
  fieldsToSerialize: Set<string>;
}

/**
 * Describes a field to exclude from serialization.
 */
export interface Exclusion {
  /**
   * Specifies the path to the field in the object tree, using the slash as delimiter.
   * The path supports the asterisk (`*`) to match a single segment or the globstar (`**`) to match multiple segments.
   */
  path: string;
  /**
   * Tests if to exclude the resolved field, enabling extended checks if the field cannot be uniquely identified via the path.
   *
   * @param objectPath - path to the field in the object tree.
   * @param key - key under which the field is associated in the parent object.
   * @param value - value of the field.
   */
  predicate: (objectPath: unknown[], key: string, value: unknown) => boolean;
}

/**
 * Represents an exclusion, with the path compiled to a regex.
 */
class CompiledExclusion {

  private readonly _regex: RegExp;
  private readonly _predicate: Exclusion['predicate'];

  constructor(exclusion: string | Exclusion) {
    exclusion = typeof exclusion === 'string' ? ({path: exclusion, predicate: () => true}) : exclusion;
    const path = exclusion.path
      .replaceAll('/*/', '/[^/]+/') // replace asterisk to match single segment
      .replaceAll('**/', '.+/') // replace globstar to match multiple root segments
      .replaceAll('/**/', '/.+/'); // replace globstar to match multiple segments
    this._regex = new RegExp(`^${path}$`);
    this._predicate = exclusion.predicate;
  }

  /**
   * Tests if given field matches this exclusion.
   */
  public matches(objectStack: ObjectValue[], key: string, value: unknown): boolean {
    const path = objectStack.map(objectValue => objectValue.key).concat(key).join('/');
    if (!this._regex.test(path)) {
      return false;
    }

    const objectPath = objectStack.map(objectValue => objectValue.value);
    if (!this._predicate(objectPath, key, value)) {
      return false;
    }

    return true;
  }
}
