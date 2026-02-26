import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient} from '@scion/microfrontend-platform';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {WorkbenchSelectCommand} from './workbench-menu.command';
import {UUID} from '@scion/toolkit/uuid';

export class WorkbenchMenuItemContribution {

  public readonly type = 'menu-item';

  public readonly id = UUID.randomUUID();
  public readonly name: `menuitem:${string}`[];
  public readonly onSelect: (context: Map<string, unknown>) => boolean;
  public readonly accelerator?: string[];
  public readonly position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  public readonly cssClass?: string[];

  private readonly _messageClient = Beans.get(MessageClient);

  private _label?: string;
  private _icon?: string;
  private _tooltip?: string;
  private _disabled?: boolean;
  private _checked?: boolean;
  private _actionToolbarName?: `toolbar:${string}`;

  constructor(config: WorkbenchMenuItemContributionConfig) {
    this.name = config.name;
    this.onSelect = config.onSelect;
    this.accelerator = config.accelerator;
    this.position = config.position;
    this.cssClass = config.cssClass;
    this.label = config.label;
    this.icon = config.icon;
    this.tooltip = config.tooltip;
    this.disabled = config.disabled;
    this.checked = config.checked;
    this.actionToolbarName = config.actionToolbarName;
    this.installOnSelectHandler();
  }

  public set label(label: string | undefined) {
    this._label = label;
    void this._messageClient.publish<string>(ɵWorkbenchCommands.menuLabelTopic(this.id), label, {retain: true});
  }

  public get label(): string | undefined {
    return this._label;
  }

  public set icon(icon: string | undefined) {
    this._icon = icon;
    void this._messageClient.publish<string>(ɵWorkbenchCommands.menuIconTopic(this.id), icon, {retain: true});
  }

  public get icon(): string | undefined {
    return this._icon;
  }

  public set tooltip(tooltip: string | undefined) {
    this._tooltip = tooltip;
  }

  public get tooltip(): string | undefined {
    return this._tooltip;
  }

  public set disabled(disabled: boolean | undefined) {
    this._disabled = disabled;
    void this._messageClient.publish<boolean>(ɵWorkbenchCommands.menuDisabledTopic(this.id), disabled, {retain: true});
  }

  public get disabled(): boolean | undefined {
    return this._disabled;
  }

  public set checked(checked: boolean | undefined) {
    this._checked = checked;
    void this._messageClient.publish<boolean>(ɵWorkbenchCommands.menuCheckedTopic(this.id), checked, {retain: true});
  }

  public get checked(): boolean | undefined {
    return this._checked;
  }

  public set actionToolbarName(actionToolbarName: `toolbar:${string}` | undefined) {
    this._actionToolbarName = actionToolbarName;
  }

  public get actionToolbarName(): `toolbar:${string}` | undefined {
    return this._actionToolbarName;
  }

  private installOnSelectHandler(): void {
    this._messageClient.onMessage<WorkbenchSelectCommand>(ɵWorkbenchCommands.menuSelectTopic(this.id), message => {
      const {context} = message.body!;
      console.log('>>> onSelect Message');
      this.onSelect(context);
    });
  }
}

export interface WorkbenchMenuItemContributionConfig {
  name: `menuitem:${string}`[];
  label?: string;
  icon?: string;
  tooltip?: string;
  accelerator?: string[];
  disabled: boolean;
  checked?: boolean;
  actionToolbarName?: `toolbar:${string}`;
  matchesFilter?: (filter: string) => boolean;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  cssClass?: string[];
  onSelect: (context: Map<string, unknown>) => boolean;
}

export class WorkbenchMenuContribution {

  public readonly type = 'menu';

  public readonly id = UUID.randomUUID();
  public readonly name: `menu:${string}`[];
  public readonly position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  public readonly menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  public readonly visualMenuHint?: boolean;
  public readonly cssClass?: string[];

  private readonly _messageClient = Beans.get(MessageClient);
  private _label?: string;
  private _icon?: string;
  private _tooltip?: string;
  private _disabled?: boolean;

  constructor(config: WorkbenchMenuContributionConfig) {
    this.name = config.name;
    this.position = config.position;
    this.menu = config.menu;
    this.visualMenuHint = config.visualMenuHint;
    this.cssClass = config.cssClass;
    this.label = config.label;
    this.icon = config.icon;
    this.tooltip = config.tooltip;
    this.disabled = config.disabled;
  }

  public set label(label: string | undefined) {
    this._label = label;
    void this._messageClient.publish<string>(ɵWorkbenchCommands.menuLabelTopic(this.id), label, {retain: true});
  }

  public get label(): string | undefined {
    return this._label;
  }

  public set icon(icon: string | undefined) {
    this._icon = icon;
    void this._messageClient.publish<string>(ɵWorkbenchCommands.menuIconTopic(this.id), icon, {retain: true});
  }

  public get icon(): string | undefined {
    return this._icon;
  }

  public set tooltip(tooltip: string | undefined) {
    this._tooltip = tooltip;
  }

  public get tooltip(): string | undefined {
    return this._tooltip;
  }

  public set disabled(disabled: boolean | undefined) {
    this._disabled = disabled;
    void this._messageClient.publish<boolean>(ɵWorkbenchCommands.menuDisabledTopic(this.id), disabled, {retain: true});
  }

  public get disabled(): boolean | undefined {
    return this._disabled;
  }
}

export interface WorkbenchMenuContributionConfig {
  name: `menu:${string}`[];
  label?: string;
  icon?: string;
  tooltip?: string;
  disabled: boolean;
  visualMenuHint?: boolean;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string[];
}

export class WorkbenchMenuGroupContribution {

  public readonly type = 'group';

  public readonly id = UUID.randomUUID();
  public readonly name: `group:${string}`[];
  public readonly collapsible?: {collapsed: boolean} | false;
  public readonly position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  public readonly cssClass?: string[];

  private readonly _messageClient = Beans.get(MessageClient);
  private _label?: string;
  private _icon?: string;
  private _tooltip?: string;
  private _disabled?: boolean;

  constructor(config: WorkbenchMenuGroupContributionConfig) {
    this.name = config.name;
    this.position = config.position;
  }

  public set label(label: string | undefined) {
    this._label = label;
    void this._messageClient.publish<string>(ɵWorkbenchCommands.menuLabelTopic(this.id), label, {retain: true});
  }

  public get label(): string | undefined {
    return this._label;
  }

  public set icon(icon: string | undefined) {
    this._icon = icon;
    void this._messageClient.publish<string>(ɵWorkbenchCommands.menuIconTopic(this.id), icon, {retain: true});
  }

  public get icon(): string | undefined {
    return this._icon;
  }

  public set tooltip(tooltip: string | undefined) {
    this._tooltip = tooltip;
  }

  public get tooltip(): string | undefined {
    return this._tooltip;
  }

  public set disabled(disabled: boolean | undefined) {
    this._disabled = disabled;
    void this._messageClient.publish<boolean>(ɵWorkbenchCommands.menuDisabledTopic(this.id), disabled, {retain: true});
  }

  public get disabled(): boolean | undefined {
    return this._disabled;
  }
}

export interface WorkbenchMenuGroupContributionConfig {
  name: `group:${string}`[];
  label?: string;
  collapsible?: {collapsed: boolean} | false;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  disabled: boolean;
}

export type WorkbenchMenuContributions = Array<WorkbenchMenuItemContribution | WorkbenchMenuContribution | WorkbenchMenuGroupContribution>;
