/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { RetainedMessageStore } from './retained-message-store';
import { MessageHeaders, TopicMessage } from '../../messaging.model';

describe('RetainedMessageStore', () => {

  let retainedMessageStore: RetainedMessageStore;

  beforeEach(() => retainedMessageStore = new RetainedMessageStore());

  it('should persist a retained message and find the most recent message (exact topic match)', async () => {
    const message1 = newTopicMessage('myhome/livingroom/temperature', {body: '25°C', timestamp: 0});
    const message2 = newTopicMessage('myhome/livingroom/temperature', {body: '26°C', timestamp: 1});
    const message3 = newTopicMessage('myhome/livingroom/humidity', {body: '20%', timestamp: 2});

    expect(retainedMessageStore.persistOrDelete(message1)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message2)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message3)).toEqual('persisted');

    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/temperature')).toEqual(message2);
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/humidity')).toEqual(message3);
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/brightness')).toBeNull();
  });

  it('should delete a retained message if its body is `null`', async () => {
    const message1 = newTopicMessage('myhome/livingroom/temperature', {body: '25°C', timestamp: 0});
    expect(retainedMessageStore.persistOrDelete(message1)).toEqual('persisted');
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/temperature')).toEqual(message1);

    const message2 = newTopicMessage('myhome/livingroom/temperature', {body: null, timestamp: 0});
    expect(retainedMessageStore.persistOrDelete(message2)).toEqual('deleted');
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/temperature')).toBeNull();
  });

  it('should delete a retained message if its body is `undefined`', async () => {
    const message1 = newTopicMessage('myhome/livingroom/temperature', {body: '25°C', timestamp: 0});
    expect(retainedMessageStore.persistOrDelete(message1)).toEqual('persisted');
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/temperature')).toEqual(message1);

    const message2 = newTopicMessage('myhome/livingroom/temperature', {body: undefined, timestamp: 0});
    expect(retainedMessageStore.persistOrDelete(message2)).toEqual('deleted');
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/temperature')).toBeNull();
  });

  it('should not delete a retained message if its body is 0 (zero as a number)', async () => {
    const message = newTopicMessage('myhome/livingroom/temperature', {body: 0, timestamp: 0});
    expect(retainedMessageStore.persistOrDelete(message)).toEqual('persisted');
    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/temperature')).toEqual(message);
  });

  it('should find the most recent message if multiple retained messages match the topic (expected: \'myhome/livingroom/humidity\': 20% and \'myhome/kitchen/humidity: 15%\')', async () => {
    const message1 = newTopicMessage('myhome/livingroom/temperature', {body: '25°C', timestamp: 0});
    const message2 = newTopicMessage('myhome/livingroom/temperature', {body: '26°C', timestamp: 1});
    const message3 = newTopicMessage('myhome/kitchen/humidity', {body: '15%', timestamp: 4});
    const message4 = newTopicMessage('myhome/livingroom/humidity', {body: '19%', timestamp: 2});
    const message5 = newTopicMessage('myhome/livingroom/humidity', {body: '20%', timestamp: 3});

    expect(retainedMessageStore.persistOrDelete(message1)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message2)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message3)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message4)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message5)).toEqual('persisted');

    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/:measurement')).toEqual(message5);
    expect(retainedMessageStore.findMostRecentRetainedMessage(':building/:room/:measurement')).toEqual(message3);

  });

  it('should find the most recent message if multiple retained messages match the topic (expected: myhome/livingroom/temperature: 26°C)', async () => {
    const message1 = newTopicMessage('myhome/livingroom/temperature', {body: '25°C', timestamp: 0});
    const message2 = newTopicMessage('myhome/livingroom/temperature', {body: '26°C', timestamp: 5});
    const message3 = newTopicMessage('myhome/kitchen/humidity', {body: '15%', timestamp: 4});
    const message4 = newTopicMessage('myhome/livingroom/humidity', {body: '19%', timestamp: 2});
    const message5 = newTopicMessage('myhome/livingroom/humidity', {body: '20%', timestamp: 3});

    expect(retainedMessageStore.persistOrDelete(message1)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message2)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message3)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message4)).toEqual('persisted');
    expect(retainedMessageStore.persistOrDelete(message5)).toEqual('persisted');

    expect(retainedMessageStore.findMostRecentRetainedMessage('myhome/livingroom/:measurement')).toEqual(message2);
    expect(retainedMessageStore.findMostRecentRetainedMessage(':building/:room/:measurement')).toEqual(message2);
  });

  function newTopicMessage(topic: string, msg: { body?: any, timestamp: number }): TopicMessage {
    return {
      topic: topic,
      body: msg.body,
      retain: true,
      headers: new Map().set(MessageHeaders.Timestamp, msg.timestamp),
      params: new Map(),
    };
  }
});
