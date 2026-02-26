import {createEnvironmentInjector, EnvironmentInjector, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, runInInjectionContext, Signal} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchMenuCommand, WorkbenchMenuCommands, WorkbenchMenuGroupCommand, WorkbenchMenuItemCommand, WorkbenchSelectCommand, ɵMENU_ID_KEY, ɵWorkbenchCommands, ɵWorkbenchMenuContributionCommand, ɵWorkbenchMenuContributionRequestCommand} from '@scion/workbench-client';
import {contributeMenu, SciMenu, SciMenuGroup, SciMenuService, SciToolbar, SciToolbarGroup} from '@scion/sci-components/menu';
import {Disposable} from '../../common/disposable';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {mapArray} from '@scion/toolkit/operators';

function installMenu(): void {
  const injector = inject(EnvironmentInjector);
  const menuService = inject(SciMenuService);
  const messageClient = Beans.get(MessageClient);

  messageClient.onMessage<ɵWorkbenchMenuContributionCommand>(ɵWorkbenchCommands.menuContributionRegisterTopic(':menuContributionId'), message => {
    const menuContributionId = message.params!.get('menuContributionId') as string;
    const disposables = new Array<Disposable>();
    const {location, contributions, context} = message.body!;

    const environmentInjector = createEnvironmentInjector([], injector);

    runInInjectionContext(environmentInjector, () => {
      if (location.startsWith('menu:') || location.startsWith('group(menu):')) {
        disposables.push(contributeToMenu(location as `menu:${string}` | `group(menu):${string}`, contributions, context));
      }
      else if (location.startsWith('toolbar:') || location.startsWith('group(toolbar):')) {
        disposables.push(contributeToToolbar(location as `toolbar:${string}` | `group(toolbar):${string}`, contributions, context));
      }
    });

    messageClient.onMessage(ɵWorkbenchCommands.menuContributionUnregisterTopic(menuContributionId), () => {
      environmentInjector.destroy();
      disposables.forEach(disposable => disposable.dispose());
    });
  });

  messageClient.onMessage<ɵWorkbenchMenuContributionRequestCommand, WorkbenchMenuCommands>(ɵWorkbenchCommands.menuContributionTopic, message => {
    const {location, context} = message.body!;
    return toObservable(menuService.menuContributions([location], context), {injector}).pipe(mapArray(contribution => {
      switch (contribution.type) {
        case 'menu': {
          return {
            type: 'menu',
            id: contribution.data?.[ɵMENU_ID_KEY] as string,
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
            disabled: contribution.disabled(),
            visualMenuHint: contribution.visualMenuHint,
            position: contribution.position,
            menu: contribution.menu,
            cssClass: contribution.cssClass,
          } satisfies WorkbenchMenuCommand;
        }
        case 'menu-item': {
          return {
            type: 'menu-item',
            id: contribution.data?.[ɵMENU_ID_KEY] as string,
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
            disabled: contribution.disabled(),
            checked: contribution.checked?.(),
            actionToolbarName: contribution.actionToolbarName?.(),
            position: contribution.position,
            cssClass: contribution.cssClass,
          } satisfies WorkbenchMenuItemCommand;
        }
        case 'group': {
          return {
            type: 'group',
            id: contribution.data?.[ɵMENU_ID_KEY] as string,
            name: contribution.name,
            label: contribution.label?.(),
            collapsible: contribution.collapsible,
            position: contribution.position,
            disabled: contribution.disabled ? contribution.disabled() : false,
          } satisfies WorkbenchMenuGroupCommand;
        }
      }
    }));
  });
}

function contributeToMenu(location: `menu:${string}` | `group(menu):${string}`, contributions: WorkbenchMenuCommands, context: Map<string, unknown>): Disposable {
  const messageClient = Beans.get(MessageClient);
  const injector = inject(Injector);

  return contributeMenu({location, context}, (menu: SciMenu | SciMenuGroup) => {
    for (const contribution of contributions) {
      switch (contribution.type) {
        case 'menu':
          menu.addMenu({
            name: contribution.name,
            label: observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}),
            icon: contribution.icon !== undefined ? observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {injector, initialValue: contribution.icon ?? ''}) : undefined,
            tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            disabled: observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {injector, initialValue: contribution.disabled ?? false}),
            menu: contribution.menu,
            data: {[ɵMENU_ID_KEY]: contribution.id},
          }, menu => menu);
          break;
        case 'menu-item':
          menu.addMenuItem({
            name: contribution.name,
            label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : '',
            tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            icon: contribution.icon !== undefined ? observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {injector, initialValue: contribution.icon ?? ''}) : undefined,
            checked: contribution.checked !== undefined ? observeProperty(ɵWorkbenchCommands.menuCheckedTopic(contribution.id), {injector, initialValue: contribution.checked ?? false}) : undefined,
            disabled: observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {injector, initialValue: contribution.disabled ?? false}),
            accelerator: contribution.accelerator,
            data: {[ɵMENU_ID_KEY]: contribution.id},
          }, () => void messageClient.publish<WorkbenchSelectCommand>(ɵWorkbenchCommands.menuSelectTopic(contribution.id), {context}));
          break;
        case 'group':
          menu.addGroup({
            name: contribution.name,
            label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            disabled: observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {injector, initialValue: contribution.disabled ?? false}),
            collapsible: contribution.collapsible,
            data: {[ɵMENU_ID_KEY]: contribution.id},
          });
          break;
      }
    }
    return menu;
  }, {injector});
}

function contributeToToolbar(location: `toolbar:${string}` | `group(toolbar):${string}`, contributions: WorkbenchMenuCommands, context: Map<string, unknown>): Disposable {
  const messageClient = Beans.get(MessageClient);
  const injector = inject(Injector);

  return contributeMenu({location, context}, (toolbar: SciToolbar | SciToolbarGroup) => {
    for (const contribution of contributions) {
      switch (contribution.type) {
        case 'menu':
          toolbar.addMenu({
            name: contribution.name,
            label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            menu: contribution.menu,
            data: {[ɵMENU_ID_KEY]: contribution.id},
          }, menu => menu);
          break;
        case 'menu-item':
          toolbar.addToolbarItem({
            name: contribution.name,
            label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
            icon: contribution.icon !== undefined ? observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {injector, initialValue: contribution.icon ?? ''}) : undefined,
            checked: contribution.checked !== undefined ? observeProperty(ɵWorkbenchCommands.menuCheckedTopic(contribution.id), {injector, initialValue: contribution.checked ?? false}) : undefined,
            data: {[ɵMENU_ID_KEY]: contribution.id},
          }, () => void messageClient.publish<WorkbenchSelectCommand>(ɵWorkbenchCommands.menuSelectTopic(contribution.id), {context}));
          break;
        case 'group':
          toolbar.addGroup({
            name: contribution.name,
            data: {[ɵMENU_ID_KEY]: contribution.id},
          });
          break;
      }
    }
    return toolbar;
  }, {injector});
}

function observeProperty<T>(topic: string, options: {injector: Injector, initialValue: T}): Signal<T> {
  const messageClient = Beans.get(MessageClient);
  return toSignal(messageClient.observe$<T>(topic).pipe(mapToBody()), {injector: options.injector, initialValue: options.initialValue});
}

/**
 * Registers a set of DI providers to set up workbench menus.
 */
export function provideWorkbenchMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => installMenu(), {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}
