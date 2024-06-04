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
 * Stringifies given data, exluding specified paths from serialization.
 *
 * To exclude a field, specify the path to the field in the object tree,
 * using the slash as delimiter. The path supports the asterisk (`*`) to match a
 * single segment or the globstar (`**`) to match multiple segments.
 */
export function stringify(data: unknown, transientPaths?: string[]): string {
  const objectStack = new Array<ObjectContext>();

  if (!transientPaths?.length) {
    return JSON.stringify(data);
  }

  const pathsToSkip = createRegex(transientPaths);

  return JSON.stringify(data, (key, value) => {
    if (key === '') { // root
      return value;
    }

    // Remove object(s) from the stack if finished their serialization.
    while (objectStack.at(-1)?.fieldsToSerialize.size === 0) {
      objectStack.pop();
    }

    // Mark current field as serialized.
    objectStack.at(-1)?.fieldsToSerialize.delete(key);

    const path = objectStack.map(object => object.key).concat(key).join('/');
    const skip = pathsToSkip.some(pathToSkip => pathToSkip.test(path));

    // Push object to stack if type of object.
    if (!skip && typeof value === 'object') {
      objectStack.push({key, object: value, fieldsToSerialize: new Set(Object.keys(value))});
    }

    return skip ? undefined : value;
  });
}

/**
 * Converts given paths to regular expressions.
 */
function createRegex(paths: string[]): RegExp[] {
  return paths
    .map(path => path
      .replaceAll('/*/', '/[^/]+/') // replace asterisk to match single segment
      .replaceAll('**/', '.+/') // replace globstar to match multiple root segments
      .replaceAll('/**/', '/.+/'), // replace globstar to match multiple segments
    )
    .map(regex => new RegExp(`^${regex}$`));
}

/**
 * Context spawned by an object.
 */
interface ObjectContext {
  /**
   * Key associated with the object in the parent object.
   */
  key: string;
  /**
   * Object that spawns this context.
   */
  object: unknown;
  /**
   * Fields of the object that have not yet been serialized.
   */
  fieldsToSerialize: Set<string>;
}
