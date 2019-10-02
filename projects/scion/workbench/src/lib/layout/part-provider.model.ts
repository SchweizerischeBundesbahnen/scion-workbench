import { Portal } from '@angular/cdk/portal';
import { Injectable, InjectionToken } from '@angular/core';

/**
 * DI injection token to register a class to handle intents of some type and qualifier.
 */
export const PART_PROVIDER = new InjectionToken<PartProvider[]>('PART_PROVIDER');

export interface PartProvider {
  id: string;
  multi: boolean;
  portal: Portal<any>;
}

@Injectable()
export class StandalonePartProvider implements PartProvider {
  id: 'outlet';
  multi: false;
  portal: Portal<any>;
}

@Injectable()
export class MultiTabPartProvider implements PartProvider {
  id: 'tab';
  multi: true;
  portal: Portal<any>;
}
