import {assertInInjectionContext} from '@angular/core';

export function ɵassertInInjectionContext(debugFn: Function, notFound: string): void {
  try {
    assertInInjectionContext(debugFn);
  }
  catch (error) {
    throw Error(notFound ?? `${debugFn.name}() can only be used within an injection context, or an explicit injector passed.`);
  }
}
