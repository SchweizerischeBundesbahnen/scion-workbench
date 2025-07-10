/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchObjectRegistry} from './workbench-object-registry';
import {createEnvironmentInjector, effect, EnvironmentInjector, runInInjectionContext} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('WorkbenchObjectRegistry', () => {

  it('should register an object', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

    registry.register('1', {id: '1'});
    expect(registry.objects()).toEqual([{id: '1'}]);
    expect(registry.get('1')).toEqual({id: '1'});

    registry.register('2', {id: '2'});
    expect(registry.objects()).toEqual([{id: '1'}, {id: '2'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2')).toEqual({id: '2'});

    registry.register('3', {id: '3'});
    expect(registry.objects()).toEqual([{id: '1'}, {id: '2'}, {id: '3'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2')).toEqual({id: '2'});
    expect(registry.get('3')).toEqual({id: '3'});
  });

  it('should remove an object', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    registry.register('3', {id: '3'});

    const removedObject = registry.unregister('2');
    expect(removedObject).toEqual({id: '2'});
    expect(registry.objects()).toEqual([{id: '1'}, {id: '3'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2', {orElse: null})).toBeNull();
    expect(registry.get('3')).toEqual({id: '3'});
  });

  it('should replace an existing object', () => {
    const log = new Array<string>();
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>({
      onUnregister: object => log.push(`Object "${object.id}" unregistered.`),
    }));

    registry.register('1', {id: '1', version: 1});
    registry.register('2', {id: '2', version: 1});
    registry.register('3', {id: '3', version: 1});
    expect(log).toEqual([]);

    // Replace object 2.
    registry.register('2', {id: '2', version: 2});
    expect(registry.objects()).toEqual([{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}]);

    expect(log).toEqual(['Object "2" unregistered.']);
  });

  it('should return `null` if object is not registered', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

    expect(registry.get('1', {orElse: null})).toBeNull();
  });

  it('should throw if object is not registered', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

    expect(() => registry.get('1')).toThrowError(`[NullObjectError] Object '1' not found.`);
  });

  it('should throw specified error if object is not registered', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>({
      nullObjectErrorFn: id => Error(`[CustomError] Object '${id}' not found.`),
    }));

    expect(() => registry.get('1')).toThrowError(`[CustomError] Object '1' not found.`);
  });

  it('should signal on registry change', async () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

    const captor = new Array<TestObject[]>();

    registry.register('1', {id: '1', version: 1});

    // WHEN subscribing
    TestBed.runInInjectionContext(() => effect(() => captor.push(registry.objects())));
    TestBed.tick(); // flush effects

    // THEN expect an instant emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
    ]);

    // WHEN registering an object
    registry.register('2', {id: '2', version: 1});
    TestBed.tick(); // flush effects

    // THEN expect an emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
    ]);

    // WHEN registering an object
    registry.register('3', {id: '3', version: 1});
    TestBed.tick(); // flush effects

    // THEN expect an emission
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
    ]);

    // WHEN replacing an object
    registry.register('2', {id: '2', version: 2});
    TestBed.tick(); // flush effects

    // THEN expect an emission with the object replaced
    expect(captor).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}],
    ]);

    // WHEN unregistering an object
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

  it('should test whether an object exists', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

    registry.register('1', {id: '1'});

    expect(registry.has('1')).toBeTrue();
    expect(registry.has('2')).toBeFalse();
  });

  it('should test whether the registry is empty', () => {
    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>());

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

  it('should invoke `onUnregister` function when object is unregistered', () => {
    const log = new Array<string>();

    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>({
      onUnregister: object => log.push(`Object "${object.id}" unregistered.`),
    }));

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    expect(log).toEqual([]);

    registry.unregister('2');
    expect(log).toEqual([
      'Object "2" unregistered.',
    ]);

    registry.unregister('1');
    expect(log).toEqual([
      'Object "2" unregistered.',
      'Object "1" unregistered.',
    ]);
  });

  it('should invoke `onUnregister` function when clearing registry', () => {
    const log = new Array<string>();

    const registry = TestBed.runInInjectionContext(() => new WorkbenchObjectRegistry<string, TestObject>({
      onUnregister: object => log.push(`Object "${object.id}" unregistered.`),
    }));

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    expect(log).toEqual([]);

    // Clear the registry.
    registry.clear();
    expect(log).toEqual([
      'Object "1" unregistered.',
      'Object "2" unregistered.',
    ]);
  });

  it('should clear registry when injection context is destroyed', () => {
    const log = new Array<string>();

    const environmentInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const registry = runInInjectionContext(environmentInjector, () => new WorkbenchObjectRegistry<string, TestObject>({
      onUnregister: object => log.push(`Object "${object.id}" unregistered.`),
    }));

    registry.register('1', {id: '1'});
    registry.register('2', {id: '2'});
    expect(log).toEqual([]);

    // Destroy the injector.
    environmentInjector.destroy();
    expect(log).toEqual([
      'Object "1" unregistered.',
      'Object "2" unregistered.',
    ]);
    expect(registry.isEmpty()).toBeTrue();
  });
});

interface TestObject {
  id: string;
  version?: number;
}
