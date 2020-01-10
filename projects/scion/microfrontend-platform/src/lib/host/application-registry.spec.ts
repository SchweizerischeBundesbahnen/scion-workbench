/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ApplicationRegistry } from './application-registry';
import { Beans } from '../bean-manager';
import { MicrofrontendPlatform } from '../microfrontend-platform';
import { ManifestRegistry } from './manifest.registry';

describe('ApplicationRegistry', () => {

  let registry: ApplicationRegistry;

  beforeEach(async () => {
    await MicrofrontendPlatform.destroy();
    await MicrofrontendPlatform.startPlatform(() => {
      Beans.register(ApplicationRegistry);
      Beans.register(ManifestRegistry);
    });
    registry = Beans.get(ApplicationRegistry);
  });
  afterEach(async () => await MicrofrontendPlatform.destroy());

  describe('app base URL', () => {

    it('should be the origin of \'manifestUrl\' if no \'baseUrl\' is specified in the manifest', () => {
      registerApp({symbolicName: 'app-1', manifestUrl: 'http://manifest-domain:80/manifest.json'});
      expect(registry.getApplication('app-1').baseUrl).toEqual('http://manifest-domain');
      expect(registry.getApplication('app-1').manifestUrl).toEqual('http://manifest-domain/manifest.json');

      registerApp({symbolicName: 'app-2', manifestUrl: 'http://manifest-domain/manifest.json'});
      expect(registry.getApplication('app-2').baseUrl).toEqual('http://manifest-domain');
      expect(registry.getApplication('app-2').manifestUrl).toEqual('http://manifest-domain/manifest.json');

      registerApp({symbolicName: 'app-3', manifestUrl: 'https://manifest-domain/manifest.json'});
      expect(registry.getApplication('app-3').baseUrl).toEqual('https://manifest-domain');
      expect(registry.getApplication('app-3').manifestUrl).toEqual('https://manifest-domain/manifest.json');

      registerApp({symbolicName: 'app-4', manifestUrl: 'http://manifest-domain:42/manifest.json'});
      expect(registry.getApplication('app-4').baseUrl).toEqual('http://manifest-domain:42');
      expect(registry.getApplication('app-4').manifestUrl).toEqual('http://manifest-domain:42/manifest.json');

      registerApp({symbolicName: 'app-5', manifestUrl: 'http://manifest-domain'});
      expect(registry.getApplication('app-5').baseUrl).toEqual('http://manifest-domain');
      expect(registry.getApplication('app-5').manifestUrl).toEqual('http://manifest-domain/');

      registerApp({symbolicName: 'app-6', manifestUrl: 'http://manifest-domain:8080/manifest.json'});
      expect(registry.getApplication('app-6').baseUrl).toEqual('http://manifest-domain:8080');
      expect(registry.getApplication('app-6').manifestUrl).toEqual('http://manifest-domain:8080/manifest.json');
    });

    it('should be the \'baseUrl\' as specified in the manifest (if \'baseUrl\' is an absolute URL)', () => {
      registerApp({symbolicName: 'app-1', manifestUrl: 'http://manifest-domain:80/manifest', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-1').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-1').manifestUrl).toEqual('http://manifest-domain/manifest');

      registerApp({symbolicName: 'app-2', manifestUrl: 'http://manifest-domain/manifest', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-2').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-2').manifestUrl).toEqual('http://manifest-domain/manifest');

      registerApp({symbolicName: 'app-3', manifestUrl: 'https://manifest-domain/manifest', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-3').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-3').manifestUrl).toEqual('https://manifest-domain/manifest');

      registerApp({symbolicName: 'app-4', manifestUrl: 'https://app-domain/manifest', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-4').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-4').manifestUrl).toEqual('https://app-domain/manifest');

      registerApp({symbolicName: 'app-5', manifestUrl: 'http://app-domain:42/manifest', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-5').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-5').manifestUrl).toEqual('http://app-domain:42/manifest');

      registerApp({symbolicName: 'app-6', manifestUrl: 'http://app-domain', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-6').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-6').manifestUrl).toEqual('http://app-domain/');

      registerApp({symbolicName: 'app-7', manifestUrl: 'http://app-domain:8080', baseUrl: 'http://app-domain/app'});
      expect(registry.getApplication('app-7').baseUrl).toEqual('http://app-domain/app');
      expect(registry.getApplication('app-7').manifestUrl).toEqual('http://app-domain:8080/');
    });

    it('should be the \'baseUrl\' as specified in the manifest relative to the origin of \'manifestUrl\' (if \'baseUrl\' is a relative URL)', () => {
      registerApp({symbolicName: 'app-1', manifestUrl: 'http://manifest-domain:80/manifest', baseUrl: 'app'});
      expect(registry.getApplication('app-1').baseUrl).toEqual('http://manifest-domain/app');
      expect(registry.getApplication('app-1').manifestUrl).toEqual('http://manifest-domain/manifest');

      registerApp({symbolicName: 'app-2', manifestUrl: 'http://manifest-domain/manifest', baseUrl: 'app'});
      expect(registry.getApplication('app-2').baseUrl).toEqual('http://manifest-domain/app');
      expect(registry.getApplication('app-2').manifestUrl).toEqual('http://manifest-domain/manifest');

      registerApp({symbolicName: 'app-3', manifestUrl: 'https://manifest-domain/manifest', baseUrl: 'app'});
      expect(registry.getApplication('app-3').baseUrl).toEqual('https://manifest-domain/app');
      expect(registry.getApplication('app-3').manifestUrl).toEqual('https://manifest-domain/manifest');

      registerApp({symbolicName: 'app-4', manifestUrl: 'http://manifest-domain:42/manifest', baseUrl: 'app'});
      expect(registry.getApplication('app-4').baseUrl).toEqual('http://manifest-domain:42/app');
      expect(registry.getApplication('app-4').manifestUrl).toEqual('http://manifest-domain:42/manifest');

      registerApp({symbolicName: 'app-5', manifestUrl: 'http://manifest-domain', baseUrl: 'app'});
      expect(registry.getApplication('app-5').baseUrl).toEqual('http://manifest-domain/app');
      expect(registry.getApplication('app-5').manifestUrl).toEqual('http://manifest-domain/');

      registerApp({symbolicName: 'app-6', manifestUrl: 'http://manifest-domain:8080', baseUrl: 'app'});
      expect(registry.getApplication('app-6').baseUrl).toEqual('http://manifest-domain:8080/app');
      expect(registry.getApplication('app-6').manifestUrl).toEqual('http://manifest-domain:8080/');
    });

    it('should use the origin of the window if the manifest URL is relative', () => {
      registerApp({symbolicName: 'app-1', manifestUrl: '/assets/manifest.json'});
      expect(registry.getApplication('app-1').baseUrl).toEqual(window.origin);
      expect(registry.getApplication('app-1').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({symbolicName: 'app-2', manifestUrl: 'manifest.json'});
      expect(registry.getApplication('app-2').baseUrl).toEqual(window.origin);
      expect(registry.getApplication('app-2').manifestUrl).toEqual(window.origin + '/manifest.json');

      registerApp({symbolicName: 'app-3', manifestUrl: '/manifest.json'});
      expect(registry.getApplication('app-3').baseUrl).toEqual(window.origin);
      expect(registry.getApplication('app-3').manifestUrl).toEqual(window.origin + '/manifest.json');

      registerApp({symbolicName: 'app-4', manifestUrl: 'assets/manifest.json'});
      expect(registry.getApplication('app-4').baseUrl).toEqual(window.origin);
      expect(registry.getApplication('app-4').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({symbolicName: 'app-5', manifestUrl: 'assets/manifest.json', baseUrl: 'app'});
      expect(registry.getApplication('app-5').baseUrl).toEqual(window.origin + '/app');
      expect(registry.getApplication('app-5').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({symbolicName: 'app-6', manifestUrl: '/assets/manifest.json', baseUrl: 'app'});
      expect(registry.getApplication('app-6').baseUrl).toEqual(window.origin + '/app');
      expect(registry.getApplication('app-6').manifestUrl).toEqual(window.origin + '/assets/manifest.json');

      registerApp({symbolicName: 'app-7', manifestUrl: '/assets/manifest.json', baseUrl: 'https://www.some-origin.com'});
      expect(registry.getApplication('app-7').baseUrl).toEqual('https://www.some-origin.com/');
      expect(registry.getApplication('app-7').manifestUrl).toEqual(window.origin + '/assets/manifest.json');
    });

    function registerApp(app: { symbolicName: string; manifestUrl: string; baseUrl?: string }): void {
      registry.registerApplication({symbolicName: app.symbolicName, manifestUrl: app.manifestUrl}, {
        name: app.symbolicName,
        capabilities: [],
        intents: [],
        baseUrl: app.baseUrl,
      });
    }
  });

  describe('symbolic app name', () => {

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
      registry.registerApplication({symbolicName: app.symbolicName, manifestUrl: 'http://www.some-origin.com'}, {
        name: app.symbolicName,
        capabilities: [],
        intents: [],
      });
    }
  });
});
