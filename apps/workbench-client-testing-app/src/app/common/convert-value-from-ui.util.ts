import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';

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
