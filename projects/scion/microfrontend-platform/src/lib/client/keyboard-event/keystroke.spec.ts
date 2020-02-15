/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Keystroke } from './keystroke';

describe('Keystroke', () => {

  it('should parse \'keydown.z\' keystroke', () => {
    expect(Keystroke.fromString('keydown.z')).toEqual(new Keystroke('keydown', 'z'));
  });

  it('should parse \'keydown.control.z\' keystroke', () => {
    expect(Keystroke.fromString('keydown.control.z')).toEqual(new Keystroke('keydown', 'z', {control: true}));
  });

  it('should parse \'keydown.control.alt.z\' keystroke', () => {
    expect(Keystroke.fromString('keydown.control.alt.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true}));
  });

  it('should parse \'keydown.dot\' keystroke', () => {
    expect(Keystroke.fromString('keydown.dot')).toEqual(new Keystroke('keydown', 'dot'));
  });

  it('should parse \'keydown.control.dot\' keystroke', () => {
    expect(Keystroke.fromString('keydown.control.dot')).toEqual(new Keystroke('keydown', 'dot', {control: true}));
  });

  it('should parse \'keydown.space\' keystroke', () => {
    expect(Keystroke.fromString('keydown.space')).toEqual(new Keystroke('keydown', 'space'));
  });

  it('should parse \'keydown.control.space\' keystroke', () => {
    expect(Keystroke.fromString('keydown.control.space')).toEqual(new Keystroke('keydown', 'space', {control: true}));
  });

  it('should ignore the order of the modifier keys', () => {
    expect(Keystroke.fromString('keydown.control.alt.shift.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true, shift: true}));
    expect(Keystroke.fromString('keydown.control.alt.shift.z').parts).toEqual('keydown.control.shift.alt.z');

    expect(Keystroke.fromString('keydown.control.shift.alt.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true, shift: true}));
    expect(Keystroke.fromString('keydown.control.shift.alt.z').parts).toEqual('keydown.control.shift.alt.z');

    expect(Keystroke.fromString('keydown.alt.shift.control.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true, shift: true}));
    expect(Keystroke.fromString('keydown.alt.shift.control.z').parts).toEqual('keydown.control.shift.alt.z');

    expect(Keystroke.fromString('keydown.alt.control.shift.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true, shift: true}));
    expect(Keystroke.fromString('keydown.alt.control.shift.z').parts).toEqual('keydown.control.shift.alt.z');

    expect(Keystroke.fromString('keydown.shift.control.alt.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true, shift: true}));
    expect(Keystroke.fromString('keydown.shift.control.alt.z').parts).toEqual('keydown.control.shift.alt.z');

    expect(Keystroke.fromString('keydown.shift.alt.control.z')).toEqual(new Keystroke('keydown', 'z', {control: true, alt: true, shift: true}));
    expect(Keystroke.fromString('keydown.shift.alt.control.z').parts).toEqual('keydown.control.shift.alt.z');
  });

  it('should parse the \'control\' modifier', () => {
    expect(Keystroke.fromString('keydown.control.z')).toEqual(new Keystroke('keydown', 'z', {control: true}));
  });

  it('should parse the \'meta\' modifier', () => {
    expect(Keystroke.fromString('keydown.meta.z')).toEqual(new Keystroke('keydown', 'z', {meta: true}));
  });

  it('should parse the \'alt\' modifier', () => {
    expect(Keystroke.fromString('keydown.alt.z')).toEqual(new Keystroke('keydown', 'z', {alt: true}));
  });

  it('should parse the \'shift\' modifier', () => {
    expect(Keystroke.fromString('keydown.shift.z')).toEqual(new Keystroke('keydown', 'z', {shift: true}));
  });

  it('should throw if parsing an unsupported modifier', () => {
    expect(() => Keystroke.fromString('keydown.abc.z')).toThrowError(/KeystrokeParseError/);
  });

  it('should throw if parsing a `null` keystroke', () => {
    expect(() => Keystroke.fromString(null)).toThrowError(/KeystrokeParseError/);
  });

  it('should throw if parsing an `undefined` keystroke', () => {
    expect(() => Keystroke.fromString(undefined)).toThrowError(/KeystrokeParseError/);
  });

  it('should throw if parsing an empty keystroke', () => {
    expect(() => Keystroke.fromString('')).toThrowError(/KeystrokeParseError/);
  });

  it('should throw if not specifying the keyboard key', () => {
    expect(() => Keystroke.fromString('keydown')).toThrowError(/KeystrokeParseError/);
  });

  it('should throw if using a modifier key as the keyboard key', () => {
    expect(() => Keystroke.fromString('keydown.control')).toThrowError(/KeystrokeParseError/);
    expect(() => Keystroke.fromString('keydown.alt')).toThrowError(/KeystrokeParseError/);
    expect(() => Keystroke.fromString('keydown.shift')).toThrowError(/KeystrokeParseError/);
    expect(() => Keystroke.fromString('keydown.meta')).toThrowError(/KeystrokeParseError/);
  });

  it('should throw if not specifying the event type', () => {
    expect(() => Keystroke.fromString('z')).toThrowError(/KeystrokeParseError/);
  });

  it('should parse \'keydown.z\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z'}))).toEqual(new Keystroke('keydown', 'z'));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z'})).parts).toEqual('keydown.z');
  });

  it('should parse \'keydown.space\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: ' '}))).toEqual(new Keystroke('keydown', 'space'));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: ' '})).parts).toEqual('keydown.space');
  });

  it('should parse \'keydown.dot\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: '.'}))).toEqual(new Keystroke('keydown', 'dot'));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: '.'})).parts).toEqual('keydown.dot');
  });

  it('should parse \'keydown.shift.z\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', shiftKey: true}))).toEqual(new Keystroke('keydown', 'z', {shift: true}));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', shiftKey: true})).parts).toEqual('keydown.shift.z');
  });

  it('should parse \'keydown.control.z\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', ctrlKey: true}))).toEqual(new Keystroke('keydown', 'z', {control: true}));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', ctrlKey: true})).parts).toEqual('keydown.control.z');
  });

  it('should parse \'keydown.meta.z\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', metaKey: true}))).toEqual(new Keystroke('keydown', 'z', {meta: true}));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', metaKey: true})).parts).toEqual('keydown.meta.z');
  });

  it('should parse \'keydown.control.shift.z\' keyboard event', () => {
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', ctrlKey: true, shiftKey: true}))).toEqual(new Keystroke('keydown', 'z', {control: true, shift: true}));
    expect(Keystroke.fromEvent(new KeyboardEvent('keydown', {key: 'z', ctrlKey: true, shiftKey: true})).parts).toEqual('keydown.control.shift.z');
  });
});
