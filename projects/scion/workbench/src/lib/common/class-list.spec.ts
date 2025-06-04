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
import {effect} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('ClassList', () => {

  it('should contain CSS classes by scope', () => {
    const classList = new ClassList();

    // Set CSS classes in different scopes.
    classList.application = ['testee-application-1', 'testee-application-2'];
    classList.navigation = 'testee-navigation';
    classList.layout = 'testee-layout';

    expect(classList.asList()).toEqual(jasmine.arrayWithExactContents([
      'testee-application-1',
      'testee-application-2',
      'testee-navigation',
      'testee-layout',
    ]));
    expect(classList.application()).toEqual(jasmine.arrayWithExactContents([
      'testee-application-1',
      'testee-application-2',
    ]));
    expect(classList.navigation()).toEqual(['testee-navigation']);
    expect(classList.layout()).toEqual(['testee-layout']);
    expect(classList.route()).toEqual([]);
  });

  it('should not overwrite CSS classes of other scopes', () => {
    const classList = new ClassList();
    classList.application = 'testee-application';

    // Overwrite CSS classes of scope 'layout'.
    classList.layout = 'testee-layout';
    expect(classList.asList()).toEqual(jasmine.arrayWithExactContents([
      'testee-application',
      'testee-layout',
    ]));
  });

  it('should remove CSS classes by scope', () => {
    const classList = new ClassList();
    classList.application = 'testee-application';
    classList.layout = 'testee-layout';

    // Remove CSS classes of scope 'layout'.
    classList.layout = null;
    expect(classList.asList()).toEqual(['testee-application']);
  });

  it('should remove duplicate CSS classes', () => {
    const classList = new ClassList();
    classList.application = ['testee', 'testee-application'];
    classList.layout = ['testee', 'testee-layout'];

    // Remove CSS classes of scope 'layout'.
    expect(classList.asList()).toEqual(jasmine.arrayWithExactContents([
      'testee',
      'testee-application',
      'testee-layout',
    ]));
  });

  it('should emit on change', () => {
    const classList = new ClassList();
    const captor = new Array<string[]>();

    TestBed.runInInjectionContext(() => effect(() => captor.push(classList.asList())));
    TestBed.tick(); // flush effects

    // Set CSS classes in scope 'application'.
    classList.application = 'testee-application-1';
    TestBed.tick(); // flush effects
    expect(captor).toEqual([
      [],
      jasmine.arrayWithExactContents([
        'testee-application-1',
      ]),
    ]);

    // Set CSS classes in scope 'layout'.
    classList.layout = ['testee-layout-1', 'testee-layout-2'];
    TestBed.tick(); // flush effects
    expect(captor).toEqual([
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
    classList.application = ['testee-application-3'];
    TestBed.tick(); // flush effects
    expect(captor).toEqual([
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
    classList.application = ['testee-application-1', 'testee-application-2'];
    classList.navigation = 'testee-navigation';
    classList.layout = 'testee-layout';

    const actual = classList.asMap();
    expect(actual).toEqual(new Map()
      .set('navigation', ['testee-navigation'])
      .set('layout', ['testee-layout'])
      .set('application', ['testee-application-1', 'testee-application-2']),
    );

    // Expect Map to be immutable.
    classList.layout = 'testee-layout-2';
    expect(actual).toEqual(new Map()
      .set('navigation', ['testee-navigation'])
      .set('layout', ['testee-layout'])
      .set('application', ['testee-application-1', 'testee-application-2']),
    );
  });

  it('should not change if setting same CSS classes', () => {
    const classList = new ClassList();
    const captor = new Array<string[]>();

    TestBed.runInInjectionContext(() => effect(() => captor.push(classList.asList())));

    // Set CSS classes.
    classList.application = ['a'];
    classList.route = ['b'];
    classList.navigation = ['c'];
    classList.layout = ['d'];
    TestBed.tick(); // flush effects
    expect(captor).toEqual([
      jasmine.arrayWithExactContents(['a', 'b', 'c', 'd']),
    ]);

    // Set same CSS classes.
    classList.application = ['a'];
    classList.route = ['b'];
    classList.navigation = ['c'];
    classList.layout = ['d'];
    TestBed.tick(); // flush effects

    // Expect no change.
    expect(captor).toEqual([
      jasmine.arrayWithExactContents(['a', 'b', 'c', 'd']),
    ]);

    // Set different CSS classes.
    classList.application = ['A'];
    classList.route = ['b'];
    classList.navigation = ['C'];
    classList.layout = ['d'];
    TestBed.tick(); // flush effects

    // Expect change.
    expect(captor).toEqual([
      jasmine.arrayWithExactContents(['a', 'b', 'c', 'd']),
      jasmine.arrayWithExactContents(['A', 'b', 'C', 'd']),
    ]);
  });
});
