/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans } from '../../bean-manager';
import { RelativePathResolver } from './relative-path-resolver';
import { MicrofrontendPlatform } from '../../microfrontend-platform';

describe('RelativePathResolver', () => {

  beforeEach(async () => await MicrofrontendPlatform.startPlatform((): void => Beans.register(RelativePathResolver)));
  afterEach(async () => await MicrofrontendPlatform.destroy());

  describe('hash-based routing', () => {

    describe('URL without navigational symbols', () => {

      it('should append the path to the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/base/#/#fragment'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/base/#/#fragment'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/base/#/?a=b'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/base/#/?a=b'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/base/#/'}))
          .toEqual('http://localhost:4200/base/#/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/base/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/base/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/base/#/app/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');
      });
    });

    describe('URL with the navigational symbol `./`', () => {

      it('should append the path to the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');
      });
    });

    describe('URL with the navigational symbol `../`', () => {

      it('should append the path to the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/app/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment?a=b');
      });
    });

    describe('URL with the navigational symbol `/`', () => {

      it('should replace the path of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#/?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/#/'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/#/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/#/microfrontends/microfrontend-2#fragment?a=b');
      });
    });
  });

  describe('push-state routing', () => {

    describe('URL without navigational symbols', () => {
      it('should append the path to the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');
      });
    });

    describe('URL with the navigational symbol `./`', () => {
      it('should append the path to the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('./microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-1/microfrontends/microfrontend-2#fragment?a=b');
      });
    });

    describe('URL with the navigational symbol `../`', () => {
      it('should append the path to the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/app/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/app/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/app/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('../../microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment?a=b');
      });
    });

    describe('URL with the navigational symbol `/`', () => {
      it('should replace the path of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');
      });

      it('should ignore the fragment of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1#fragment'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');
      });

      it('should include the fragment of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment');
      });

      it('should ignore query params of the reference url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1', {relativeTo: 'http://localhost:4200/?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontend-2');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2', {relativeTo: 'http://localhost:4200/app/microfrontend-1?a=b'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2');
      });

      it('should include query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b');
      });

      it('should include fragment and query params of the url', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1?a=b#fragment', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2?a=b#fragment');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2?a=b#fragment', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2?a=b#fragment');
      });

      it('should not interpret the query parameter symbol \'?\' of the url if part of the fragment ', () => {
        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-1#fragment?a=b', {relativeTo: 'http://localhost:4200/'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-1#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontend-2#fragment?a=b');

        expect(Beans.get(RelativePathResolver).resolve('/microfrontends/microfrontend-2#fragment?a=b', {relativeTo: 'http://localhost:4200/app/microfrontend-1'}))
          .toEqual('http://localhost:4200/microfrontends/microfrontend-2#fragment?a=b');
      });
    });
  });
});
