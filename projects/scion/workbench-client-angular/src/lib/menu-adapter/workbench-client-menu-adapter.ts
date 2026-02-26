import {effect, EnvironmentInjector, inject, Injector, Provider, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {Disposable, SciMenuAdapter, SciMenuContextProvider, SciMenuContribution, SciMenuContributions, SciMenuGroupContribution, SciMenuItemContribution} from '@scion/sci-components/menu';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchMenuContribution, WorkbenchMenuGroupContribution, WorkbenchMenuItemContribution, WorkbenchMenuService, WorkbenchSelectCommand, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Arrays} from '@scion/toolkit/util';
import {mapArray} from '@scion/toolkit/operators';
import {toSignal} from '@angular/core/rxjs-interop';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {tap} from 'rxjs';
import {MicrofrontendMenuContextProvider} from './microfrontend-menu-context-provider';

export class WorkbenchClientMenuAdapter implements SciMenuAdapter {

  private readonly _workbenchMenuService = Beans.get(WorkbenchMenuService);
  private readonly _messageClient = inject(MessageClient);
  private readonly _injector = inject(EnvironmentInjector);
  private readonly _contributions = new Map<`menu:${string}` | `toolbar:${string}` | `group:${string}`, Signal<SciMenuContributions>>();
  private readonly _properties = new Map<string, Signal<unknown>>();

  /** @inheritDoc */
  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`, contributions: SciMenuContributions, context: Map<string, unknown>): Disposable {
    const injector = Injector.create({parent: this._injector, providers: []});

    return runInInjectionContext(injector, () => {
      const contributionRef = this._workbenchMenuService.contributeMenu(location, contributions.map(contribution => {
        switch (contribution.type) {
          case 'menu': {
            const menu = new WorkbenchMenuContribution({
              name: contribution.name,
              label: (() => {
                if (!contribution.label) {
                  return undefined;
                }
                const label = contribution.label();
                if (typeof label !== 'string') {
                  throw Error('ComponentType not supported');
                }
                return label;
              })(),
              icon: contribution.icon?.(),
              tooltip: contribution.tooltip?.(),
              disabled: contribution.disabled ? contribution.disabled() : false,
              visualMenuHint: contribution.visualMenuHint,
              position: contribution.position,
              menu: contribution.menu,
              cssClass: contribution.cssClass,
            });
            effect(() => {
              const label = contribution.label?.();
              if (!label) {
                return;
              }
              if (typeof label !== 'string') {
                return;
              }
              menu.label = label;
            });
            effect(() => menu.icon = contribution.icon?.());
            effect(() => menu.disabled = contribution.disabled());
            return menu;
          }
          case 'menu-item': {
            const menuItem = new WorkbenchMenuItemContribution({
              name: contribution.name,
              label: (() => {
                if (!contribution.label) {
                  return undefined;
                }
                const label = contribution.label();
                if (typeof label !== 'string') {
                  return undefined;
                }
                return label;
              })(),
              icon: contribution.icon?.(),
              tooltip: contribution.tooltip?.(),
              accelerator: contribution.accelerator,
              disabled: contribution.disabled ? contribution.disabled() : false,
              checked: contribution.checked?.(),
              actionToolbarName: contribution.actionToolbarName?.(),
              matchesFilter: contribution.matchesFilter,
              position: contribution.position,
              cssClass: contribution.cssClass,
              onSelect: contribution.onSelect,
            });
            effect(() => {
              const label = contribution.label?.();
              if (!label) {
                return;
              }
              if (typeof label !== 'string') {
                return;
              }
              menuItem.label = label;
            });
            effect(() => menuItem.icon = contribution.icon?.());
            effect(() => menuItem.checked = contribution.checked?.());
            effect(() => menuItem.disabled = contribution.disabled());
            return menuItem;
          }
          case 'group': {
            const group = new WorkbenchMenuGroupContribution({
              name: contribution.name,
              label: contribution.label?.(),
              collapsible: contribution.collapsible,
              position: contribution.position,
              disabled: contribution.disabled ? contribution.disabled() : false,
            });
            effect(() => group.label = contribution.label?.());
            effect(() => group.disabled = contribution.disabled());
            return group;
          }
        }
      }), context);

      return {
        dispose: () => {
          contributionRef.dispose();
          injector.destroy();
        },
      }
    });
  }

  /** @inheritDoc */
  public menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Signal<SciMenuContributions> {
    if (!this._contributions.has(location)) {
      const contributions$ = this._workbenchMenuService.menuContributions(location, context).pipe(tap(contributions => console.log(`>>> contributions location=${location}`, contributions, context)), mapArray(contribution => {
        switch (contribution.type) {
          case 'menu': {
            return {
              type: 'menu',
              name: Arrays.coerce(contribution.name),
              label: this.observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {initialValue: contribution.label ?? ''}),
              icon: this.observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {initialValue: contribution.icon ?? ''}),
              tooltip: this.observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {initialValue: contribution.tooltip ?? ''}),
              disabled: this.observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {initialValue: contribution.disabled ?? false}),
              visualMenuHint: contribution.visualMenuHint,
              position: contribution.position,
              menu: contribution.menu,
              cssClass: contribution.cssClass,
            } satisfies SciMenuContribution;
          }
          case 'menu-item': {
            return {
              type: 'menu-item',
              name: Arrays.coerce(contribution.name),
              label: this.observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {initialValue: contribution.label ?? ''}),
              icon: this.observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {initialValue: contribution.icon ?? ''}),
              tooltip: this.observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {initialValue: contribution.tooltip ?? ''}),
              accelerator: contribution.accelerator,
              disabled: this.observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {initialValue: contribution.disabled ?? false}),
              checked: this.observeProperty(ɵWorkbenchCommands.menuCheckedTopic(contribution.id), {initialValue: contribution.checked ?? false}),
              actionToolbarName: contribution.actionToolbarName ? signal(contribution.actionToolbarName) : undefined,
              position: contribution.position,
              cssClass: contribution.cssClass,
              onSelect: () => {
                void this._messageClient.publish<WorkbenchSelectCommand>(ɵWorkbenchCommands.menuSelectTopic(contribution.id), {context});
                return true;
              },
            } satisfies SciMenuItemContribution;
          }
          case 'group': {
            return {
              type: 'group',
              name: Arrays.coerce(contribution.name),
              label: this.observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {initialValue: contribution.label ?? ''}),
              collapsible: contribution.collapsible,
              position: contribution.position,
              disabled: this.observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {initialValue: contribution.disabled ?? false}),
            } satisfies SciMenuGroupContribution;
          }
        }
      }));
      this._contributions.set(location, untracked(() => toSignal(contributions$, {initialValue: [], injector: this._injector})));
    }
    return this._contributions.get(location)!;
  }

  private observeProperty<T>(topic: string, options: {initialValue: T}): Signal<T> {
    if (!this._properties.has(topic)) {
      this._properties.set(topic, toSignal(this._messageClient.observe$<T>(topic).pipe(mapToBody()), {injector: this._injector, initialValue: options.initialValue}));
    }
    return this._properties.get(topic)! as Signal<T>;
  }
}

export function provideWorkbenchClientMenuAdapter(): Provider[] {
  return [
    {provide: SciMenuAdapter, useClass: WorkbenchClientMenuAdapter},
    {provide: SciMenuContextProvider, useClass: MicrofrontendMenuContextProvider},
  ];
}
