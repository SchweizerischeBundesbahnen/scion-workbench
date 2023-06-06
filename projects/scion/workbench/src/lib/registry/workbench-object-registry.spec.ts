/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchObjectRegistry} from './workbench-object-registry';
import {ObserveCaptor} from '@scion/toolkit/testing';

describe('WorkbenchObjectRegistry', () => {

  let registry: WorkbenchObjectRegistry<string, TestObject>;

  beforeEach(() => {
    registry = new WorkbenchObjectRegistry<string, TestObject>({
      keyFn: object => object.id,
      nullObjectErrorFn: id => Error(`[NullObjectError] Object '${id}' not found.`),
    });
  });

  it('should register an object', () => {
    registry.register({id: '1'});
    expect(registry.objects).toEqual([{id: '1'}]);
    expect(registry.get('1')).toEqual({id: '1'});

    registry.register({id: '2'});
    expect(registry.objects).toEqual([{id: '1'}, {id: '2'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2')).toEqual({id: '2'});

    registry.register({id: '3'});
    expect(registry.objects).toEqual([{id: '1'}, {id: '2'}, {id: '3'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2')).toEqual({id: '2'});
    expect(registry.get('3')).toEqual({id: '3'});
  });

  it('should remove an object', () => {
    registry.register({id: '1'});
    registry.register({id: '2'});
    registry.register({id: '3'});

    const removedObject = registry.unregister('2');
    expect(removedObject).toEqual({id: '2'});
    expect(registry.objects).toEqual([{id: '1'}, {id: '3'}]);
    expect(registry.get('1')).toEqual({id: '1'});
    expect(registry.get('2', {orElse: null})).toBeNull();
    expect(registry.get('3')).toEqual({id: '3'});
  });

  it('should replace an existing object', () => {
    registry.register({id: '1', version: 1});
    registry.register({id: '2', version: 1});
    registry.register({id: '3', version: 1});

    registry.register({id: '2', version: 2});
    expect(registry.objects).toEqual([{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}]);
  });

  it('should return `null` if object is not registered', () => {
    expect(registry.get('1', {orElse: null})).toBeNull();
  });

  it('should throw if object is not registered', () => {
    expect(() => registry.get('1')).toThrowError(`[NullObjectError] Object '1' not found.`);
  });

  it('should emit objects on registry change', async () => {
    const captor = new ObserveCaptor<TestObject[]>();

    registry.register({id: '1', version: 1});

    // WHEN subscribing
    registry.objects$.subscribe(captor);
    // THEN expect an instant emission
    expect(captor.getValues()).toEqual([
      [{id: '1', version: 1}],
    ]);

    // WHEN registering an object
    registry.register({id: '2', version: 1});
    // THEN expect an emission
    expect(captor.getValues()).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
    ]);

    // WHEN registering an object
    registry.register({id: '3', version: 1});
    // THEN expect an emission
    expect(captor.getValues()).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
    ]);

    // WHEN replacing an object
    registry.register({id: '2', version: 2});
    // THEN expect an emission with the object replaced
    expect(captor.getValues()).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}],
    ]);

    // // WHEN unregistering an object
    registry.unregister('2');
    // THEN expect an emission
    expect(captor.getValues()).toEqual([
      [{id: '1', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 1}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '2', version: 2}, {id: '3', version: 1}],
      [{id: '1', version: 1}, {id: '3', version: 1}],
    ]);
  });
});

interface TestObject {
  id: string;
  version?: number;
}
