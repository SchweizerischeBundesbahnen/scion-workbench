import {Disposable, SciMenuAdapter, SciMenuContributions} from '@scion/sci-components/menu';
import {Provider, Signal} from '@angular/core';

export class MicrofrontendMenuAdapter implements SciMenuAdapter {

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`, contributions: SciMenuContributions, context: Map<string, unknown>, next: SciMenuAdapter): Disposable {
    return next.contributeMenu(location, contributions, context, next);
  }

  public menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>, next: SciMenuAdapter): Signal<SciMenuContributions> {
    return next.menuContributions(location, context, next);
  }
}

export function provideWorkbenchMenuAdapter(): Provider[] {
  return [
    {
      provide: SciMenuAdapter,
      useClass: MicrofrontendMenuAdapter,
    },
  ];
}
