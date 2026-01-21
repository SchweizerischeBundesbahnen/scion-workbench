/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Parses a typed string to its actual type.
 *
 * Examples:
 * - '<undefined>' => undefined
 * - '<null>' => null
 * - '<number>123</number>' => 123
 * - '<boolean>true</boolean>' => true
 * - '<string>value</string>' => 'value'
 * - '<json>{"key": "value"}</json>' => {"key": "value"}
 * - 'value' => 'value'
 */
export function parseTypedString<T = unknown>(value: string | undefined | null, options?: {undefinedIfEmpty?: true}): T | undefined | null {
  if (value === '<undefined>' || value === undefined) {
    return undefined;
  }
  else if (value === '<null>' || value === null) {
    return null;
  }
  else if (!value.length && options?.undefinedIfEmpty) {
    return undefined;
  }

  const paramMatch = /<(?<type>.+)>(?<value>.*)<\/\k<type>>/.exec(value);
  switch (paramMatch?.groups!['type']) {
    case 'number': {
      return Number(paramMatch.groups['value']) as T;
    }
    case 'boolean': {
      return Boolean(paramMatch.groups['value']) as T;
    }
    case 'string': {
      return paramMatch.groups['value'] as T;
    }
    case 'json': {
      return JSON.parse(paramMatch.groups['value']!) as T;
    }
    default: {
      return value as T;
    }
  }
}

/**
 * Creates a typed value for given value.
 *
 * Examples:
 * - undefined => '<undefined>'
 * - null => '<null>'
 * - 'value' => '<string>value</string>'
 * - 123 => '<number>123</number>'
 * - true => '<boolean>true</boolean>'
 * - {"key": "value"} => '<json>{"key": "value"}</json>'
 */
export function toTypedString(value: unknown, options?: {emptyIfUndefined?: true}): string {
  if (value === undefined) {
    return options?.emptyIfUndefined ? '' : '<undefined>';
  }
  else if (value === null) {
    return '<null>';
  }
  else if (typeof value === 'string') {
    return `<string>${value}</string>`;
  }
  else if (typeof value === 'number') {
    return `<number>${value}</number>`;
  }
  else if (typeof value === 'boolean') {
    return `<boolean>${value}</boolean>`;
  }
  else {
    return `<json>${JSON.stringify(value)}</json>`;
  }
}
