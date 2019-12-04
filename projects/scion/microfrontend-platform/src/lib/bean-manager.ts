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
const beanRegistry = new Map<Type<any> | AbstractType<any>, BeanInfo[]>();
const beanDecoratorRegistry = new Map<Type<any> | AbstractType<any>, BeanDecorator<any>[]>();
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
   * If not providing instructions, the given symbol is used as the constructor function to construct the bean.
   *
   * By default, bean construction is lazy, meaning that the bean is constructed when looked up for the first time.
   * If another bean is registered under the same symbol, by default, it is disposed and replaced with the given bean.
   * To register multiple beans on the same symbol, set the flag 'multi' to `true`.
   *
   * @param symbol
   *        Symbol under which to register the bean.
   * @param instructions
   *        Control bean construction; see {@link BeanInstanceConstructInstructions} for more detail.
   */
  public register<T>(symbol: Type<T | any> | AbstractType<T | any>, instructions?: BeanInstanceConstructInstructions<T>): void {
    if (!symbol) {
      throw Error('[BeanRegisterError] Missing bean lookup symbol.');
    }

    // Check that only 'multi' or 'non-multi' beans are registered on the same symbol.
    const multi = Defined.orElse(instructions && instructions.multi, false);
    if (multi && beanRegistry.has(symbol) && beanRegistry.get(symbol).some(metaData => !metaData.multi)) {
      throw Error('[BeanRegisterError] Trying to register a bean as \'multi-bean\' on a symbol that has already registered a \'non-multi-bean\'. This is probably not what was intended.');
    }
    if (!multi && beanRegistry.has(symbol) && beanRegistry.get(symbol).some(metaData => metaData.multi)) {
      throw Error('[BeanRegisterError] Trying to register a bean on a symbol that has already registered a \'multi-bean\'. This is probably not what was intended.');
    }

    // Destroy an already registered bean on the same symbol, if any, unless multi is set to `true`.
    if (!multi && beanRegistry.has(symbol)) {
      destroyBeans(beanRegistry.get(symbol));
    }

    const beanInfo: BeanInfo<T> = {
      symbol: symbol,
      beanConstructFn: deriveConstructFunction(symbol, instructions),
      eager: Defined.orElse(instructions && instructions.eager, false),
      multi: multi,
      registrationInstant: instantProvider.get(),
    };

    if (multi) {
      const beans = beanRegistry.get(symbol) || [];
      beanRegistry.set(symbol, beans.concat(beanInfo));
    }
    else {
      beanRegistry.set(symbol, [beanInfo]);
    }

    // Construct the bean if having eager construction strategy unless the platform is not started yet.
    if (beanInfo.eager && Beans.get(MicrofrontendPlatformState).state === PlatformStates.Started) {
      getBeanInstanceIfPresentElseConstruct(beanInfo);
    }
  }

  /**
   * Registers a bean under the given symbol, but only if no bean is registered under that symbol yet.
   *
   * For detailed information about how to register a bean, see {@link register}.
   *
   * @param symbol
   *        Symbol under which to register the bean.
   * @param instructions
   *        Control bean construction; see {@link BeanInstanceConstructInstructions} for more detail.
   */
  public registerIfAbsent<T>(symbol: Type<T | any> | AbstractType<T | any>, instructions?: BeanInstanceConstructInstructions<T>): void {
    if (!symbol) {
      throw Error('[BeanRegisterError] Missing bean lookup symbol.');
    }

    if (!beanRegistry.has(symbol)) {
      this.register(symbol, instructions);
    }
  }

  /**
   * Registers a decorator to proxy a bean allowing to intercept invocations.
   *
   * The decorator is invoked when the bean is constructed. Multiple decorators can be registered
   * to decorate a bean. They are invoked in the order as registered.
   *
   * @param symbol
   *        Identifies the bean(s) which to decorate. If multiple beans are registered under that symbol, they all are decorated.
   * @param decorator
   *        Specifies the decorator.
   */
  public registerDecorator<T extends BeanDecorator<any>>(symbol: Type<any> | AbstractType<any>, decorator: { useValue: T } | { useClass?: Type<T> } | { useFactory?: () => T }): void {
    if (!symbol) {
      throw Error('[BeanDecoratorRegisterError] A decorator requires a symbol.');
    }

    const decorators = beanDecoratorRegistry.get(symbol) || [];
    beanDecoratorRegistry.set(symbol, decorators.concat(deriveConstructFunction(undefined, decorator)()));
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
   * Returns the bean registered under the given symbol.
   *
   * By default, if no or multiple beans are registered under the given symbol, an error is thrown.
   *
   * @param symbol
   *        Symbol to lookup the bean.
   * @param nullBeanOptions
   *        Controls what to do if no bean is registered under the given symbol. If not set, an error is thrown if no bean is found.
   */
  public get<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>, nullBeanOptions?: { orElseGet?: T, orElseSupply?: () => T }): T {
    const beans = this.all(symbol);
    switch (beans.length) {
      case 0: {
        if (nullBeanOptions && nullBeanOptions.orElseGet) {
          return nullBeanOptions.orElseGet;
        }
        if (nullBeanOptions && nullBeanOptions.orElseSupply) {
          return nullBeanOptions.orElseSupply();
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
   * Returns the bean registered under the given symbol.
   *
   * Does not throw if no bean is found, but returns `undefined` instead; throws if multiple beans are found.
   *
   * @param symbol
   *        Symbol to lookup the bean.
   */
  public opt<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>): T | undefined {
    return this.get(symbol, {orElseSupply: (): undefined => undefined});
  }

  /**
   * Returns all beans registered under the given symbol. Returns an empty array if no bean is found.
   *
   * @param symbol
   *        Symbol to lookup the beans.
   */
  public all<T>(symbol: Type<T> | AbstractType<T> | Type<any> | AbstractType<any>): T[] {
    if (symbol === MicrofrontendPlatformState) { // static bean
      return [platformState as any];
    }

    const beanInfos = beanRegistry.get(symbol);
    if (!beanInfos || !beanInfos.length) {
      return [];
    }
    if (beanInfos.some(beanInfo => beanInfo.constructing)) {
      throw Error(`[BeanConstructError] Circular bean construction cycle detected [bean={${symbol.name}}].`);
    }

    return beanInfos.map(beanInfo => getBeanInstanceIfPresentElseConstruct(beanInfo));
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
    beanRegistry.forEach(destroyBeans);
    beanRegistry.clear();
    beanDecoratorRegistry.clear();
    initializers.length = 0;
  }
};

function getBeanInstanceIfPresentElseConstruct<T>(beanInfo: BeanInfo): T {
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

function constructEagerBeans(): void {
  Array.from(beanRegistry.values())
    .reduce((combined, beanInfos) => combined.concat(beanInfos), [])
    .filter(beanInfo => beanInfo.eager)
    .sort((a, b) => a.registrationInstant - b.registrationInstant)
    .forEach(beanInfo => getBeanInstanceIfPresentElseConstruct(beanInfo));
}

function destroyBeans(beanInfos: BeanInfo[]): void {
  beanInfos
    .filter(beanInfo => beanInfo.instance && typeof (beanInfo.instance as PreDestroy).preDestroy === 'function')
    .forEach(beanInfo => {
      (beanInfo.instance as PreDestroy).preDestroy();
      beanInfo.instance = null;
    });
}

function deriveConstructFunction<T>(symbol: Type<T | any> | AbstractType<T | any>, instructions?: InstanceConstructInstructions<T>): () => T {
  if (instructions && instructions.useValue) {
    return (): T => instructions.useValue;
  }
  else if (instructions && instructions.useClass) {
    return (): T => new instructions.useClass();
  }
  else if (instructions && instructions.useFactory) {
    return (): T => instructions.useFactory();
  }
  else {
    return (): T => new (symbol as Type<T>)();
  }
}

/**
 * Lifecycle hook invoked when the bean is about to be destroyed.
 */
export interface PreDestroy {
  preDestroy(): void;
}

interface BeanInfo<T = any> {
  symbol: Type<T | any> | AbstractType<T | any>;
  instance?: T;
  constructing?: boolean;
  beanConstructFn: () => T;
  eager: boolean;
  multi: boolean;
  registrationInstant: number;
}

/**
 * Describes how an instance is created.
 */
export interface InstanceConstructInstructions<T = any> {
  /**
   * Set if to use a static value as instance.
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
}

/**
 * Describes how a bean instance is created.
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
 * Allows intercepting invocations for a certain bean.
 * When the bean is constructed, it is passed to the decorator in order to be proxied.
 */
export interface BeanDecorator<T> {
  /**
   * Method invoked when the bean is instantiated.
   *
   * @param  bean
   *         The actual bean instance; use it to delegate invoations to the actual bean.
   * @return proxied bean
   */
  decorate(bean: T): T;
}

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
