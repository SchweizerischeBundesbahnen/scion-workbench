/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { TopicSubscriptionRegistry } from './topic-subscription.registry';
import { Client } from './client.registry';
import { take } from 'rxjs/operators';
import { collectToPromise } from '../../spec.util.spec';

describe('TopicSubscriptionRegistry', () => {

  let subscriptionRegistry: TopicSubscriptionRegistry;

  beforeEach(() => subscriptionRegistry = new TopicSubscriptionRegistry());

  it('should allow multiple subscriptions on the same topic from different clients', async () => {
    const client1 = newClient('client#1');
    const client2 = newClient('client#2');
    const client3 = newClient('client#3');
    const subscriptionCountCollector = collectToPromise(subscriptionRegistry.subscriptionCount$('myhome/livingroom/temperature'), {take: 7, timeout: 500});

    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client1, 'subscription#1');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client2, 'subscription#2');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client3, 'subscription#3');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(3);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client1.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client2.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client3.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);

    await expectAsync(subscriptionCountCollector).toBeResolvedTo([0, 1, 2, 3, 2, 1, 0]);
  });

  it('should allow multiple subscriptions on the same topic from the same client', async () => {
    const client = newClient('client');
    const subscriptionCountCollector = collectToPromise(subscriptionRegistry.subscriptionCount$('myhome/livingroom/temperature'), {take: 7, timeout: 500});

    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client, 'subscription#1');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client, 'subscription#2');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client, 'subscription#3');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(3);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);

    await expectAsync(subscriptionCountCollector).toBeResolvedTo([0, 1, 2, 3, 2, 1, 0]);
  });

  it('should ignore an unsubscribe attempt if there is no subscription for it', async () => {
    const client = newClient('client');

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);
  });

  it('should throw if trying to observe a non-exact topic', async () => {
    await expect(() => subscriptionRegistry.subscriptionCount$('myhome/livingroom/:measurement')).toThrowError(/TopicObserveError/);
  });

  it('should allow multiple subscriptions on different topics from the same client', async () => {
    const client = newClient('client');
    const subscriptionCountCollector1 = collectToPromise(subscriptionRegistry.subscriptionCount$('myhome/livingroom/temperature'), {take: 5, timeout: 500});
    const subscriptionCountCollector2 = collectToPromise(subscriptionRegistry.subscriptionCount$('myhome/livingroom/humidity'), {take: 5, timeout: 500});

    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(0);

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client, 'subscription#1');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(0);

    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client, 'subscription#2');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(1);

    subscriptionRegistry.subscribe('myhome/livingroom/humidity', client, 'subscription#3');
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(2);

    subscriptionRegistry.unsubscribe('myhome/livingroom/temperature', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(2);

    subscriptionRegistry.unsubscribe('myhome/livingroom/:measurement', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(1);

    subscriptionRegistry.unsubscribe('myhome/livingroom/humidity', client.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/humidity').toBe(0);

    await expectAsync(subscriptionCountCollector1).toBeResolvedTo([0, 1, 2, 1, 0]);
    await expectAsync(subscriptionCountCollector2).toBeResolvedTo([0, 1, 2, 1, 0]);
  });

  it('should count wildcard subscriptions when observing the subscriber count on a topic', async () => {
    const client1 = newClient('client#1');
    const client2 = newClient('client#2');

    subscriptionRegistry.subscribe('myhome/:room/temperature', client1, 'subscription#1');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(1);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(0);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(1);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(0);

    subscriptionRegistry.subscribe('myhome/:room/temperature', client1, 'subscription#2');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(2);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(0);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(2);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(0);

    subscriptionRegistry.subscribe('myhome/:room/temperature', client2, 'subscription#3');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(3);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(0);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(3);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(0);

    subscriptionRegistry.subscribe('myhome/:room/temperature', client2, 'subscription#4');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(4);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(0);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(4);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(0);

    subscriptionRegistry.subscribe('myhome/:room/:measurement', client1, 'subscription#5');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(5);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(0);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(5);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(0);

    subscriptionRegistry.subscribe('myhome/:room/:measurement', client2, 'subscription#6');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(6);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(0);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(6);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(0);

    subscriptionRegistry.subscribe('myhome/:room/:measurement/:unit', client1, 'subscription#7');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(6);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(1);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(6);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(1);

    subscriptionRegistry.subscribe('myhome/:room/:measurement/:unit', client2, 'subscription#8');
    await expectSubscriptionCount('myhome/livingroom').toBe(0);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(6);
    await expectSubscriptionCount('myhome/livingroom/temperature/celcius').toBe(2);
    await expectSubscriptionCount('myhome/kitchen').toBe(0);
    await expectSubscriptionCount('myhome/kitchen/temperature').toBe(6);
    await expectSubscriptionCount('myhome/kitchen/temperature/celcius').toBe(2);
  });

  it('should remove all subscriptions of a client', async () => {
    const client1 = newClient('client#1');
    const client2 = newClient('client#2');

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client1, 'subscription#1');
    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client1, 'subscription#2');
    subscriptionRegistry.subscribe('myhome/:livingroom/:measurement', client1, 'subscription#3');
    subscriptionRegistry.subscribe(':building/:livingroom/:measurement', client1, 'subscription#4');

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client2, 'subscription#5');
    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client2, 'subscription#6');
    subscriptionRegistry.subscribe('myhome/:livingroom/:measurement', client2, 'subscription#7');
    subscriptionRegistry.subscribe(':building/:livingroom/:measurement', client2, 'subscription#8');

    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(8);

    subscriptionRegistry.unsubscribeClient(client1.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(4);

    subscriptionRegistry.unsubscribeClient(client2.id);
    await expectSubscriptionCount('myhome/livingroom/temperature').toBe(0);
  });

  it('should resolve subscribers which observe the topic \'myhome/livingroom/temperature\'', async () => {
    const client1 = newClient('client#1');
    const client2 = newClient('client#2');

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client1, 'client#1;sub#1');
    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client1, 'client#1;sub#2');
    subscriptionRegistry.subscribe('myhome/kitchen/:measurement', client1, 'client#1;sub#3');
    subscriptionRegistry.subscribe('myhome/:room/temperature', client1, 'client#1;sub#4');
    subscriptionRegistry.subscribe('myhome/:room/:measurement', client1, 'client#1;sub#5');
    subscriptionRegistry.subscribe(':building/kitchen/:measurement', client1, 'client#1;sub#6');

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client2, 'client#2;sub#1');
    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client2, 'client#2;sub#2');
    subscriptionRegistry.subscribe('myhome/kitchen/:measurement', client2, 'client#2;sub#3');
    subscriptionRegistry.subscribe('myhome/:room/temperature', client2, 'client#2;sub#4');
    subscriptionRegistry.subscribe('myhome/:room/:measurement', client2, 'client#2;sub#5');
    subscriptionRegistry.subscribe(':building/kitchen/:measurement', client2, 'client#2;sub#6');

    // Resolve the subscribers which observe the topic 'myhome/livingroom/temperature'.
    const destinations = subscriptionRegistry.resolveTopicDestinations('myhome/livingroom/temperature');

    expect(destinations.map(destination => destination.subscription.id)).toEqual([
      'client#1;sub#1',
      'client#1;sub#2',
      'client#1;sub#4',
      'client#1;sub#5',
      'client#2;sub#1',
      'client#2;sub#2',
      'client#2;sub#4',
      'client#2;sub#5',
    ]);

    expect(destinations[0]).withContext('(a)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map(),
      subscription: {
        id: 'client#1;sub#1',
        topic: 'myhome/livingroom/temperature',
        client: client1,
      },
    });
    expect(destinations[1]).withContext('(b)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map().set('measurement', 'temperature'),
      subscription: {
        id: 'client#1;sub#2',
        topic: 'myhome/livingroom/:measurement',
        client: client1,
      },
    });
    expect(destinations[2]).withContext('(c)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map().set('room', 'livingroom'),
      subscription: {
        id: 'client#1;sub#4',
        topic: 'myhome/:room/temperature',
        client: client1,
      },
    });
    expect(destinations[3]).withContext('(d)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map().set('room', 'livingroom').set('measurement', 'temperature'),
      subscription: {
        id: 'client#1;sub#5',
        topic: 'myhome/:room/:measurement',
        client: client1,
      },
    });
    expect(destinations[4]).withContext('(e)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map(),
      subscription: {
        id: 'client#2;sub#1',
        topic: 'myhome/livingroom/temperature',
        client: client2,
      },
    });
    expect(destinations[5]).withContext('(f)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map().set('measurement', 'temperature'),
      subscription: {
        id: 'client#2;sub#2',
        topic: 'myhome/livingroom/:measurement',
        client: client2,
      },
    });
    expect(destinations[6]).withContext('(g)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map().set('room', 'livingroom'),
      subscription: {
        id: 'client#2;sub#4',
        topic: 'myhome/:room/temperature',
        client: client2,
      },
    });
    expect(destinations[7]).withContext('(h)').toEqual({
      topic: 'myhome/livingroom/temperature',
      params: new Map().set('room', 'livingroom').set('measurement', 'temperature'),
      subscription: {
        id: 'client#2;sub#5',
        topic: 'myhome/:room/:measurement',
        client: client2,
      },
    });
  });

  it('should resolve subscribers which observe the topic \'myhome/kitchen/temperature\'', async () => {
    const client1 = newClient('client#1');
    const client2 = newClient('client#2');

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client1, 'client#1;sub#1');
    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client1, 'client#1;sub#2');
    subscriptionRegistry.subscribe('myhome/kitchen/:measurement', client1, 'client#1;sub#3');
    subscriptionRegistry.subscribe('myhome/:room/temperature', client1, 'client#1;sub#4');
    subscriptionRegistry.subscribe('myhome/:room/:measurement', client1, 'client#1;sub#5');
    subscriptionRegistry.subscribe(':building/kitchen/:measurement', client1, 'client#1;sub#6');
    subscriptionRegistry.subscribe(':building/:room/:measurement', client1, 'client#1;sub#7');

    subscriptionRegistry.subscribe('myhome/livingroom/temperature', client2, 'client#2;sub#1');
    subscriptionRegistry.subscribe('myhome/livingroom/:measurement', client2, 'client#2;sub#2');
    subscriptionRegistry.subscribe('myhome/kitchen/:measurement', client2, 'client#2;sub#3');
    subscriptionRegistry.subscribe('myhome/:room/temperature', client2, 'client#2;sub#4');
    subscriptionRegistry.subscribe('myhome/:room/:measurement', client2, 'client#2;sub#5');
    subscriptionRegistry.subscribe(':building/kitchen/:measurement', client2, 'client#2;sub#6');
    subscriptionRegistry.subscribe(':building/:room/:measurement', client2, 'client#2;sub#7');

    // Resolve the subscribers which observe the topic 'myhome/kitchen/temperature'.
    const destinations = subscriptionRegistry.resolveTopicDestinations('myhome/kitchen/temperature');

    expect(destinations.map(destination => destination.subscription.id)).toEqual([
      'client#1;sub#3',
      'client#1;sub#4',
      'client#1;sub#5',
      'client#1;sub#6',
      'client#1;sub#7',
      'client#2;sub#3',
      'client#2;sub#4',
      'client#2;sub#5',
      'client#2;sub#6',
      'client#2;sub#7',
    ]);

    expect(destinations[0]).withContext('(client 1)(a)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('measurement', 'temperature'),
      subscription: {
        id: 'client#1;sub#3',
        topic: 'myhome/kitchen/:measurement',
        client: client1,
      },
    });
    expect(destinations[1]).withContext('(client 1)(b)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('room', 'kitchen'),
      subscription: {
        id: 'client#1;sub#4',
        topic: 'myhome/:room/temperature',
        client: client1,
      },
    });
    expect(destinations[2]).withContext('(client 1)(c)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('room', 'kitchen').set('measurement', 'temperature'),
      subscription: {
        id: 'client#1;sub#5',
        topic: 'myhome/:room/:measurement',
        client: client1,
      },
    });
    expect(destinations[3]).withContext('(client 1)(d)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('building', 'myhome').set('measurement', 'temperature'),
      subscription: {
        id: 'client#1;sub#6',
        topic: ':building/kitchen/:measurement',
        client: client1,
      },
    });
    expect(destinations[4]).withContext('(client 1)(e)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('building', 'myhome').set('room', 'kitchen').set('measurement', 'temperature'),
      subscription: {
        id: 'client#1;sub#7',
        topic: ':building/:room/:measurement',
        client: client1,
      },
    });
    expect(destinations[5]).withContext('(client 2)(a)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('measurement', 'temperature'),
      subscription: {
        id: 'client#2;sub#3',
        topic: 'myhome/kitchen/:measurement',
        client: client2,
      },
    });
    expect(destinations[6]).withContext('(client 2)(b)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('room', 'kitchen'),
      subscription: {
        id: 'client#2;sub#4',
        topic: 'myhome/:room/temperature',
        client: client2,
      },
    });
    expect(destinations[7]).withContext('(client 2)(c)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('room', 'kitchen').set('measurement', 'temperature'),
      subscription: {
        id: 'client#2;sub#5',
        topic: 'myhome/:room/:measurement',
        client: client2,
      },
    });
    expect(destinations[8]).withContext('(client 2)(d)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('building', 'myhome').set('measurement', 'temperature'),
      subscription: {
        id: 'client#2;sub#6',
        topic: ':building/kitchen/:measurement',
        client: client2,
      },
    });
    expect(destinations[9]).withContext('(client 2)(e)').toEqual({
      topic: 'myhome/kitchen/temperature',
      params: new Map().set('building', 'myhome').set('room', 'kitchen').set('measurement', 'temperature'),
      subscription: {
        id: 'client#2;sub#7',
        topic: ':building/:room/:measurement',
        client: client2,
      },
    });
  });

  function expectSubscriptionCount(topic: string): { toBe: (expected: any) => Promise<void> } {
    return {
      toBe: (expected: any): Promise<void> => {
        return expectAsync(subscriptionRegistry.subscriptionCount$(topic).pipe(take(1)).toPromise()).withContext(`topic: ${topic}`).toBeResolvedTo(expected);
      },
    };
  }

  function newClient(id: string): Client {
    return new Client({id, window: undefined, application: undefined});
  }
});


