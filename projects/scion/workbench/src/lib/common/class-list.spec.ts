/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ClassList} from './class-list';
import {ObserveCaptor} from '@scion/toolkit/testing';

describe('ClassList', () => {

  it('should contain CSS classes by scope', () => {
    const classList = new ClassList();

    // Set CSS classes in different scopes.
    classList.set(['testee-application-1', 'testee-application-2'], {scope: 'application'});
    classList.set('testee-navigation', {scope: 'navigation'});
    classList.set('testee-layout', {scope: 'layout'});

    expect(classList.value).toEqual(jasmine.arrayWithExactContents([
      'testee-application-1',
      'testee-application-2',
      'testee-navigation',
      'testee-layout',
    ]));
    expect(classList.get({scope: 'application'})).toEqual(jasmine.arrayWithExactContents([
      'testee-application-1',
      'testee-application-2',
    ]));
    expect(classList.get({scope: 'navigation'})).toEqual(['testee-navigation']);
    expect(classList.get({scope: 'layout'})).toEqual(['testee-layout']);
    expect(classList.get({scope: 'route'})).toEqual([]);
  });

  it('should not overwrite CSS classes of other scopes', () => {
    const classList = new ClassList();
    classList.set('testee-application', {scope: 'application'});

    // Overwrite CSS classes of scope 'layout'.
    classList.set('testee-layout', {scope: 'layout'});
    expect(classList.value).toEqual(jasmine.arrayWithExactContents([
      'testee-application',
      'testee-layout',
    ]));
  });

  it('should remove CSS classes by scope', () => {
    const classList = new ClassList();
    classList.set('testee-application', {scope: 'application'});
    classList.set('testee-layout', {scope: 'layout'});

    // Remove CSS classes of scope 'layout'.
    classList.remove({scope: 'layout'});
    expect(classList.value).toEqual(['testee-application']);
  });

  it('should remove duplicate CSS classes', () => {
    const classList = new ClassList();
    classList.set(['testee', 'testee-application'], {scope: 'application'});
    classList.set(['testee', 'testee-layout'], {scope: 'layout'});

    // Remove CSS classes of scope 'layout'.
    expect(classList.value).toEqual(jasmine.arrayWithExactContents([
      'testee',
      'testee-application',
      'testee-layout',
    ]));
  });

  it('should return same reference to value array', () => {
    const classList = new ClassList();
    const value = classList.value;

    // Set CSS classes in scope 'application'.
    classList.set('testee-application-1', {scope: 'application'});
    expect(value).toEqual(['testee-application-1']);

    // Replace CSS classes in scope 'application'.
    classList.set('testee-application-2', {scope: 'application'});
    expect(value).toEqual(['testee-application-2']);

    // Set CSS classes in scope 'layout'.
    classList.set(['testee-layout-1', 'testee-layout-2'], {scope: 'layout'});
    expect(value).toEqual(jasmine.arrayWithExactContents([
      'testee-layout-1',
      'testee-layout-2',
      'testee-application-2',
    ]));
  });

  it('should emit on change', () => {
    const classList = new ClassList();
    const captor = new ObserveCaptor();
    classList.value$.subscribe(captor);

    // Set CSS classes in scope 'application'.
    classList.set('testee-application-1', {scope: 'application'});
    expect(captor.getValues()).toEqual([
      [],
      jasmine.arrayWithExactContents([
        'testee-application-1',
      ]),
    ]);

    // Set CSS classes in scope 'layout'.
    classList.set(['testee-layout-1', 'testee-layout-2'], {scope: 'layout'});
    expect(captor.getValues()).toEqual([
      [],
      jasmine.arrayWithExactContents([
        'testee-application-1',
      ]),
      jasmine.arrayWithExactContents([
        'testee-application-1',
        'testee-layout-1',
        'testee-layout-2',
      ]),
    ]);

    // Replace CSS classes in scope 'application'.
    classList.set(['testee-application-3'], {scope: 'application'});
    expect(captor.getValues()).toEqual([
      [],
      jasmine.arrayWithExactContents([
        'testee-application-1',
      ]),
      jasmine.arrayWithExactContents([
        'testee-application-1',
        'testee-layout-1',
        'testee-layout-2',
      ]),
      jasmine.arrayWithExactContents([
        'testee-application-3',
        'testee-layout-1',
        'testee-layout-2',
      ]),
    ]);
  });

  it('should provide class list as readonly Map', () => {
    const classList = new ClassList();

    // Set CSS classes in different scopes.
    classList.set(['testee-application-1', 'testee-application-2'], {scope: 'application'});
    classList.set('testee-navigation', {scope: 'navigation'});
    classList.set('testee-layout', {scope: 'layout'});

    const actual = classList.toMap();
    expect(actual).toEqual(new Map()
      .set('navigation', ['testee-navigation'])
      .set('layout', ['testee-layout'])
      .set('application', ['testee-application-1', 'testee-application-2']),
    );

    // Expect Map to be immutable.
    classList.set('testee-layout-2', {scope: 'layout'});
    expect(actual).toEqual(new Map()
      .set('navigation', ['testee-navigation'])
      .set('layout', ['testee-layout'])
      .set('application', ['testee-application-1', 'testee-application-2']),
    );
  });
});
