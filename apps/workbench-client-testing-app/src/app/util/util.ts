/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';

/**
 * Returns a new instance with `undefined` entries removed,
 * or returns `undefined` if all entries are `undefined`.
 */
export function undefinedIfEmpty<T>(object: T): T {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }
    return {...acc, [key]: value};
  }, undefined as T);
}

/**
 * Converts the value entered via the UI to its actual type.
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
export function convertValueFromUI(value: string): string | number | boolean | object | undefined | null {
  if ('<undefined>' === value) {
    return undefined;
  }
  else if ('<null>' === value) {
    return null;
  }
  const paramMatch = value.match(/<(?<type>.+)>(?<value>.+)<\/\k<type>>/);
  switch (paramMatch?.groups['type']) {
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
