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
import { MicrofrontendPlatform } from './microfrontend-platform';
import { PlatformState, PlatformStates } from './platform-state';

// tslint:disable:typedef
describe('BeanManager', () => {

  beforeEach(async () => await MicrofrontendPlatform.destroy());
  afterEach(async () => await MicrofrontendPlatform.destroy());

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

    expect(constructed).toBeFalsy();
    Beans.get(Bean);
    expect(constructed).toBeTruthy();
  });

  it('should construct eager beans at platform startup', async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    await MicrofrontendPlatform.startPlatform(() => {
      Beans.register(Bean, {eager: true});
    });

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

    await MicrofrontendPlatform.startPlatform(() => {
      Beans.register(Bean1, {eager: true});
      Beans.register(Bean2, {eager: true});
      Beans.register(Bean3, {eager: true});
    });

    expect(beanConstructionOrder).toEqual([Bean1, Bean2, Bean3]);
  });

  it('should wait constructing eager beans until all initializers completed', fakeAsync(async () => {
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

    MicrofrontendPlatform.startPlatform(() => {
      Beans.register(Bean, {eager: true});
    });
    expect(constructed).toBeFalsy();

    tick(10000);
    expect(constructed).toBeTruthy();

    await MicrofrontendPlatform.destroy(); // 'fakeAsync' tests for pending timers before 'afterEach' is invoked.
  }));

  it('should not construct eager beans when some initializers reject', fakeAsync(async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    expectAsync(MicrofrontendPlatform.startPlatform(() => {
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
    })).toBeRejected();

    flush();
    expect(constructed).toBeFalsy();

    await MicrofrontendPlatform.destroy(); // 'fakeAsync' tests for pending timers before 'afterEach' is invoked.
  }));

  it('should allow initializers to lookup beans', fakeAsync(async () => {
    class Bean {
    }

    let actualBeanInInitializer: Bean = null;
    MicrofrontendPlatform.startPlatform(() => {
      Beans.registerInitializer(() => new Promise(resolve => {
        actualBeanInInitializer = Beans.get(Bean);
        setTimeout(resolve, 5000);
      }));

      Beans.register(Bean);
    });

    tick(10000);
    expect(actualBeanInInitializer).toBe(Beans.get(Bean));

    await MicrofrontendPlatform.destroy(); // 'fakeAsync' tests for pending timers before 'afterEach' is invoked.
  }));

  it('should construct lazy beans when looking it up for the first time', async () => {
    let constructed = false;

    class Bean {
      constructor() {
        constructed = true;
      }
    }

    Beans.register(Bean, {eager: false});

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

    await MicrofrontendPlatform.startPlatform(() => {
      Beans.register(Bean);
    });

    // construct the bean
    Beans.get(Bean);
    expect(destroyed).toBeFalsy();

    // destroy the platform
    await MicrofrontendPlatform.destroy();

    expect(destroyed).toBeTruthy();
    expect(Beans.opt(Bean)).toBeUndefined();
  });

  it('should destroy beans which have no \'preDestroy\' lifecycle hook', async () => {
    class Bean {
    }

    await MicrofrontendPlatform.startPlatform(() => {
      Beans.register(Bean);
    });

    // destroy the platform
    await MicrofrontendPlatform.destroy();

    expect(Beans.opt(Bean)).toBeUndefined();
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

    Beans.get(SomeSymbol);
    expect(constructed).toBeTruthy();
    expect(() => Beans.get(Bean)).toThrowError(/NullBeanError/);
  });

  it('should allow registering some arbitrary object as a bean', async () => {
    abstract class SomeSymbol {
    }

    const someObject = {};
    Beans.register(SomeSymbol, {useValue: someObject});

    expect(Beans.get(SomeSymbol)).toBe(someObject);
  });

  it('should allow registering a bean representing a boolean value', async () => {
    abstract class TrueValueBean {
    }
    abstract class FalseValueBean {
    }

    Beans.register(TrueValueBean, {useValue: true});
    Beans.register(FalseValueBean, {useValue: false});

    expect(Beans.get(TrueValueBean)).toBe(true);
    expect(Beans.get(FalseValueBean)).toBe(false);
  });

  it('should allow registering a bean using a factory construction function', async () => {
    abstract class SomeSymbol {
    }

    const someObject = {};
    Beans.register(SomeSymbol, {useFactory: () => someObject});

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

  it('should destroy a bean in the phase as configured, if any', async () => {
    class Bean1 { // default destroy strategy (when stopping the platform)
    }

    class Bean2 { // destroy bean when stopping the platform
    }

    class Bean3 { // destroy bean when stopped the platform
    }

    class Bean4 { // never destroy bean
    }

    Beans.register(Bean1, {eager: true});
    Beans.register(Bean2, {destroyPhase: PlatformStates.Stopping, eager: true});
    Beans.register(Bean3, {destroyPhase: PlatformStates.Stopped, eager: true});
    Beans.register(Bean4, {destroyPhase: 'none', eager: true});

    // enter state 'PlatformStates.Starting' and 'PlatformStates.Started'
    await Beans.get(PlatformState).enterState(PlatformStates.Starting);
    await Beans.get(PlatformState).enterState(PlatformStates.Started);

    await expect(Beans.opt(Bean1)).toBeDefined();
    await expect(Beans.opt(Bean2)).toBeDefined();
    await expect(Beans.opt(Bean3)).toBeDefined();
    await expect(Beans.opt(Bean4)).toBeDefined();

    // enter state 'PlatformStates.Stopping'
    await Beans.get(PlatformState).enterState(PlatformStates.Stopping);
    await expect(Beans.opt(Bean1)).toBeUndefined();
    await expect(Beans.opt(Bean2)).toBeUndefined();
    await expect(Beans.opt(Bean3)).toBeDefined();
    await expect(Beans.opt(Bean4)).toBeDefined();

    // enter state 'PlatformStates.Stopped'
    await Beans.get(PlatformState).enterState(PlatformStates.Stopped);
    await expect(Beans.opt(Bean1)).toBeUndefined();
    await expect(Beans.opt(Bean2)).toBeUndefined();
    await expect(Beans.opt(Bean3)).toBeUndefined();
    await expect(Beans.opt(Bean4)).toBeDefined();
  });

  it('should allow registering an alias for an existing bean [useExisting]', async () => {
    abstract class Bean {
    }

    abstract class Alias {
    }

    Beans.register(Bean);
    Beans.register(Alias, {useExisting: Bean});

    const actualBean = Beans.get(Bean);
    const alias = Beans.get(Alias);
    expect(actualBean).toBe(alias);
    expect(alias instanceof Bean).toBeTruthy();
    expect(alias instanceof Alias).toBeFalsy();
  });

  it('should not destroy the referenced bean when its alias is destroyed [useExisting]', async () => {
    let beanDestroyed = false;

    abstract class Bean implements PreDestroy {
      public preDestroy(): void {
        beanDestroyed = true;
      }
    }

    abstract class Alias {
    }

    // Register the bean and its alias
    Beans.register(Bean);
    Beans.register(Alias, {useExisting: Bean});

    const actualBean = Beans.get(Bean);
    const alias = Beans.get(Alias);
    expect(actualBean).toBe(alias as any);

    // Replace the alias bean. When replacing a regular bean, the bean instance would be destroyed.
    Beans.register(Alias, {useValue: 'some-other-bean'});

    expect(Beans.get(Bean)).toBe(actualBean);
    expect(beanDestroyed).toBeFalsy();
    expect(Beans.get(Alias)).toEqual('some-other-bean' as any);
  });
});
