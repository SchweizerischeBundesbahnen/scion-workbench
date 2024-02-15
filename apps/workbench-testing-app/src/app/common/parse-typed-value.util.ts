/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';

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
export function parseTypedString(value: string | undefined | null): any {
  if (value === '<undefined>' || value === undefined) {
    return undefined;
  }
  else if (value === '<null>' || value === null) {
    return null;
  }
  const paramMatch = value.match(/<(?<type>.+)>(?<value>.+)<\/\k<type>>/);
  switch (paramMatch?.groups!['type']) {
    case 'number': {
      return coerceNumberProperty(paramMatch.groups['value']);
    }
    case 'boolean': {
      return coerceBooleanProperty(paramMatch.groups['value']);
    }
    case 'string': {
      return paramMatch.groups['value'];
    }
    case 'json': {
      return JSON.parse(paramMatch.groups['value']);
    }
    default: {
      return value;
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
