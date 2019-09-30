/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Defined } from '@scion/toolkit/util';
import { MicrofrontendPlatformState, PlatformStates } from './microfrontend-platform-state';

const initializers: InitializerFn[] = [];
const beanRegistry = new Map<Type<any> | AbstractType<any>, BeanMetaData>();
const platformState = new MicrofrontendPlatformState();

/**
 * Allows looking up beans registered with the platform.
 *
 * A bean can be any object and is registered under some symbol with this bean manager. A symbol is either a class type
 * or an abstract class type.
 *
 * Beans are application-scoped and, by default, are constructed lazily when looked up for the first time - a bean's
 * construction strategy, however, can be changed when registering the bean. Beans with an eager construction strategy
 * are constructed after all initializers completed, in the order as registered.
 *
 * Beans do not support field or constructor injection. Instead, a bean can programmatically lookup dependent beans.
 * It is allowed to lookup other beans during bean construction.
 *
 * If a bean implements {@link PreDestroy} lifecycle hook, it is invoked when the platform is shutting down.
 */
export const Beans = new class {

  /**
   * Registers a bean under the given symbol.
   *
   * If not providing options, the given symbol is used as the constructor function to construct the bean.
   *
   * By default, bean construction is lazy, meaning that the bean is constructed when looked up for the first time.
   *
   * @param symbol
   *        Symbol under which to register/lookup the bean.
   * @param descriptor
   *        Control bean construction; see {@link BeanConstructDescriptor} for more detail.
   */
  public register<T>(symbol: Type<T | any> | AbstractType<T | any>, descriptor?: BeanConstructDescriptor<T>): void {
    if (!symbol) {
      throw Error('[BeanRegisterError] Missing symbol to register/lookup the bean.');
    }

    // if there is already a bean registered under the given symbol, destroy it.
    if (beanRegistry.has(symbol)) {
      destroyBean(beanRegistry.get(symbol));
    }

    const beanMetaData: BeanMetaData<T> = {
      symbol: symbol,
      beanConstructFn: createBeanConstructFunction(symbol, descriptor),
      eager: Defined.orElse(descriptor && descriptor.eager, false),
      registrationInstant: instantProvider.get(),
    };
    beanRegistry.set(symbol, beanMetaData);

    // Construct the bean if having eager construction strategy unless the platform is not started yet.
    if (beanMetaData.eager) {
      if (Beans.get(MicrofrontendPlatformState).state === PlatformStates.Started) {
        Beans.get(symbol);
      }
    }
  }

  /**
   * Registers a bean under the given symbol, but only if no bean is registered under the given symbol yet.
   *
   * If not providing options, the given symbol is used as the constructor function to construct the bean.
   *
   * By default, bean construction is lazy, meaning that the bean is constructed when looked up for the first time.
   *
   * @param symbol
   *        Symbol under which to register/lookup the bean.
   * @param descriptor
   *        Control bean construction; see {@link BeanConstructDescriptor} for more detail.
   */
  public registerIfAbsent<T>(symbol: Type<T | any> | AbstractType<T | any>, descriptor?: BeanConstructDescriptor<T>): void {
    if (!symbol) {
      throw Error('[BeanRegisterError] Missing symbol to register/lookup the bean.');
    }

    if (!beanRegistry.has(symbol)) {
      this.register(symbol, descriptor);
    }
  }

  /**
   * Registers an initializer which is executed before the construction of beans with an eager construction strategy.
   */
  public registerInitializer(initializer: InitializerFn | { useFunction?: InitializerFn, useClass?: Type<Initializer> }): void {
    if (typeof initializer === 'function') {
      initializers.push(initializer);
    }
    else if (initializer.useFunction) {
      initializers.push(initializer.useFunction);
    }
    else if (initializer.useClass) {
      initializers.push((): Promise<void> => new initializer.useClass().init());
    }
    else {
      throw Error('[NullInitializerError] No initializer specified.');
    }
  }

  /**
   * Returns the bean registered under the given symbol, or throws an error if not registered.
   *
   * @param symbol
   *        Symbol to lookup the bean.
   * @param options
   *        Controls what to do if no bean is registered under the given symbol.
   */
  public get<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>, options?: { orElseThrow?: boolean, orElseGet?: T, orElseSupply?: () => T }): T | undefined {
    if (symbol === MicrofrontendPlatformState) {
      return platformState as any;
    }

    const beanMetaData = beanRegistry.get(symbol);
    if (!beanMetaData) {
      if (options && options.orElseGet) {
        return options.orElseGet;
      }
      if (options && options.orElseSupply) {
        return options.orElseSupply();
      }
      if (Defined.orElse(options && options.orElseThrow, true)) {
        throw Error(`[NullBeanError] No bean registered under the symbol '${symbol.name}'.`);
      }
      return undefined;
    }
    if (beanMetaData.constructing) {
      throw Error(`[BeanConstructError] Circular bean construction cycle detected [bean={${symbol.name}}].`);
    }

    // check if the bean is already constructed.
    if (beanMetaData.instance) {
      return beanMetaData.instance;
    }

    // construct the bean.
    beanMetaData.constructing = true;
    try {
      return (beanMetaData.instance = beanMetaData.beanConstructFn());
    }
    finally {
      beanMetaData.constructing = false;
    }
  }

  /**
   * @internal
   */
  public init(): Promise<void> {
    return Promise.all(initializers.map(fn => fn()))
      .then(() => constructEagerBeans())
      .catch(error => {
        return Promise.reject(`[BeanManagerInitError] Bean manager failed to initialize. Initializer rejected with error: ${error}.`);
      });
  }

  /** @internal **/
  public destroy(): void {
    beanRegistry.forEach(destroyBean);
    beanRegistry.clear();
    initializers.length = 0;
  }
};

