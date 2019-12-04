/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BeanDecorator, Beans, Initializer, PreDestroy, Type } from './bean-manager';
import { fakeAsync, flush, tick } from '@angular/core/testing';

// tslint:disable:typedef
describe('BeanManager', () => {

  beforeEach(() => {
    Beans.destroy();
  });

  it('should allow looking up a bean', async () => {
    class Bean {
    }

    Beans.register(Bean);
    expect(Beans.get(Bean)).toBeTruthy();
    expect(Beans.get(Bean) instanceof Bean).toBeTruthy();
    expect(Beans.get(Bean)).toBe(Beans.get(Bean));
  });

  it('should throw when looking up a bean not present in the bean manager', async () => {
    class Bean {
    }

    expect(() => Beans.get(Bean)).toThrowError(/NullBeanError/);
  });

  it('should return \'undefined\' when looking up an optional bean not present in the bean manager', async () => {
    abstract class SomeSymbol {
    }

    expect(Beans.opt(SomeSymbol)).toBeUndefined();
  });

  it('should return \'orElseGet\' value when looking up a bean not present in the bean manager [orElseGet]', async () => {
    abstract class SomeSymbol {
    }

    expect(Beans.get(SomeSymbol, {orElseGet: 'not-found'})).toEqual('not-found');
  });

  it('should invoke \'orElseSupply\' function when looking up a bean not present in the bean manager [orElseSupply]', async () => {
    abstract class SomeSymbol {
    }

    expect(Beans.get(SomeSymbol, {orElseSupply: (): string => 'not-found'})).toEqual('not-found');
  });

  it('should allow looking up multiple beans', async () => {
    class Bean {
    }

    const bean1 = new Bean();
    const bean2 = new Bean();
    const bean3 = new Bean();

    Beans.register(Bean, {useValue: bean1, multi: true});
    Beans.register(Bean, {useValue: bean2, multi: true});
    Beans.register(Bean, {useValue: bean3, multi: true});

    expect(() => Beans.get(Bean)).toThrowError(/MultiBeanError/);
    expect(Beans.all(Bean)).toEqual([bean1, bean2, bean3]);
  });

  it('should throw when registering a bean as \'multi-bean\' on a symbol that has already registered a \'non-multi\' bean', async () => {
    class Bean {
    }

    Beans.register(Bean, {useValue: new Bean()});
    expect(() => Beans.register(Bean, {useValue: new Bean(), multi: true})).toThrowError(/BeanRegisterError/);
  });

  it('should throw when registering a bean on a symbol that has already registered a \'multi-bean\'', async () => {
    class Bean {
    }

    Beans.register(Bean, {useValue: new Bean(), multi: true});
    expect(() => Beans.register(Bean, {useValue: new Bean(), multi: false})).toThrowError(/BeanRegisterError/);
  });

  it('should construct beans as a singleton', async () => {
    class Bean {
    }

    Beans.register(Bean);
    await Beans.init();

    expect(Beans.get(Bean)).toBe(Beans.get(Bean));
    expect(Beans.get(Bean) instanceof Bean).toBeTruthy();
  });

  it('should construct beans lazily unless specified differently', async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    Beans.register(Bean);
    await Beans.init();

    expect(constructed).toBeFalsy();
    Beans.get(Bean);
    expect(constructed).toBeTruthy();
  });

  it('should construct eager beans at bean manager initialization', async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    Beans.register(Bean, {eager: true});
    await Beans.init();

    expect(constructed).toBeTruthy();
  });

  it('should construct eager beans in the order as registered', async () => {
    const beanConstructionOrder: Type<any>[] = [];

    class Bean1 {
      constructor() {
        beanConstructionOrder.push(Bean1);
      }
    }

    class Bean2 {
      constructor() {
        beanConstructionOrder.push(Bean2);
      }
    }

    class Bean3 {
      constructor() {
        beanConstructionOrder.push(Bean3);
      }
    }

    Beans.register(Bean1, {eager: true});
    Beans.register(Bean2, {eager: true});
    Beans.register(Bean3, {eager: true});
    await Beans.init();

    expect(beanConstructionOrder).toEqual([Bean1, Bean2, Bean3]);
  });

  it('should wait constructing eager beans until all initializers resolve', fakeAsync(() => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    Beans.registerInitializer(() => new Promise(resolve => setTimeout(resolve, 5000)));
    Beans.registerInitializer(() => new Promise(resolve => setTimeout(resolve, 2000)));
    Beans.registerInitializer({useFunction: () => new Promise(resolve => setTimeout(resolve, 8000))});
    Beans.registerInitializer({
      useClass: class implements Initializer {
        public init(): Promise<void> {
          return Promise.resolve();
        }
      },
    });

    Beans.register(Bean, {eager: true});
    Beans.init().then();
    expect(constructed).toBeFalsy();

    tick(10000);
    expect(constructed).toBeTruthy();
  }));

  it('should not construct eager beans when some initializers reject', fakeAsync(async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    Beans.registerInitializer(() => new Promise(resolve => setTimeout(resolve, 5000)));
    Beans.registerInitializer(() => new Promise((resolve, reject) => setTimeout(reject, 2000))); // reject initialization
    Beans.registerInitializer({useFunction: () => new Promise(resolve => setTimeout(resolve, 8000))});
    Beans.registerInitializer({
      useClass: class implements Initializer {
        public init(): Promise<void> {
          return Promise.resolve();
        }
      },
    });
    Beans.register(Bean, {eager: true});

    // init and expect
    expectAsync(Beans.init()).toBeRejected();
    flush();
    expect(constructed).toBeFalsy();
  }));

  it('should allow initializers to lookup beans', fakeAsync(() => {
    class Bean {
    }

    let actualBeanInInitializer: Bean = null;
    Beans.registerInitializer(() => new Promise(resolve => {
      actualBeanInInitializer = Beans.get(Bean);
      setTimeout(resolve, 5000);
    }));

    Beans.register(Bean);
    Beans.init().then();

    tick(10000);
    expect(actualBeanInInitializer).toBe(Beans.get(Bean));
  }));

  it('should construct lazy beans when looking it up for the first time', async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    Beans.register(Bean, {eager: false});
    await Beans.init();

    expect(constructed).toBeFalsy();
    Beans.get(Bean);
    expect(Bean).toBeTruthy();
  });

  it('should invoke the bean\'s \'preDestroy\' lifecycle hook on destroy', async () => {
    let destroyed = false;

    class Bean implements PreDestroy {
      public preDestroy(): void {
        destroyed = true;
      }
    }

    Beans.register(Bean);
    await Beans.init();

    // construct the bean
    Beans.get(Bean);
    expect(destroyed).toBeFalsy();

    // destroy the bean
    Beans.destroy();
    expect(destroyed).toBeTruthy();
  });

  it('should allow replacing a bean and destroy the replaced bean', async () => {
    let bean1Destroyed = false;

    abstract class BeanSymbol {
    }

    class Bean1 implements PreDestroy {
      public preDestroy(): void {
        bean1Destroyed = true;
      }
    }

    class Bean2 {
    }

    Beans.register(BeanSymbol, {useClass: Bean1});
    await Beans.init();
    expect(Beans.get(BeanSymbol) instanceof Bean1).toBeTruthy();

    // replace the bean
    Beans.register(BeanSymbol, {useClass: Bean2});
    expect(Beans.get(BeanSymbol) instanceof Bean2).toBeTruthy();
    expect(bean1Destroyed).toBeTruthy();
  });

  it('should allow looking up other beans in a bean constructor', async () => {
    let bean1Constructed = false;
    let bean2Constructed = false;
    let bean3Constructed = false;

    class Bean1 {
      constructor() {
        bean1Constructed = true;
        Beans.get(Bean2); // lookup other bean in the constructor
      }
    }

    class Bean2 {
      constructor() {
        bean2Constructed = true;
      }
    }

    class Bean3 {
      constructor() {
        bean3Constructed = true;
      }
    }

    Beans.register(Bean1);
    Beans.register(Bean2);
    Beans.register(Bean3);
    await Beans.init();

    expect(bean1Constructed).toBeFalsy();
    expect(bean2Constructed).toBeFalsy();
    expect(bean3Constructed).toBeFalsy();

    Beans.get(Bean1);
    expect(bean1Constructed).toBeTruthy();
    expect(bean2Constructed).toBeTruthy();
    expect(bean3Constructed).toBeFalsy();
  });

  it('should throw when looking up a bean which causes a circular construction cycle', async () => {
    class Bean1 {
      constructor() {
        Beans.get(Bean2);
      }
    }

    class Bean2 {
      constructor() {
        Beans.get(Bean3);
      }
    }

    class Bean3 {
      constructor() {
        Beans.get(Bean1);
      }
    }

    Beans.register(Bean1);
    Beans.register(Bean2);
    Beans.register(Bean3);
    await Beans.init();

    expect(() => Beans.get(Bean1)).toThrowError(/BeanConstructError/);
  });

  it('should allow registering a bean under another symbol', async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    abstract class SomeSymbol {
    }

    Beans.register(SomeSymbol, {useClass: Bean});
    await Beans.init();

    Beans.get(SomeSymbol);
    expect(constructed).toBeTruthy();
    expect(() => Beans.get(Bean)).toThrowError(/NullBeanError/);
  });

  it('should allow registering some arbitrary object as a bean', async () => {
    abstract class SomeSymbol {
    }

    const someObject = {};
    Beans.register(SomeSymbol, {useValue: someObject});
    await Beans.init();

    expect(Beans.get(SomeSymbol)).toBe(someObject);
  });

  it('should allow registering a bean using a factory construction function', async () => {
    abstract class SomeSymbol {
    }

    const someObject = {};
    Beans.register(SomeSymbol, {useFactory: () => someObject});
    await Beans.init();

    expect(Beans.get(SomeSymbol)).toBe(someObject);
  });

  it('should register a bean only if absent', async () => {
    abstract class SomeSymbol {
    }

    const bean1 = {name: 'bean1'};
    Beans.registerIfAbsent(SomeSymbol, {useValue: bean1});

    const bean2 = {name: 'bean2'};
    Beans.registerIfAbsent(SomeSymbol, {useValue: bean2});

    expect(Beans.get(SomeSymbol)).toBe(bean1);
  });

  it('should allow decorating a bean', async () => {
    abstract class Bean {
      abstract getName(): string;
    }

    class BeanImpl implements Bean {
      public getName(): string {
        return 'name';
      }
    }

    class Decorator implements BeanDecorator<Bean> {
      public decorate(bean: Bean): Bean {
        return new class implements Bean {
          public getName(): string {
            return bean.getName().toUpperCase();
          }
        };
      }
    }

    Beans.register(Bean, {useClass: BeanImpl});
    Beans.registerDecorator(Bean, {useClass: Decorator});
    expect(Beans.get(Bean).getName()).toEqual('NAME');
  });

  it('should allow decorating multiple beans', async () => {
    abstract class Bean {
      abstract getName(): string;
    }

    class Bean1 implements Bean {
      public getName(): string {
        return 'name of bean 1';
      }
    }

    class Bean2 implements Bean {
      public getName(): string {
        return 'name of bean 2';
      }
    }

    class Decorator implements BeanDecorator<Bean> {
      public decorate(bean: Bean): Bean {
        return new class implements Bean {
          public getName(): string {
            return bean.getName().toUpperCase();
          }
        };
      }
    }

    Beans.register(Bean, {useClass: Bean1, multi: true});
    Beans.register(Bean, {useClass: Bean2, multi: true});
    Beans.registerDecorator(Bean, {useClass: Decorator});
    expect(Beans.all(Bean).map(bean => bean.getName())).toEqual(['NAME OF BEAN 1', 'NAME OF BEAN 2']);
  });
});
