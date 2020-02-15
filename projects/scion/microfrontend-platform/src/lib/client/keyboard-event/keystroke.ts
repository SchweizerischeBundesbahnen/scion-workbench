/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Describes a user interaction with the keyboard.
 *
 * @ignore
 */
export class Keystroke {

  /**
   * Represents this keystroke as a string with its parts separated by a dot.
   */
  public readonly parts: string;

  constructor(public readonly eventType: string, key: string, modifiers?: { control?: boolean, shift?: boolean, alt?: boolean, meta?: boolean }) {
    const parts = [];
    parts.push(eventType);
    if (modifiers) {
      modifiers.control && parts.push('control');
      modifiers.shift && parts.push('shift');
      modifiers.alt && parts.push('alt');
      modifiers.meta && parts.push('meta');
    }
    parts.push(key.toLowerCase());
    this.parts = parts.join('.');
  }

  /**
   * Creates a {@link Keystroke} from the given keyboard event.
   */
  public static fromEvent(event: KeyboardEvent): Keystroke {
    if (!event) {
      throw Error('[KeystrokeParseError] Cannot create the keystroke from `null` or `undefined`.');
    }
    return new Keystroke(event.type, escapeKeyboardEventKey(event.key), {control: event.ctrlKey, shift: event.shiftKey, alt: event.altKey, meta: event.metaKey});
  }

  /**
   * Parses a string and returns a {@link Keystroke}.
   *
   * The string is a dot-separated list of the different parts describing the keystroke. The first part specifies the event type (keydown or keyup),
   * followed by optional modifier part(s) (alt, shift, control, meta, or a combination thereof) and with the keyboard key as the last part. The key is a
   * case-insensitive value of the {@link KeyboardEvent#key} property. For a complete list of valid key values, please see
   * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values.
   *
   * Two keys are an exception to the value of the {@link KeyboardEvent#key} property: dot and space.
   *
   * Examples: 'keydown.control.z', 'keydown.escape', 'keyup.enter', 'keydown.control.alt.enter', 'keydown.control.space'.
   */
  public static fromString(value: string): Keystroke {
    if (!value) {
      throw Error('[KeystrokeParseError] Cannot parse the keystroke from \'null\' or \'undefined\'.');
    }

    const parts = value.split('.');
    if (parts.length < 2) {
      throw Error(`[KeystrokeParseError] Cannot parse the keystroke '${value}'. Requires at least the event type and keyboard key, and optionally some modifiers. Examples: 'keydown.control.z', 'keydown.escape', 'keyup.enter', 'keydown.control.alt.enter', 'keydown.control.space'`);
    }

    const eventName = parts[0];
    if (eventName !== 'keydown' && eventName !== 'keyup') {
      throw Error(`[KeystrokeParseError] Cannot parse the keystroke '${value}'. Unsupported event type. Supported event types are: 'keydown' or 'keyup'. Examples: 'keydown.control.z', 'keydown.escape', 'keyup.enter', 'keydown.control.alt.enter', 'keydown.control.space'`);
    }

    const key = parts[parts.length - 1];
    if (!key || new Set().add('alt').add('shift').add('control').add('meta').has(key.toLowerCase())) {
      throw Error(`[KeystrokeParseError] Cannot parse the keystroke '${value}'. The keyboard key must be the last part. Examples: 'keydown.control.z', 'keydown.escape', 'keyup.enter', 'keydown.control.alt.enter', 'keydown.control.space'`);
    }

    const modifiers = new Set(parts.slice(1, -1));
    const keystroke = new Keystroke(eventName, key, {control: modifiers.delete('control'), shift: modifiers.delete('shift'), alt: modifiers.delete('alt'), meta: modifiers.delete('meta')});
    if (modifiers.size > 0) {
      throw Error(`[KeystrokeParseError] Cannot parse the keystroke '${value}'. Illegal modifier found. Supported modifiers are: 'alt', 'shift', 'control' or 'meta'. Examples: 'keydown.control.z', 'keydown.escape', 'keyup.enter', 'keydown.control.alt.enter', 'keydown.control.space'`);
    }
    return keystroke;
  }
}

/** @ignore **/
function escapeKeyboardEventKey(key: string): string {
  switch (key) {
    case '.':
      return 'dot';
    case ' ':
      return 'space';
    default:
      return key;
  }
}

