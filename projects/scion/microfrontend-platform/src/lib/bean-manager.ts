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
import { PlatformState, PlatformStates } from './platform-state';

/** @ignore **/
const initializers: InitializerFn[] = [];
/** @ignore **/
const beanRegistry = new Map<Type<any> | AbstractType<any>, Set<BeanInfo>>();
/** @ignore **/
const beanDecoratorRegistry = new Map<Type<any> | AbstractType<any>, BeanDecorator<any>[]>();

/**
 * Provides the platform with a bean manager responsible for managing the lifecycle of beans.
 *
 * The bean manager is the central point to obtain bean instances. A bean can be any object which to register under some symbol.
 * A symbol is either a class type or an abstract class type. Beans are application-scoped (singleton) and are, by default,
 * constructed lazily when looked up for the first time.
 *
 * Some platform beans can be overridden if necessary, e.g., to override built-in platform behavior, or to mock beans in tests. For that, register the
 * overridden bean(s) under its original symbol before starting the platform.
 *
 * #### Initializers
 * To perform some initialization before eager beans are constructed, you can register an {@link Initializer} or {@link InitializerFn}. Initializers may
 * run in parallel. For this reason, there must be no dependency in any initializer on the order of the execution of the initializers.
 *
 * #### Bean decoration
 * The bean manager allows decorating a bean to intercept invocations to its methods and properties. For that, register a {@link BeanDecorator}
 * via {@link Beans.registerDecorator} method and return a proxy for the actual bean.
 *
 * *Bean decoration can be particularly useful for the {@link MessageClient}. The interaction between the message client and the broker happens in a separate browsing
 * context. In Angular, for example, the separate browsing context prevents Angular (or more precisely zone.js) from triggering a change detection cycle when receiving
 * messages, causing the UI not to update as expected. By decorating the message client, you can run the emissions of its Observables inside the Angular zone, which then
 * triggers a change detection cycle to synchronize the UI accordingly.*
 *
 * #### Bean registration
 * The API for registering beans is very much based on the providers API of Angular. Thus a bean is provided under some class symbol, and the bean instance can be
 * specified as following:
 *
 * |Strategy|Description|Example|
 * |-|-|-|
 * |useClass    |if to create an instance of a class                                   |```Beans.register(ContextService);```|
 * |useValue    |if to use a static value as bean                                      |```Beans.register(IS_PLATFORM_HOST, {useValue: true});```|
 * |useFactory  |if to construct the bean with a factory function                      |```Beans.register(MessageClient, {useFactory: () => new ɵMessageClient(...)});```|
 * |useExisting |if to create an alias for another bean registered in the bean manager |```Beans.register(MessageClient, {useExisting: PlatformMessageClient);```|
 *
 *
 * Multiple beans can be registered on the same symbol by setting the flag `multi` to `true`.
 * ```ts
 * Beans.register(MessageInterceptor, {useClass: SomeInterceptor, multi: true});
 * ```
 *
 * Beans can be configured to be constructed eagerly after all initializers completed. For that, set the flag `eager` to `true`.
 * ```ts
 * Beans.register(KeyboardEventDispatcher, {eager: true});
 * ```
 *
 * #### Bean destruction
 * If a bean implements the {@link PreDestroy} lifecycle hook, it is invoked when the platform is shutting down.\
 * Beans can be configured in which platform lifecycle phase to get destroyed. For that, set the `destroyPhase` accordingly when registering
 * the bean. If not specified, by default, beans are destroyed in the phase {@link PlatformStates.Stopping}. Set the phase to 'none' to not
 * destroy the bean at all. See {@link PlatformStates} for the different platform lifecycle phases.
 *
 * ```ts
 * Beans.register(MessageBroker, {destroyPhase: PlatformStates.Stopped});
 * Beans.register(PlatformState, {destroyPhase: 'none'});
 * ```
 *
 * ***
 *
 * <p>
 * The bean manager may also be used by the app to register application-specific beans, or to make framework-specific beans available to message interceptors or bean decorators.
 * </p>
 *
 * @category Platform
 */
// @dynamic `ng-packagr` does not support lamdas in statics if `strictMetaDataEmit` is enabled. `ng-packagr` is used to build this library. See https://github.com/ng-packagr/ng-packagr/issues/696#issuecomment-373487183.
export class Beans {

  /** @internal */
  public static initialize(): void {
    Beans.register(PlatformState, {destroyPhase: 'none', eager: true});
  }

