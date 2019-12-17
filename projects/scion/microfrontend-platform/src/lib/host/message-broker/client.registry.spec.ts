/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Client, ClientRegistry } from './client.registry';
import { Application } from '../../platform.model';

describe('ClientRegistry', () => {

  let clientRegistry: ClientRegistry;

  beforeEach(() => clientRegistry = new ClientRegistry());

  it('should register a client by its id', async () => {
    const client1 = newClient('1', 'app-1');
    const client2 = newClient('2', 'app-2');
    clientRegistry.registerClient(client1);
    clientRegistry.registerClient(client2);

    expect(clientRegistry.getByClientId(client1.id)).toBe(client1);
    expect(clientRegistry.getByClientId(client2.id)).toBe(client2);
  });

  it('should register a client by its Window', async () => {
    const client1 = newClient('1', 'app-1');
    const client2 = newClient('2', 'app-2');
    clientRegistry.registerClient(client1);
    clientRegistry.registerClient(client2);

    expect(clientRegistry.getByClientWindow(client1.window)).toBe(client1);
    expect(clientRegistry.getByClientWindow(client2.window)).toBe(client2);
  });

  it('should register a client by its Application', async () => {
    const client1 = newClient('1', 'app-1');
    const client2 = newClient('2', 'app-1');
    const client3 = newClient('3', 'app-1');
    const client4 = newClient('4', 'app-2');
    const client5 = newClient('5', 'app-2');
    clientRegistry.registerClient(client1);
    clientRegistry.registerClient(client2);
    clientRegistry.registerClient(client3);
    clientRegistry.registerClient(client4);
    clientRegistry.registerClient(client5);

    expect(clientRegistry.getByApplication('app-1')).toEqual(jasmine.arrayWithExactContents([client1, client2, client3]));
    expect(clientRegistry.getByApplication('app-2')).toEqual(jasmine.arrayWithExactContents([client4, client5]));
  });

  it('should unregister a client', async () => {
    const client = newClient('1', 'app-1');
    clientRegistry.registerClient(client);

    expect(clientRegistry.getByClientId(client.id)).toBe(client);
    expect(clientRegistry.getByClientWindow(client.window)).toBe(client);
    expect(clientRegistry.getByApplication('app-1')).toEqual([client]);

    clientRegistry.unregisterClient(client);
    expect(clientRegistry.getByClientId(client.id)).toBeUndefined();
    expect(clientRegistry.getByClientWindow(client.window)).toBeUndefined();
    expect(clientRegistry.getByApplication('app-1')).toEqual([]);
  });

  function newClient(clientId: string, appSymbolicName: string): Client {
    const application: Partial<Application> = {symbolicName: appSymbolicName};
    return new Client({id: clientId, window: {} as Window, application: application as Application});
  }
});
