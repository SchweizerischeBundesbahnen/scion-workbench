import {SciMenuFactory, SciMenuGroupFactory} from './menu/menu.factory';
import {SciToolbarFactory, SciToolbarGroupFactory} from './toolbar/toolbar.factory';
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

export type SciMenuGroupContributionLocation = {location: `group(menu):${string}`} & SciMenuContributionPosition;

export type SciToolbarGroupContributionLocation = {location: `group(toolbar):${string}`} & SciMenuContributionPosition;

export type SciMenuContributionLocationLike = SciMenuContributionLocation | SciToolbarContributionLocation | SciMenuGroupContributionLocation | SciToolbarGroupContributionLocation;

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
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  position?: 'start' | 'end';
}>;

export type SciMenuFactoryFn = (menu: SciMenuFactory, context: Map<string, unknown>) => void;
export type SciToolbarFactoryFn = (toolbar: SciToolbarFactory, context: Map<string, unknown>) => void;
export type SciMenuGroupFactoryFn = (group: SciMenuGroupFactory, context: Map<string, unknown>) => void;
export type SciToolbarGroupFactoryFn = (group: SciToolbarGroupFactory, context: Map<string, unknown>) => void;
export type SciMenuFactoryFnLike = SciMenuFactoryFn | SciToolbarFactoryFn | SciMenuGroupFactoryFn | SciToolbarGroupFactoryFn;

/**
 * Indicates no contributions found.
 */
export const NULL_MENU_CONTRIBUTIONS = [];
