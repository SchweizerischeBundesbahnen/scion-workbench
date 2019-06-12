/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, inject, TestBed } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { ApplicationRegistry } from '../core/application-registry.service';
import { ManifestRegistry } from '../core/manifest-registry.service';

describe('ApplicationRegistry', () => {

  let appRegistry: ApplicationRegistry;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });
  }));

  beforeEach(inject([ApplicationRegistry], (applicationRegistry: ApplicationRegistry) => {
    appRegistry = applicationRegistry;
  }));

  describe('Application URL', () => {

    it('should be the origin of \'manifestUrl\' if no \'baseUrl\' is specified in the manifest', () => {
      registerApp({name: 'app-1', manifestUrl: 'http://194.150.245.142:80/manifest.json'});
      expect(appRegistry.getApplication('app-1').baseUrl).toEqual('http://194.150.245.142');
      expect(appRegistry.getApplication('app-1').manifestUrl).toEqual('http://194.150.245.142/manifest.json');

      registerApp({name: 'app-2', manifestUrl: 'http://194.150.245.142/manifest.json'});
      expect(appRegistry.getApplication('app-2').baseUrl).toEqual('http://194.150.245.142');
      expect(appRegistry.getApplication('app-2').manifestUrl).toEqual('http://194.150.245.142/manifest.json');

      registerApp({name: 'app-3', manifestUrl: 'https://194.150.245.142/manifest.json'});
      expect(appRegistry.getApplication('app-3').baseUrl).toEqual('https://194.150.245.142');
      expect(appRegistry.getApplication('app-3').manifestUrl).toEqual('https://194.150.245.142/manifest.json');

      registerApp({name: 'app-4', manifestUrl: 'https://www.sbb.ch/manifest.json'});
      expect(appRegistry.getApplication('app-4').baseUrl).toEqual('https://www.sbb.ch');
      expect(appRegistry.getApplication('app-4').manifestUrl).toEqual('https://www.sbb.ch/manifest.json');

      registerApp({name: 'app-5', manifestUrl: 'http://www.sbb.ch:42/manifest.json'});
      expect(appRegistry.getApplication('app-5').baseUrl).toEqual('http://www.sbb.ch:42');
      expect(appRegistry.getApplication('app-5').manifestUrl).toEqual('http://www.sbb.ch:42/manifest.json');

      registerApp({name: 'app-6', manifestUrl: 'http://www.sbb.ch'});
      expect(appRegistry.getApplication('app-6').baseUrl).toEqual('http://www.sbb.ch');
      expect(appRegistry.getApplication('app-6').manifestUrl).toEqual('http://www.sbb.ch/');

      registerApp({name: 'app-7', manifestUrl: 'http://www.sbb.ch:8080/manifest.json'});
      expect(appRegistry.getApplication('app-7').baseUrl).toEqual('http://www.sbb.ch:8080');
      expect(appRegistry.getApplication('app-7').manifestUrl).toEqual('http://www.sbb.ch:8080/manifest.json');
    });

    it('should be the \'baseUrl\' as specified in the manifest (if \'baseUrl\' is an absolute URL)', () => {
      registerApp({name: 'app-1', manifestUrl: 'http://194.150.245.142:80/manifest', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-1').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-1').manifestUrl).toEqual('http://194.150.245.142/manifest');

      registerApp({name: 'app-2', manifestUrl: 'http://194.150.245.142/manifest', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-2').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-2').manifestUrl).toEqual('http://194.150.245.142/manifest');

      registerApp({name: 'app-3', manifestUrl: 'https://194.150.245.142/manifest', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-3').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-3').manifestUrl).toEqual('https://194.150.245.142/manifest');

      registerApp({name: 'app-4', manifestUrl: 'https://www.sbb.ch/manifest', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-4').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-4').manifestUrl).toEqual('https://www.sbb.ch/manifest');

      registerApp({name: 'app-5', manifestUrl: 'http://www.sbb.ch:42/manifest', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-5').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-5').manifestUrl).toEqual('http://www.sbb.ch:42/manifest');

      registerApp({name: 'app-6', manifestUrl: 'http://www.sbb.ch', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-6').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-6').manifestUrl).toEqual('http://www.sbb.ch/');

      registerApp({name: 'app-7', manifestUrl: 'http://www.sbb.ch:8080', baseUrl: 'http://www.sbb.com/app'});
      expect(appRegistry.getApplication('app-7').baseUrl).toEqual('http://www.sbb.com/app');
      expect(appRegistry.getApplication('app-7').manifestUrl).toEqual('http://www.sbb.ch:8080/');
    });

    it('should be the \'baseUrl\' as specified in the manifest relative to the origin of \'manifestUrl\' (if \'baseUrl\' is a relative URL)', () => {
      registerApp({name: 'app-1', manifestUrl: 'http://194.150.245.142:80/manifest', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-1').baseUrl).toEqual('http://194.150.245.142/app');
      expect(appRegistry.getApplication('app-1').manifestUrl).toEqual('http://194.150.245.142/manifest');

      registerApp({name: 'app-2', manifestUrl: 'http://194.150.245.142/manifest', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-2').baseUrl).toEqual('http://194.150.245.142/app');
      expect(appRegistry.getApplication('app-2').manifestUrl).toEqual('http://194.150.245.142/manifest');

      registerApp({name: 'app-3', manifestUrl: 'https://194.150.245.142/manifest', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-3').baseUrl).toEqual('https://194.150.245.142/app');
      expect(appRegistry.getApplication('app-3').manifestUrl).toEqual('https://194.150.245.142/manifest');

      registerApp({name: 'app-4', manifestUrl: 'https://www.sbb.ch/manifest', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-4').baseUrl).toEqual('https://www.sbb.ch/app');
      expect(appRegistry.getApplication('app-4').manifestUrl).toEqual('https://www.sbb.ch/manifest');

      registerApp({name: 'app-5', manifestUrl: 'http://www.sbb.ch:42/manifest', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-5').baseUrl).toEqual('http://www.sbb.ch:42/app');
      expect(appRegistry.getApplication('app-5').manifestUrl).toEqual('http://www.sbb.ch:42/manifest');

      registerApp({name: 'app-6', manifestUrl: 'http://www.sbb.ch', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-6').baseUrl).toEqual('http://www.sbb.ch/app');
      expect(appRegistry.getApplication('app-6').manifestUrl).toEqual('http://www.sbb.ch/');

      registerApp({name: 'app-7', manifestUrl: 'http://www.sbb.ch:8080', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-7').baseUrl).toEqual('http://www.sbb.ch:8080/app');
      expect(appRegistry.getApplication('app-7').manifestUrl).toEqual('http://www.sbb.ch:8080/');
    });

    it('should use the origin of the window if the manifest URL is relative', () => {
      registerApp({name: 'app-1', manifestUrl: '/assets/manifest.json'});
      expect(appRegistry.getApplication('app-1').baseUrl).toEqual(window.origin);
      expect(appRegistry.getApplication('app-1').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({name: 'app-2', manifestUrl: 'manifest.json'});
      expect(appRegistry.getApplication('app-2').baseUrl).toEqual(window.origin);
      expect(appRegistry.getApplication('app-2').manifestUrl).toEqual(window.origin + '/manifest.json');

      registerApp({name: 'app-3', manifestUrl: '/manifest.json'});
      expect(appRegistry.getApplication('app-3').baseUrl).toEqual(window.origin);
      expect(appRegistry.getApplication('app-3').manifestUrl).toEqual(window.origin + '/manifest.json');

      registerApp({name: 'app-4', manifestUrl: 'assets/manifest.json'});
      expect(appRegistry.getApplication('app-4').baseUrl).toEqual(window.origin);
      expect(appRegistry.getApplication('app-4').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({name: 'app-5', manifestUrl: 'assets/manifest.json', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-5').baseUrl).toEqual(window.origin + '/app');
      expect(appRegistry.getApplication('app-5').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({name: 'app-6', manifestUrl: '/assets/manifest.json', baseUrl: 'app'});
      expect(appRegistry.getApplication('app-6').baseUrl).toEqual(window.origin + '/app');
      expect(appRegistry.getApplication('app-6').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({name: 'app-7', manifestUrl: '/assets/manifest.json', baseUrl: 'https://www.sbb.ch'});
      expect(appRegistry.getApplication('app-7').baseUrl).toEqual('https://www.sbb.ch/');
      expect(appRegistry.getApplication('app-7').manifestUrl).toEqual(window.origin + '/assets/manifest.json');
    });

    function registerApp(app: { name: string; manifestUrl: string; baseUrl?: string }): void {
      appRegistry.registerApplication({symbolicName: app.name, manifestUrl: app.manifestUrl}, {
        name: app.name,
        capabilities: [],
        intents: [],
        baseUrl: app.baseUrl,
      });
    }
  });

  describe('Symbolic name', () => {

    it('should be unique', () => {
      registerApp({symbolicName: 'app-1'});
      expect(() => registerApp({symbolicName: 'app-1'})).toThrowError(/ApplicationRegistrationError/);
    });

    it('should be lowercase and contain alphanumeric and/or dash characters', () => {
      registerApp({symbolicName: 'app-1'});
      expect(() => registerApp({symbolicName: 'APP-1'})).toThrowError(/ApplicationRegistrationError/);
      expect(() => registerApp({symbolicName: 'app.1'})).toThrowError(/ApplicationRegistrationError/);
      expect(() => registerApp({symbolicName: 'app#1'})).toThrowError(/ApplicationRegistrationError/);
      expect(() => registerApp({symbolicName: 'app/1'})).toThrowError(/ApplicationRegistrationError/);
      expect(() => registerApp({symbolicName: 'app\\1'})).toThrowError(/ApplicationRegistrationError/);
      expect(() => registerApp({symbolicName: 'app&1'})).toThrowError(/ApplicationRegistrationError/);
      expect(() => registerApp({symbolicName: 'app?1'})).toThrowError(/ApplicationRegistrationError/);
    });

    function registerApp(app: { symbolicName: string }): void {
      appRegistry.registerApplication({symbolicName: app.symbolicName, manifestUrl: 'http://www.sbb.ch'}, {
        name: app.symbolicName,
        capabilities: [],
        intents: [],
      });
    }
  });
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/

@NgModule({
  providers: [
    ManifestRegistry,
    ApplicationRegistry,
  ],
})
class AppTestModule {
}