  /**
   * Registers a bean under the given symbol.
   *
   * If not providing instructions, the given symbol is used as the constructor function to construct the bean.
   *
   * By default, bean construction is lazy, meaning that the bean is constructed when looked up for the first time.
   * If another bean is registered under the same symbol, that other bean is disposed and replaced with the given bean.
   * To register multiple beans on the same symbol, register it with the flag `multi` set to `true`.
   *
   * @param  symbol - Symbol under which to register the bean.
   * @param  instructions - Control bean construction; see {@link BeanInstanceConstructInstructions} for more detail.
   */
  public static register<T>(symbol: Type<T | any> | AbstractType<T | any>, instructions?: BeanInstanceConstructInstructions<T>): void {
    if (!symbol) {
      throw Error('[BeanRegisterError] Missing bean lookup symbol.');
    }

    // Check that only 'multi' or 'non-multi' beans are registered on the same symbol.
    const multi = Defined.orElse(instructions && instructions.multi, false);
    if (multi && beanRegistry.has(symbol) && Array.from(beanRegistry.get(symbol)).some(metaData => !metaData.multi)) {
      throw Error('[BeanRegisterError] Trying to register a bean as \'multi-bean\' on a symbol that has already registered a \'non-multi-bean\'. This is probably not what was intended.');
    }
    if (!multi && beanRegistry.has(symbol) && Array.from(beanRegistry.get(symbol)).some(metaData => metaData.multi)) {
      throw Error('[BeanRegisterError] Trying to register a bean on a symbol that has already registered a \'multi-bean\'. This is probably not what was intended.');
    }

    // Destroy an already registered bean on the same symbol, if any, unless multi is set to `true`.
    if (!multi && beanRegistry.has(symbol)) {
      destroyBean(beanRegistry.get(symbol).values().next().value);
    }

    const beanInfo: BeanInfo<T> = {
      symbol: symbol,
      beanConstructFn: deriveConstructFunction(symbol, instructions),
      eager: Defined.orElse(instructions && (instructions.eager || instructions.useValue !== undefined), false),
      multi: multi,
      destroyPhase: Defined.orElse(instructions && instructions.destroyPhase as any, PlatformStates.Stopping),
      useExisting: instructions && instructions.useExisting,
    };

    if (multi) {
      const beans = beanRegistry.get(symbol) || new Set<BeanInfo>();
      beanRegistry.set(symbol, beans.add(beanInfo));
    }
    else {
      beanRegistry.set(symbol, new Set<BeanInfo>([beanInfo]));
    }

    // Construct the bean if eager unless the platform is not startet yet.
    beanInfo.eager && Beans.get(PlatformState).whenState(PlatformStates.Started).then(() => {
      // Check if the bean is still registered in the bean manager
      if (beanRegistry.has(beanInfo.symbol) && beanRegistry.get(beanInfo.symbol).has(beanInfo)) {
        getOrConstructBeanInstance(beanInfo);
      }
    });

    // Destroy the bean on platform shutdown.
    if (beanInfo.destroyPhase !== 'none') {
      Beans.get(PlatformState).whenState(PlatformStates.Starting) // wait until starting the platform
        .then(() => Beans.get(PlatformState).whenState(beanInfo.destroyPhase as PlatformStates))
        .then(() => destroyBean(beanInfo));
    }
  }

  /**
   * Registers a bean under the given symbol, but only if no other bean is registered under that symbol yet.
   *
   * For detailed information about how to register a bean, see {@link register}.
   *
   * @param symbol - Symbol under which to register the bean.
   * @param instructions - Control bean construction; see {@link BeanInstanceConstructInstructions} for more detail.
   *
   * @internal
   */
  public static registerIfAbsent<T>(symbol: Type<T | any> | AbstractType<T | any>, instructions?: BeanInstanceConstructInstructions<T>): void {
    if (!symbol) {
      throw Error('[BeanRegisterError] Missing bean lookup symbol.');
    }

    if (!beanRegistry.has(symbol)) {
      Beans.register(symbol, instructions);
    }
  }

  /**
   * Registers a decorator to proxy a bean allowing to intercept invocations to its methods and properties.
   *
   * The decorator is invoked when the bean is constructed. Multiple decorators can be registered
   * to decorate a bean. They are invoked in the order as registered.
   *
   * @param symbol - Identifies the bean(s) which to decorate. If multiple beans are registered under that symbol, they all are decorated.
   * @param decorator - Specifies the decorator.
   */
  public static registerDecorator<T extends BeanDecorator<any>>(symbol: Type<any> | AbstractType<any>, decorator: { useValue: T } | { useClass?: Type<T> } | { useFactory?: () => T }): void {
    if (!symbol) {
      throw Error('[BeanDecoratorRegisterError] A decorator requires a symbol.');
    }

    const decorators = beanDecoratorRegistry.get(symbol) || [];
    beanDecoratorRegistry.set(symbol, decorators.concat(deriveConstructFunction(undefined, decorator)()));
  }

