/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { parseMessageEnvelopeElseNull, PROTOCOL } from '@scion/workbench-application-platform.api';

describe('MessageEnvelope', () => {

  it('should be a valid message envelope', () => {
    expect(parseMessageEnvelopeElseNull({protocol: PROTOCOL, channel: 'intent', message: {}})).not.toBeNull();
    expect(parseMessageEnvelopeElseNull({protocol: PROTOCOL, channel: 'intent', message: null})).not.toBeNull();

  });

  it('must be an object', () => {
    expect(parseMessageEnvelopeElseNull('')).toBeNull();
    expect(parseMessageEnvelopeElseNull(true)).toBeNull();
    expect(parseMessageEnvelopeElseNull(42)).toBeNull();
    expect(parseMessageEnvelopeElseNull(() => {
    })).toBeNull();
  });

  it('must not be null or undefined', () => {
    expect(parseMessageEnvelopeElseNull(null)).toBeNull();
    expect(parseMessageEnvelopeElseNull(undefined)).toBeNull();
  });

  it('should have a channel defined', () => {
    expect(parseMessageEnvelopeElseNull({message: {}})).toBeNull();
    expect(parseMessageEnvelopeElseNull({protocol: PROTOCOL, channel: null, message: {}})).toBeNull();
  });
});
