import {effect, inject, Injector, isSignal, untracked} from '@angular/core';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from '@scion/workbench-client';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '@scion/sci-components/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';
import {MaybeSignal} from '../../common/utility-types';
import {Observable, of} from 'rxjs';

// WorkbenchMenuItemLike <> SciMenuItemLike
// Equivalent to workbench-client-menu-transform.ts in @scion/workbench-client-angular
export namespace SciMenuModel {

  export function transformToSciMenuModel(menuItems: WorkbenchMenuItemLike[], options?: {injector?: Injector}): SciMenuItemLike[] {
    const injector = options?.injector ?? inject(Injector);

    return menuItems.map((menuItem: WorkbenchMenuItemLike): SciMenuItemLike => {
      switch (menuItem.type) {
        case 'menu-item': {
          return {
            type: menuItem.type,
            name: menuItem.name,
            label: menuItem.label && {text: toSignal(menuItem.label, {injector, requireSync: true})},
            icon: menuItem.icon && toSignal(menuItem.icon, {injector, requireSync: true}),
            tooltip: menuItem.tooltip && toSignal(menuItem.tooltip, {injector, requireSync: true}),
            accelerator: menuItem.accelerator,
            disabled: toSignal(menuItem.disabled, {injector, requireSync: true}),
            checked: menuItem.checked && toSignal(menuItem.checked, {injector, requireSync: true}),
            actions: SciMenuModel.transformToSciMenuModel(menuItem.actions, {injector}),
            // matchesFilter: (filter: string) => true; // TODO
            cssClass: menuItem.cssClass,
            position: menuItem.position,
            onSelect: () => menuItem.select(),
          } satisfies SciMenuItem;
        }
        case 'menu': {
          return {
            type: menuItem.type,
            name: menuItem.name,
            label: menuItem.label && {text: toSignal(menuItem.label, {injector, requireSync: true})},
            icon: menuItem.icon && toSignal(menuItem.icon, {injector, requireSync: true}),
            tooltip: menuItem.tooltip && toSignal(menuItem.tooltip, {injector, requireSync: true}),
            disabled: toSignal(menuItem.disabled, {injector, requireSync: true}),
            visualMenuHint: menuItem.visualMenuHint,
            position: menuItem.position,
            menu: {
              width: menuItem.menu.width,
              minWidth: menuItem.menu.minWidth,
              maxWidth: menuItem.menu.maxWidth,
              maxHeight: menuItem.menu.maxHeight,
              filter: menuItem.menu.filter,
            },
            cssClass: menuItem.cssClass,
            children: SciMenuModel.transformToSciMenuModel(menuItem.children, {injector}),
          } satisfies SciMenu;
        }
        case 'group': {
          return {
            type: menuItem.type,
            name: menuItem.name,
            label: menuItem.label && toSignal(menuItem.label, {injector, requireSync: true}),
            collapsible: menuItem.collapsible,
            position: menuItem.position,
            disabled: toSignal(menuItem.disabled, {injector, requireSync: true}),
            cssClass: menuItem.cssClass,
            children: SciMenuModel.transformToSciMenuModel(menuItem.children, {injector}),
          } satisfies SciMenuGroup;
        }
      }
    });
  }

  export function transformToWorkbenchMenuModel(menuItems: SciMenuItemLike[], options?: {injector?: Injector}): WorkbenchMenuItemLike[] {
    const injector = options?.injector ?? inject(Injector);

    return menuItems.map((menuItem: SciMenuItemLike): WorkbenchMenuItemLike => {
      const menuItemId = UUID.randomUUID();

      switch (menuItem.type) {
        case 'menu-item': {
          if (menuItem.label?.component) {
            throw Error('[MenuDefinitionError] Component not supported as menu label.');
          }

          return new WorkbenchMenuItem({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label?.text, {injector}),
            icon: toLazyObservable(menuItem.icon, {injector}),
            tooltip: toLazyObservable(menuItem.tooltip, {injector}),
            accelerator: menuItem.accelerator,
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            checked: toLazyObservable(menuItem.checked, {injector}),
            actions: SciMenuModel.transformToWorkbenchMenuModel(menuItem.actions, {injector}),
            cssClass: menuItem.cssClass,
            position: menuItem.position,
            // matchesFilter: filter => menuItem?.matchesFilter(filter),
            onSelect: menuItem.onSelect,
          });
        }
        case 'menu': {
          if (menuItem.label?.component) {
            throw Error('[MenuDefinitionError] Component not supported as menu label.');
          }

          return new WorkbenchMenu({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label?.text, {injector}),
            icon: toLazyObservable(menuItem.icon, {injector}),
            tooltip: toLazyObservable(menuItem.tooltip, {injector}),
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            visualMenuHint: menuItem.visualMenuHint,
            position: menuItem.position,
            menu: {
              width: menuItem.menu.width,
              minWidth: menuItem.menu.minWidth,
              maxWidth: menuItem.menu.maxWidth,
              maxHeight: menuItem.menu.maxHeight,
              filter: menuItem.menu.filter,
            },
            cssClass: menuItem.cssClass,
            children: SciMenuModel.transformToWorkbenchMenuModel(menuItem.children, {injector}),
          });
        }
        case 'group': {
          return new WorkbenchMenuGroup({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label, {injector}),
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            collapsible: menuItem.collapsible,
            position: menuItem.position,
            cssClass: menuItem.cssClass,
            children: SciMenuModel.transformToWorkbenchMenuModel(menuItem.children, {injector}),
          });
        }
      }
    });
  }
}

function toLazyObservable<T>(signal: MaybeSignal<NonNullable<T>>, options?: {injector?: Injector}): Observable<NonNullable<T>>;
function toLazyObservable<T>(signal: MaybeSignal<T> | undefined, options?: {injector?: Injector}): Observable<NonNullable<T>> | undefined;
function toLazyObservable<T>(signal: MaybeSignal<T> | undefined, options?: {injector?: Injector}): Observable<T> | undefined {
  if (signal === undefined) {
    return undefined;
  }
  if (!isSignal(signal)) {
    return of(signal);
  }

  const injector = options?.injector ?? inject(Injector);
  return new Observable(observer => {
    const initialValue = signal();
    let isFirstEffectRun = true;

    // Emit initial value synchronously.
    observer.next(initialValue);

    const effectRef = effect(() => {
      const value = signal();

      untracked(() => {
        if (!isFirstEffectRun || initialValue !== value) {
          observer.next(value);
        }
        isFirstEffectRun = false;
      });
    }, {injector, manualCleanup: true});

    return () => effectRef.destroy();
  });
}