  /**
   * Registers an initializer which is executed before the construction of beans having an eager construction strategy.
   */
  public static registerInitializer(initializer: InitializerFn | { useFunction?: InitializerFn, useClass?: Type<Initializer> }): void {
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
   * Returns the bean registered under the given symbol.
   *
   * By default, if no or multiple beans are registered under the given symbol, an error is thrown.
   *
   * @param symbol - Symbol to lookup the bean.
   * @param orElse - Controls what to do if no bean is found under the given symbol. If not set and if no bean is found, the bean manager throws an error.
   * @throws if not finding a bean, or if multiple beans are found under the given symbol.
   */
  public static get<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>, orElse?: { orElseGet?: T, orElseSupply?: () => T }): T {
    const beans = Beans.all(symbol);
    switch (beans.length) {
      case 0: {
        if (orElse && orElse.orElseGet) {
          return orElse.orElseGet;
        }
        if (orElse && orElse.orElseSupply) {
          return orElse.orElseSupply();
        }
        throw Error(`[NullBeanError] No bean registered under the symbol '${symbol.name}'.`);
      }
      case 1: {
        return beans[0];
      }
      default: {
        throw Error(`[MultiBeanError] Multiple beans registered under the symbol '${symbol.name}'.`);
      }
    }
  }

  /**
   * Returns the bean registered under the given symbol, if any, or returns `undefined` otherwise.
   *
   * @param symbol - Symbol to lookup the bean.
   * @throws if multiple beans are found under the given symbol.
   */
  public static opt<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>): T | undefined {
    return Beans.get(symbol, {orElseSupply: (): undefined => undefined});
  }

  /**
   * Returns all beans registered under the given symbol. Returns an empty array if no bean is found.
   *
   * @param symbol - Symbol to lookup the beans.
   */
  public static all<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>): T[] {
    const beanInfos = Array.from(beanRegistry.get(symbol) || new Set<BeanInfo>());
    if (!beanInfos || !beanInfos.length) {
      return [];
    }
    if (beanInfos.some(beanInfo => beanInfo.constructing)) {
      throw Error(`[BeanConstructError] Circular bean construction cycle detected [bean={${symbol.name}}].`);
    }

    return beanInfos.map(beanInfo => getOrConstructBeanInstance(beanInfo));
  }

  /**
   * Returns metadata about beans registered under the given symbol.
   *
   * @internal
   */
  public static getBeanInfo<T>(symbol: Type<T | any> | AbstractType<T | any>): Set<BeanInfo<T>> {
    return beanRegistry.get(symbol);
  }

  /**
   * @internal
   */
  public static runInitializers(): Promise<void> {
    return Promise.all(initializers.map(fn => fn()))
      .then(() => Promise.resolve())
      .catch(error => Promise.reject(`[BeanManagerInitializerError] Initializer rejected with an error: ${error}`));
  }

  /** @internal **/
  public static destroy(): void {
    beanDecoratorRegistry.clear();
    initializers.length = 0;
  }
}

Beans.initialize();

/** @ignore **/
function getOrConstructBeanInstance<T>(beanInfo: BeanInfo): T {
  // Check if the bean is already constructed.
  if (beanInfo.instance) {
    return beanInfo.instance;
  }

  // Construct the bean and decorate it.
  beanInfo.constructing = true;
  try {
    const bean: T = beanInfo.beanConstructFn();
    const decorators = beanDecoratorRegistry.get(beanInfo.symbol) || [];
    return beanInfo.instance = decorators.reduce((decoratedBean, decorator) => decorator.decorate(decoratedBean), bean);
  }
  finally {
    beanInfo.constructing = false;
  }
}

/** @ignore **/
function destroyBean(beanInfo: BeanInfo): void {
  // Destroy the bean instance unless it is an alias for another bean, or if the bean does not implement 'preDestroy' lifecycle hook.
  if (!beanInfo.useExisting && beanInfo.instance && typeof (beanInfo.instance as PreDestroy).preDestroy === 'function') {
    beanInfo.instance.preDestroy();
  }

  const symbol = beanInfo.symbol;
  const beans = beanRegistry.get(symbol) || new Set<BeanInfo>();
  if (beans.delete(beanInfo) && beans.size === 0) {
    beanRegistry.delete(symbol);
  }
}

