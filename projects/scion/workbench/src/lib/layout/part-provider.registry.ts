import { Inject, Injectable } from '@angular/core';
import { PART_PROVIDER, PartProvider } from './part-provider.model';
import { Portal } from '@angular/cdk/portal';

@Injectable({providedIn: 'root'})
export class PartProviderRegistry {

  private providers: Map<string, PartProvider>;

  constructor(@Inject(PART_PROVIDER) providers: PartProvider[]) {
    this.providers = providers.reduce((acc, provider) => acc.set(provider.id, provider), new Map<string, PartProvider>());
  }

  public isMulti(id: string): boolean {
    return this.providers.get(id).multi;
  }

  public portal(id: string): Portal<any> {
    return this.providers.get(id).portal;
  }
}
