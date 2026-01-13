/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * Returns a new {@link Map} or {@link Record} with the actual data type of each value appended to its value in square brackets,
 * unless it is a string data type.
 *
 * Examples:
 * - `abc`
 * - `1234 [number]`
 * - `true [boolean]`
 * - `null [null]`
 * - `undefined [undefined]`
 */
@Pipe({name: 'appAppendDataType'})
export class AppendDataTypePipe implements PipeTransform {

  public transform(object: Record<string, unknown> | Map<string, unknown>): Record<string, unknown> | Map<string, unknown> {
    if (object instanceof Map) {
      return appendTypeToMapEntries(object);
    }
    else {
      return appendTypeToObjectFields(object);
    }
  }
}

function appendTypeToMapEntries(map: Map<string, unknown>): Map<string, unknown> {
  const copy = new Map<string, unknown>();
  map.forEach((value, key) => copy.set(key, toTypedValue(value)));
  return copy;
}

function appendTypeToObjectFields(object: Record<string, unknown>): Record<string, unknown> {
  const copy = {} as Record<string, unknown>;
  Object.entries(object).forEach(([key, value]) => copy[key] = toTypedValue(value));
  return copy;
}

function appendTypeToArrayElements(array: Array<unknown>): Array<unknown> {
  const copy = new Array<unknown>();
  array.forEach(element => copy.push(toTypedValue(element)));
  return copy;
}

function appendTypeToSetEntries(set: Set<unknown>): Set<unknown> {
  const copy = new Set<unknown>();
  set.forEach(entry => copy.add(toTypedValue(entry)));
  return copy;
}

function toTypedValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value;
  }
  else if (value === null) {
    return `${value} [null]`;
  }
  else if (Array.isArray(value)) {
    return appendTypeToArrayElements(value as Array<unknown>);
  }
  else if (value instanceof Map) {
    return appendTypeToMapEntries(value as Map<string, unknown>);
  }
  else if (value instanceof Set) {
    return appendTypeToSetEntries(value as Set<unknown>);
  }
  else if (typeof value === 'object') {
    return appendTypeToObjectFields(value as Record<string, unknown>);
  }
  else {
    return `${value} [${typeof value}]`;
  }
}
