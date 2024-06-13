/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
 * To exclude a field, specify the path to the field in the object tree,
 * using the slash as delimiter. The path supports the asterisk (`*`) to match a
 * single segment or the globstar (`**`) to match multiple segments.
 */
export function stringify(data: unknown, exclusions?: Array<string | Exclusion>): string {
  if (!exclusions?.length) {
    return JSON.stringify(data);
  }

  const objectStack = new Array<ObjectValue>();
  const compiledExclusions = exclusions.map(exclusion => new CompiledExclusion(exclusion));

  return JSON.stringify(data, (key, value) => {
    if (key === '') { // root node
      return value;
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
    if (!exclude && typeof value === 'object') {
      objectStack.push({key, value, fieldsToSerialize: new Set(Object.keys(value))});
    }

    return exclude ? undefined : value;
  });
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
   * @param key - key under with the field is associated in the parent object.
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
