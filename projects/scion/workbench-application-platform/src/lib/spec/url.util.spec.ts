/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestBed } from '@angular/core/testing';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Url } from '../core/url.util';

describe('url.util', () => {

  it('should substitute path variables', () => {
    expect(Url.substitutePathVariables('persons/:id/salary', {id: 42})).toEqual(['persons', '42', 'salary']);
    expect(Url.substitutePathVariables('persons/:id/salary', {})).toEqual(['persons', ':id', 'salary']);
    expect(Url.substitutePathVariables(null, {})).toEqual([]);
  });

  it('should substitute param params', () => {
    expect(Url.substituteParamVariables({entity: 'person', id: ':id'}, {id: 42})).toEqual({entity: 'person', id: 42});
    expect(Url.substituteParamVariables({entity: 'person', id: ':id'}, {})).toEqual({entity: 'person', id: ':id'});
    expect(Url.substituteParamVariables(null, {})).toBeNull();
  });

  it('should serialize \'matrix and query params\' into a \'matrix param\' and parse it from the routed path params', () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])]
    });

    const matrixParam = Url.writeMatrixParamObject({
      queryParams: {
        queryParam1: 'queryParam1Value',
        queryParam2: 'queryParam1Value',
      },
      matrixParams: {
        matrixParam1: 'matrixParam1Value',
        matrixParam2: 'matrixParam2Value',
      }
    });

    const urlTree = TestBed.get(Router).createUrlTree(['foo', matrixParam]);

    const {matrixParams, queryParams} = Url.readMatrixParamObject(urlTree.root.children[PRIMARY_OUTLET].segments[0].parameters);
    expect(matrixParams).toEqual({
      matrixParam1: 'matrixParam1Value',
      matrixParam2: 'matrixParam2Value',
    });
    expect(queryParams).toEqual({
      queryParam1: 'queryParam1Value',
      queryParam2: 'queryParam1Value',
    });
  });

  it('should not serialize \'matrix and query params\' into a \'matrix param\' if not given', () => {
    const matrixParam = Url.writeMatrixParamObject({});
    expect(matrixParam).toBeNull();
  });

  it('should not fail if \'matrix and query params\' are not given in routed path params', () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])]
    });

    const urlTree = TestBed.get(Router).createUrlTree(['foo']);
    const {matrixParams, queryParams} = Url.readMatrixParamObject(urlTree.root.children[PRIMARY_OUTLET].segments[0].parameters);
    expect(matrixParams).toBeUndefined();
    expect(queryParams).toBeUndefined();
  });

  it('should create URL which may consist of matrix and query params', () => {
    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
    })).toEqual('http://localhost:8080/foo/bar', '(1)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['', ''],
    })).toEqual('http://localhost:8080', '(2)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['', ''],
    })).toEqual('http://localhost:8080', '(3)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
      queryParams: {
        'queryParam1': 'queryParam1Value',
      }
    })).toEqual('http://localhost:8080/foo/bar?queryParam1=queryParam1Value', '(4)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['foo', 'bar'],
      queryParams: {
        'queryParam1': 'queryParam1Value',
      }
    })).toEqual('http://localhost:8080/foo/bar?queryParam1=queryParam1Value', '(5)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['', ''],
      queryParams: {
        'queryParam1': 'queryParam1Value',
      }
    })).toEqual('http://localhost:8080?queryParam1=queryParam1Value', '(6)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['', ''],
      queryParams: {
        'queryParam1': 'queryParam1Value',
      }
    })).toEqual('http://localhost:8080?queryParam1=queryParam1Value', '(7)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      }
    })).toEqual('http://localhost:8080/foo/bar?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(8)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
      }
    })).toEqual('http://localhost:8080/foo/bar;matrixParam1=matrixParam1Value', '(9)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['foo', 'bar'],
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
      }
    })).toEqual('http://localhost:8080/foo/bar;matrixParam1=matrixParam1Value', '(10)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['', ''],
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
      }
    })).toEqual('http://localhost:8080;matrixParam1=matrixParam1Value', '(11)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['', ''],
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
      }
    })).toEqual('http://localhost:8080;matrixParam1=matrixParam1Value', '(12)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080/foo/bar;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value', '(13)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080/foo/bar;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(14)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['foo', 'bar'],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080/foo/bar;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(15)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['foo', 'bar'],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080/foo/bar;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(16)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: [],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(17)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: [],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(18)');

    expect(Url.createUrl({
      base: 'http://localhost:8080',
      path: ['', ''],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(19)');

    expect(Url.createUrl({
      base: 'http://localhost:8080/',
      path: ['', ''],
      queryParams: {
        'queryParam1': 'queryParam1Value',
        'queryParam2': 'queryParam2Value',
      },
      matrixParams: {
        'matrixParam1': 'matrixParam1Value',
        'matrixParam2': 'matrixParam2Value',
      }
    })).toEqual('http://localhost:8080;matrixParam1=matrixParam1Value;matrixParam2=matrixParam2Value?queryParam1=queryParam1Value&queryParam2=queryParam2Value', '(20)');
  });

  it('should detect an absolute URL', () => {
    expect(Url.isAbsoluteUrl('http://www.domain.com')).toBeTruthy('(1)');
    expect(Url.isAbsoluteUrl('https://www.domain.com')).toBeTruthy('(2)');
    expect(Url.isAbsoluteUrl('')).toBeFalsy('(3)');
    expect(Url.isAbsoluteUrl('path')).toBeFalsy('(4)');
    expect(Url.isAbsoluteUrl('/path')).toBeFalsy('(5)');
    expect(Url.isAbsoluteUrl('/')).toBeFalsy('(6)');
    expect(Url.isAbsoluteUrl('path/path')).toBeFalsy('(7)');
    expect(Url.isAbsoluteUrl('/path/path')).toBeFalsy('(8)');
  });

  it('should return the segments of a path', () => {
    expect(Url.toSegments('/a/b/c/')).toEqual(['a', 'b', 'c']);
    expect(Url.toSegments('a/b/c')).toEqual(['a', 'b', 'c']);
    expect(Url.toSegments('/a/b/c')).toEqual(['a', 'b', 'c']);
    expect(Url.toSegments('a/b/c/')).toEqual(['a', 'b', 'c']);
    expect(Url.toSegments('/a/')).toEqual(['a']);
    expect(Url.toSegments('/a')).toEqual(['a']);
    expect(Url.toSegments('a/')).toEqual(['a']);
    expect(Url.toSegments('a')).toEqual(['a']);
    expect(Url.toSegments('')).toEqual([]);
    expect(Url.toSegments(null)).toEqual([]);
  });
});
