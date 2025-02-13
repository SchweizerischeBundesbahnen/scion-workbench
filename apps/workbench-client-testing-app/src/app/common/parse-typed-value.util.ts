/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, numberAttribute} from '@angular/core';

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
export function parseTypedString<T = unknown>(value: string | undefined | null): T | undefined | null {
  if (value === '<undefined>' || value === undefined) {
    return undefined;
  }
  else if (value === '<null>' || value === null) {
    return null;
  }
  const paramMatch = /<(?<type>.+)>(?<value>.+)<\/\k<type>>/.exec(value);
  switch (paramMatch?.groups!['type']) {
    case 'number': {
      return numberAttribute(paramMatch.groups['value']) as T;
    }
    case 'boolean': {
      return booleanAttribute(paramMatch.groups['value']) as T;
    }
    case 'string': {
      return paramMatch.groups['value'] as T;
    }
    case 'json': {
      return JSON.parse(paramMatch.groups['value']) as T;
    }
    default: {
      return value as T;
    }
  }
}

/**
 * Parses the values of given object to their actual types.
 *
 * @see parseTypedString
 */
export function parseTypedObject(object: Record<string, string> | null | undefined): Record<string, unknown> | null | undefined {
  if (object === null) {
    return null;
  }
  if (object === undefined) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(object).map(([key, value]) => ([key, parseTypedString(value)])));
}
