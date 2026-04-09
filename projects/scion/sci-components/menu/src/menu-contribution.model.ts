import {SciMenuFactory} from './menu/menu.factory';
import {SciToolbarFactory} from './toolbar/toolbar.factory';
import {Injector} from '@angular/core';
import {OneOf} from '@scion/sci-components/common';

export interface SciMenuContribution {
  scope: 'menu' | 'toolbar',
  factoryFn: SciMenuFactoryFnLike;
  requiredContext: Map<string, unknown>;
  position?: SciMenuContributionPosition;
  contributionInstant: number;
  /**
   * Arbitrary metadata to be associated with the contribution.
   */
  metadata: {[key: string]: unknown};
}

export type SciMenuContributionLocation = {location: `menu:${string}`} & SciMenuContributionPosition;
export type SciToolbarContributionLocation = {location: `toolbar:${string}`} & SciMenuContributionPosition;
export type SciMenuContributionLocationLike = SciMenuContributionLocation | SciToolbarContributionLocation;

export interface SciMenuContributionOptions {
  /**
   * This function must be called within an injection context, or an explicit {@link Injector} passed. Destroying the injection context will unregister contributed menus.
   */
  injector?: Injector;

  /**
   * Context required by the contribution.
   */
  requiredContext?: Map<string, unknown>;

  /**
   * Arbitrary metadata to be associated with the contribution.
   */
  metadata?: {[key: string]: unknown};

  contributionInstant?: number;
}

export type SciMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}:${string}` | `toolbar:${string}:${string}`;
  after?: `menuitem:${string}` | `menu:${string}:${string}` | `toolbar:${string}:${string}`;
  position?: 'start' | 'end';
}>;

export type SciMenuFactoryFn = (menu: SciMenuFactory, context: Map<string, unknown>) => void;
export type SciToolbarFactoryFn = (toolbar: SciToolbarFactory, context: Map<string, unknown>) => void;
export type SciMenuFactoryFnLike = SciMenuFactoryFn | SciToolbarFactoryFn;

/**
 * Indicates no contributions found.
 */
export const NULL_MENU_CONTRIBUTIONS = [];
