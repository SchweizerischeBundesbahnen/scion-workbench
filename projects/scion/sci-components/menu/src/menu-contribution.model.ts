import {OneOf} from './common/utility-types';
import {SciMenuFactory, SciMenuGroupFactory} from './menu/menu.factory';
import {SciToolbarFactory, SciToolbarGroupFactory} from './toolbar/toolbar.factory';

export interface SciMenuContribution {
  scope: 'menu',
  factory: (menu: SciMenuFactory | SciMenuGroupFactory, context: Map<string, unknown>) => void;
  requiredContext: Map<string, unknown>;
  position?: SciMenuContributionPosition;
}

export interface SciToolbarContribution {
  scope: 'toolbar',
  factory: (toolbar: SciToolbarFactory | SciToolbarGroupFactory, context: Map<string, unknown>) => void;
  requiredContext: Map<string, unknown>;
  position?: SciMenuContributionPosition;
}

export type SciMenuContributionLocation = {location: `menu:${string}`} & SciMenuContributionPosition;

export type SciToolbarContributionLocation = {location: `toolbar:${string}`} & SciMenuContributionPosition;

export type SciMenuGroupContributionLocation = {location: `group(menu):${string}`} & SciMenuContributionPosition;

export type SciToolbarGroupContributionLocation = {location: `group(toolbar):${string}`} & SciMenuContributionPosition;

export type SciMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  position?: 'start' | 'end';
}>;

/**
 * Indicates no contributions found.
 */
export const NULL_MENU_CONTRIBUTIONS = [];
