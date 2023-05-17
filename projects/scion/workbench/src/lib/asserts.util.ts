import {Type} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';

/**
 * Asserts the given object to be of the given type (and not simply a JavaScript object literal).
 *
 * Throws an error if not of the given type, or if `null` or `undefined`.
 */
export function assertType(object: any, assert: {toBeOneOf: Type<any>[] | Type<any>}): void {
  if (object === null) {
    throw Error(`[AssertError] Object must not be 'null'.`);
  }
  if (object === undefined) {
    throw Error(`[AssertError] Object must not be 'undefined'.`);
  }
  if (!Arrays.coerce(assert.toBeOneOf).includes(object.constructor)) {
    const expectedType = Arrays.coerce(assert.toBeOneOf).map(it => it.name).join(' or ');
    const actualType = object.constructor.name;
    throw Error(`[AssertError] Object not of the expected type [expected=${expectedType}, actual=${actualType}].`);
  }
}

/**
 * Asserts the given object not to be `null` or `undefined.
 */
export function assertNotNullish(value: any, errorFn?: () => Error): void {
  if (value === null) {
    throw errorFn?.() ?? Error('[AssertError] Value expected not to be `null`, but was `null`.');
  }
  if (value === undefined) {
    throw errorFn?.() ?? Error('[AssertError] Value expected not to be `undefined`, but was `undefined`.');
  }
}