/** @ignore **/
function deriveConstructFunction<T>(symbol: Type<T | any> | AbstractType<T | any>, instructions?: InstanceConstructInstructions<T>): () => T {
  if (instructions && instructions.useValue !== undefined) {
    return (): T => instructions.useValue;
  }
  else if (instructions && instructions.useClass) {
    return (): T => new instructions.useClass();
  }
  else if (instructions && instructions.useFactory) {
    return (): T => instructions.useFactory();
  }
  else if (instructions && instructions.useExisting) {
    return (): T => Beans.get(instructions.useExisting);
  }
  else {
    return (): T => new (symbol as Type<T>)();
  }
}

/**
 * Lifecycle hook will be executed before destroying this bean.
 *
 * On platform shutdown, beans are destroyed when the platform enters {@link PlatformStates.Stopping} state.
 *
 * @category Platform
 */
export interface PreDestroy {
  preDestroy(): void;
}

/**
 * Metadata about a bean.
 *
 * @ignore
 */
export interface BeanInfo<T = any> {
  symbol: Type<T | any> | AbstractType<T | any>;
  instance?: T;
  constructing?: boolean;
  beanConstructFn: () => T;
  eager: boolean;
  multi: boolean;
  useExisting: Type<any> | AbstractType<any>;
  destroyPhase?: PlatformStates | 'none';
}

/**
 * Describes how an instance is created.
 *
 * @category Platform
 */
export interface InstanceConstructInstructions<T = any> {
  /**
   * Set if to use a static value as bean.
   */
  useValue?: T;
  /**
   * Set if to create an instance of a class.
   */
  useClass?: Type<T>;
  /**
   * Set if to construct the instance with a factory function.
   */
  useFactory?: () => T;
  /**
   * Set if to create an alias for another bean.
   */
  useExisting?: Type<any> | AbstractType<any>;
}

/**
 * Describes how a bean instance is created.
 *
 * @category Platform
 */
export interface BeanInstanceConstructInstructions<T = any> extends InstanceConstructInstructions {
  /**
   * Set if to construct the bean eagerly. By default, bean construction is lazy when the bean is looked up for the first time.
   */
  eager?: boolean;
  /**
   * Set if to provide multiple beans for a single symbol.
   */
  multi?: boolean;
  /**
   * Set in which phase to destroy the bean on platform shutdown, or set to 'none' to not destroy the bean.
   * If not set, the bean is destroyed in the phase {@link PlatformStates.Stopping}.
   */
  destroyPhase?: PlatformStates | 'none';
}

/**
 * Allows executing some asynchronous work before constructing eager beans.
 *
 * Initializers may run in parallel. For this reason, there must be no dependency in any initializer on the order
 * of execution of the initializers.
 *
 * It is allowed to lookup beans inside an initializer.
 *
 * @see {@link Beans.registerInitializer}
 * @category Platform
 */
export interface Initializer {
  /**
   * Invoked at platform startup to execute some work before constructing eager beans.
   *
   * @return a Promise that resolves when this initializer completes its initialization.
   */
  init(): Promise<void>;
}

/**
 * Allows executing some asynchronous work before constructing eager beans.
 *
 * Initializers may run in parallel. For this reason, there must be no dependency in any initializer on the order
 * of execution of the initializers.
 *
 * It is allowed to lookup beans inside an initializer.
 * The initializer function must return a Promise that resolves when completed its initialization.
 *
 * @see {@link Beans.registerInitializer}
 * @category Platform
 */
export declare type InitializerFn = () => Promise<void>;

/**
 * Allows intercepting bean method or property invocations.
 * When the bean is constructed, it is passed to the decorator in order to be proxied.
 *
 * @see {@link Beans.registerDecorator}
 * @category Platform
 */
export interface BeanDecorator<T> {
  /**
   * Method invoked when the bean is instantiated.
   *
   * @param  bean - The actual bean instance; use it to delegate invoations to the actual bean.
   * @return proxied bean
   */
  decorate(bean: T): T;
}

/**
 * Represents a symbol of an abstract class.
 *
 * @category Platform
 */
export interface AbstractType<T> extends Function {
  prototype: T;
}

/**
 * Represents a symbol of a class.
 *
 * @category Platform
 */
export interface Type<T> extends Function {
  new(...args: any[]): T; // tslint:disable-line:callable-types
}
