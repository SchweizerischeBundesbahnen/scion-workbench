/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchElementRegistry} from './workbench-element-registry';
import {createEnvironmentInjector, effect, EnvironmentInjector, runInInjectionContext} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('WorkbenchElementRegistry', () => {

  it('should register an element', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    registry.register('1', {id: '1'});
    expect(registry.elements()).toEqual([{id: '1'}]);
    expect(registry.get('1')).toEqual({id: '1'});

    registry.register('2', {id: '2'});
    expect(registry.elements()).toEqual([{id: '1'}, {id: '2'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2')).toEqual({id: '2'});

    registry.register('3', {id: '3'});
    expect(registry.elements()).toEqual([{id: '1'}, {id: '2'}, {id: '3'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2')).toEqual({id: '2'});
    expect(registry.get('3')).toEqual({id: '3'});
  });

  it('should remove an element', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    registry.register('3', {id: '3'});

    const removedElement = registry.unregister('2');
    expect(removedElement).toEqual({id: '2'});
    expect(registry.elements()).toEqual([{id: '1'}, {id: '3'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2', {orElse: null})).toBeNull();
    expect(registry.get('3')).toEqual({id: '3'});
  });

  it('should replace an existing element', () => {
    const log = new Array<string>();
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>({
      onUnregister: element => log.push(`Element "${element.id}" unregistered.`),
    }));

    registry.register('1', {id: '1', version: 1});
    registry.register('2', {id: '2', version: 1});
    registry.register('3', {id: '3', version: 1});
    expect(log).toEqual([]);

    // Replace element 2.
    registry.register('2', {id: '2', version: 2});
    expect(registry.elements()).toEqual([{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}]);

    expect(log).toEqual(['Element "2" unregistered.']);
  });

  it('should return `null` if element is not registered', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    expect(registry.get('1', {orElse: null})).toBeNull();
  });

  it('should throw if element is not registered', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    expect(() => registry.get('1')).toThrowError(`[NullElementError] Element '1' not found.`);
  });

  it('should throw specified error if element is not registered', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>({
      nullElementErrorFn: id => Error(`[CustomError] Element '${id}' not found.`),
    }));

    expect(() => registry.get('1')).toThrowError(`[CustomError] Element '1' not found.`);
  });

  it('should signal on registry change', async () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    const captor = new Array<TestElement[]>();

    registry.register('1', {id: '1', version: 1});

    // WHEN subscribing
    TestBed.runInInjectionContext(() => effect(() => captor.push(registry.elements())));
    TestBed.tick(); // flush effects

    // THEN expect an instant emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
    ]);

    // WHEN registering an element
    registry.register('2', {id: '2', version: 1});
    TestBed.tick(); // flush effects

    // THEN expect an emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
    ]);

    // WHEN registering an element
    registry.register('3', {id: '3', version: 1});
    TestBed.tick(); // flush effects

    // THEN expect an emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
    ]);

    // WHEN replacing an element
    registry.register('2', {id: '2', version: 2});
    TestBed.tick(); // flush effects

    // THEN expect an emission with the element replaced
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}],
    ]);

    // WHEN unregistering an element
    registry.unregister('2');
    TestBed.tick(); // flush effects

    // THEN expect an emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '3', version: 1}],
    ]);
  });

  it('should test whether an element exists', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    registry.register('1', {id: '1'});

    expect(registry.has('1')).toBeTrue();
    expect(registry.has('2')).toBeFalse();
  });

  it('should test whether the registry is empty', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>());

    expect(registry.isEmpty()).toBeTrue();

    registry.register('1', {id: '1'});
    expect(registry.isEmpty()).toBeFalse();

    registry.register('2', {id: '2'});
    expect(registry.isEmpty()).toBeFalse();

    registry.unregister('2');
    expect(registry.isEmpty()).toBeFalse();

    registry.unregister('1');
    expect(registry.isEmpty()).toBeTrue();
  });

  it('should invoke `onUnregister` function when element is unregistered', () => {
    const log = new Array<string>();

    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>({
      onUnregister: element => log.push(`Element "${element.id}" unregistered.`),
    }));

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    expect(log).toEqual([]);

    registry.unregister('2');
    expect(log).toEqual([
      'Element "2" unregistered.',
    ]);

    registry.unregister('1');
    expect(log).toEqual([
      'Element "2" unregistered.',
      'Element "1" unregistered.',
    ]);
  });

  it('should invoke `onUnregister` function when clearing registry', () => {
    const log = new Array<string>();

    const registry = TestBed.runInInjectionContext(() => new WorkbenchElementRegistry<string, TestElement>({
      onUnregister: element => log.push(`Element "${element.id}" unregistered.`),
    }));

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    expect(log).toEqual([]);

    // Clear the registry.
    registry.clear();
    expect(log).toEqual([
      'Element "1" unregistered.',
      'Element "2" unregistered.',
    ]);
  });

  it('should clear registry when injection context is destroyed', () => {
    const log = new Array<string>();

    const environmentInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const registry = runInInjectionContext(environmentInjector, () => new WorkbenchElementRegistry<string, TestElement>({
      onUnregister: element => log.push(`Element "${element.id}" unregistered.`),
    }));

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    expect(log).toEqual([]);

    // Destroy the injector.
    environmentInjector.destroy();
    expect(log).toEqual([
      'Element "1" unregistered.',
      'Element "2" unregistered.',
    ]);
    expect(registry.isEmpty()).toBeTrue();
  });
});

interface TestElement {
  id: string;
  version?: number;
}