function constructEagerBeans(): void {
  Array.from(beanRegistry.values())
    .filter(beanMetaData => beanMetaData.eager)
    .sort((a, b) => a.registrationInstant - b.registrationInstant)
    .forEach(beanMetaData => Beans.get(beanMetaData.symbol));
}

function destroyBean(beanMetaData: BeanMetaData): void {
  if (beanMetaData.instance && typeof (beanMetaData.instance as PreDestroy).preDestroy === 'function') {
    (beanMetaData.instance as PreDestroy).preDestroy();
    beanMetaData.instance = null;
  }
}

function createBeanConstructFunction<T>(symbol: Type<T | any> | AbstractType<T | any>, options?: BeanConstructDescriptor<T>): () => T {
  if (options && options.useValue) {
    return (): T => options.useValue;
  }
  else if (options && options.useClass) {
    return (): T => new options.useClass() as T;
  }
  else {
    return (): T => new (symbol as Type<T>)() as T;
  }
}

/**
 * Lifecycle hook invoked when the bean is about to be destroyed.
 */
export interface PreDestroy {
  preDestroy(): void;
}

interface BeanMetaData<T = any> {
  symbol: Type<T | any> | AbstractType<T | any>;
  instance?: T;
  constructing?: boolean;
  beanConstructFn: () => T;
  eager: boolean;
  registrationInstant: number;
}

/**
 * Control how to construct a bean.
 */
export interface BeanConstructDescriptor<T = any> {
  /**
   * Set if to use a static value as bean instance.
   */
  useValue?: T;
  /**
   * Set if to create an instance of a class as bean instance.
   */
  useClass?: Type<T>;
  /**
   * Set if to construct the bean eagerly. By default, bean construction is lazy when the bean is looked up for the first time.
   */
  eager?: boolean;
}

/**
 * Allows executing some asynchronous work before initializing the bean manager.
 *
 * Initializers may run in parallel. For this reason, there must be no dependency in any initializer on the order
 * of execution of the initializers.
 *
 * It is allowed to lookup beans inside an initializer.
 */
export interface Initializer {
  init(): Promise<void>;
}

/**
 * Allows executing some asynchronous work before initializing the bean manager.
 *
 * Initializers may run in parallel. For this reason, there must be no dependency in any initializer on the order
 * of execution of the initializers.
 *
 * It is allowed to lookup beans inside an initializer.
 */
export declare type InitializerFn = () => Promise<void>;

/**
 * Represents a symbol of an abstract class.
 */
export interface AbstractType<T> extends Function {
  prototype: T;
}

/**
 * Represents a symbol of a class.
 */
export interface Type<T> extends Function {
  new(...args: any[]): T; // tslint:disable-line:callable-types
}

const instantProvider = new class {

  private _sequence = 0;

  public get(): number {
    return ++this._sequence;
  }
};
