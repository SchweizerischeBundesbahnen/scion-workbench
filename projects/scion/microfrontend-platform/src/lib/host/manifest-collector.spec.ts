/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans } from '../bean-manager';
import { HttpClient } from './http-client';
import { MicrofrontendPlatform } from '../microfrontend-platform';
import { ApplicationManifest } from '../platform.model';
import { ApplicationRegistry } from './application.registry';
import { Logger } from '../logger';

describe('ManifestCollector', () => {

  beforeEach(async () => await MicrofrontendPlatform.destroy());
  afterEach(async () => await MicrofrontendPlatform.destroy());

  it('should collect and register applications', async () => {
    // mock {HttpClient}
    const httpClientSpy = jasmine.createSpyObj(HttpClient.name, ['fetch']);
    httpClientSpy.fetch
      .withArgs('http://www.app-1/manifest').and.returnValue(okAnswer({body: {name: 'application-1', intents: [], capabilities: []}, delay: 50}))
      .withArgs('http://www.app-2/manifest').and.returnValue(okAnswer({body: {name: 'application-2', intents: [], capabilities: []}, delay: 120}))
      .withArgs('http://www.app-3/manifest').and.returnValue(okAnswer({body: {name: 'application-3', intents: [], capabilities: []}, delay: 30}));
    Beans.register(HttpClient, {useValue: httpClientSpy});

    // mock {Logger}
    const loggerSpy = jasmine.createSpyObj(Logger.name, ['info', 'warn', 'error']);
    Beans.register(Logger, {useValue: loggerSpy});

    // start the platform
    await MicrofrontendPlatform.forHost([
      {symbolicName: 'app-1', manifestUrl: 'http://www.app-1/manifest'},
      {symbolicName: 'app-2', manifestUrl: 'http://www.app-2/manifest'},
      {symbolicName: 'app-3', manifestUrl: 'http://www.app-3/manifest'},
    ]);

    // assert application registrations
    expect(Beans.get(ApplicationRegistry).getApplication('app-1').name).toEqual('application-1');
    expect(Beans.get(ApplicationRegistry).getApplication('app-2').name).toEqual('application-2');
    expect(Beans.get(ApplicationRegistry).getApplication('app-3').name).toEqual('application-3');
    expect(loggerSpy.error.calls.count()).toEqual(0);
  });

  it('should ignore applications which are not available', async () => {
    // mock {HttpClient}
    const httpClientSpy = jasmine.createSpyObj(HttpClient.name, ['fetch']);
    httpClientSpy.fetch
      .withArgs('http://www.app-1/manifest').and.returnValue(okAnswer({body: {name: 'application-1', intents: [], capabilities: []}, delay: 12}))
      .withArgs('http://www.app-2/manifest').and.returnValue(nokAnswer({status: 500, delay: 100}))
      .withArgs('http://www.app-3/manifest').and.returnValue(okAnswer({body: {name: 'application-3', intents: [], capabilities: []}, delay: 600}))
      .withArgs('http://www.app-4/manifest').and.returnValue(nokAnswer({status: 502, delay: 200}));
    Beans.register(HttpClient, {useValue: httpClientSpy});

    // mock {Logger}
    const loggerSpy = jasmine.createSpyObj(Logger.name, ['info', 'warn', 'error']);
    Beans.register(Logger, {useValue: loggerSpy});

    // start the platform
    await MicrofrontendPlatform.forHost([
      {symbolicName: 'app-1', manifestUrl: 'http://www.app-1/manifest'},
      {symbolicName: 'app-2', manifestUrl: 'http://www.app-2/manifest'},
      {symbolicName: 'app-3', manifestUrl: 'http://www.app-3/manifest'},
      {symbolicName: 'app-4', manifestUrl: 'http://www.app-4/manifest'},
    ]);

    // assert application registrations
    expect(Beans.get(ApplicationRegistry).getApplication('app-1').name).toEqual('application-1');
    expect(Beans.get(ApplicationRegistry).getApplication('app-2')).toBeUndefined();
    expect(Beans.get(ApplicationRegistry).getApplication('app-3').name).toEqual('application-3');
    expect(Beans.get(ApplicationRegistry).getApplication('app-4')).toBeUndefined();
    expect(loggerSpy.error.calls.count()).toEqual(2);
  });
});

function okAnswer(answer: { body: ApplicationManifest, delay: number }): Promise<Partial<Response>> {
  const response: Partial<Response> = {
    ok: true,
    json: (): Promise<any> => Promise.resolve(answer.body),
  };
  return new Promise(resolve => { // tslint:disable-line:typedef
    setTimeout(() => resolve(response), answer.delay);
  });
}

function nokAnswer(answer: { status: number, delay: number }): Promise<Partial<Response>> {
  const response: Partial<Response> = {
    ok: false,
    status: answer.status,
  };
  return new Promise(resolve => { // tslint:disable-line:typedef
    setTimeout(() => resolve(response), answer.delay);
  });
}


