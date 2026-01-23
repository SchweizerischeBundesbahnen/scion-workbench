/* eslint-disable */

import {Menu, openMenu, provideMenu} from './menu.model';
import {inject} from '@angular/core';
import {Disposable, WorkbenchPart} from '@scion/workbench';

{
  const element: HTMLElement = null as unknown as HTMLElement;
  openMenu('contextmenu:workbench.view', element);
}

/**
 * Provides menu for the current workbench element, or the part provided by given injection context.
 */
export function provideWorkbenchPartMenu(name: string, menuFactoryFn: (menu: Menu) => Menu): Disposable {
  const currentPart = inject(WorkbenchPart);
  return provideMenu(name, menuFactoryFn, {canMatch: () => inject(WorkbenchPart) === currentPart});
}

{
  // app.components.ts
  provideMenu('toolbar:workbench.part.start',
    toolbar => toolbar
      .addMenuItem({icon: 'add', text: 'Add'}, onAction),
    {canMatch: canMatchMainArea},
  );

  // example-part.components.ts
  provideMenu('toolbar:workbench.part.end',
    toolbar => toolbar
      .addMenuItem({icon: 'reload', text: 'Reload'}, onAction),
    {canMatch: canMatchCurrentWorkbenchPart()},
  );

  function canMatchMainArea(): boolean {
    return inject(WorkbenchPart).isInMainArea;
  }

  function canMatchCurrentWorkbenchPart(): () => boolean {
    const currentPart = inject(WorkbenchPart);
    return () => currentPart === inject(WorkbenchPart);
  }

  provideMenu('toolbar:workbench.part.tools', menu => menu
    .addMenuItem({text: 'Refresh'}, onAction)
    .addMenuItem({text: 'Save'}, onAction)
    .addMenu({text: '⋮'}, menu => menu
      .addMenuItem({text: 'Dock Pinned', checked: () => true, icon: 'fdsa'}, onAction)
      .addMenuItem({text: 'Dock Unpinned', mnemonic: 'U', checked: () => false}, onAction)
      .addMenuItem({text: 'Float', checked: () => false}, onAction)
      .addMenuItem({text: 'Window', checked: () => false}, onAction),
    ),
  );

  provideMenu('contextmenu:workbench.view', menu => menu
    .addMenuItem({text: 'Close'}, onAction)
    .addMenuItem({text: 'Close Other Tabs'}, onAction)
    .addMenuItem({text: 'Close Tabs To The Right'}, onAction)
    .addMenuItem({text: 'Pin Tab'}, onAction)
    .addMenuItem({text: 'Open Tab in New Window'}, onAction)
    .addGroup(group => group
      .addMenuItem({text: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F']}, onAction),
    )
    .addGroup(group => group
      .addMenu({text: 'View Mode'}, menu => menu
        .addMenuItem({text: 'Dock Pinned', checked: () => true, icon: 'fdsa'}, onAction)
        .addMenuItem({text: 'Dock Unpinned', mnemonic: 'U', checked: () => false}, onAction)
        .addMenuItem({text: 'Float', checked: () => false}, onAction)
        .addMenuItem({text: 'Window', checked: () => false}, onAction),
      )
      .addMenu({text: 'Move to'}, menu => menu
        .addMenuItem({text: 'Left top', icon: 'left_top', disabled: () => true}, onAction)
        .addMenuItem({text: 'Left bottom', icon: 'left_bottom', disabled: () => false}, onAction)
        .addMenuItem({text: 'Right top', icon: 'right_top', disabled: () => false}, onAction)
        .addMenuItem({text: 'Right bottom', icon: 'right_bottom', disabled: () => false}, onAction),
      ),
    )
    .addMenu({text: 'Open In'}, menu => menu
      .addMenuItem({text: 'Explorer'}, onAction)
      .addMenuItem({text: 'Terminal', icon: 'terminal'}, onAction),
    )
    .addMenu({text: 'Git', mnemonic: 'G'}, menu => menu
      .addMenuItem({text: 'Add', icon: 'add', accelerator: ['Ctrl', 'Alt', 'A']}, onAction)
      .addMenu({text: 'GitHub', icon: 'github', id: 'menu:github'}, menu => menu
        .addMenuItem({text: 'Create Pull Request...', icon: 'github'}, onAction)
        .addMenuItem({text: 'view Pull Requests'}, onAction)
        // .addMenuItem({text: 'Share Project on GitHub'}, onAction)
        .addMenuItem({text: 'Clone Repository from GitHub...'}, onAction)
        .addGroup({id: 'group:git.additions'})
        .addMenuItem({text: 'Manage GitHub Accounts...'}, onAction),
      ),
    ),
  );

  provideMenu('group:git.additions', group => group.addMenuItem({text: 'Share Project on GitHub'}, onAction));

  provideMenu('contextmenu:workbench.view', menu => menu
    .addGroup(group => group
      .addMenuItem({text: 'Close'}, onAction)
      .addMenuItem({text: 'Close Other Tabs'}, onAction)
      .addMenuItem({text: 'Close Tabs To The Right'}, onAction),
    )
    .addGroup(group => group
      .addMenuItem({text: 'Pin Tab'}, onAction)
      .addMenuItem({text: 'Open Tab in New Window'}, onAction),
    )
    .addGroup(group => group
      .addMenu({text: 'Open In'}, menu => menu
        .addMenuItem({text: 'Explorer'}, onAction)
        .addMenuItem({text: 'Terminal', icon: 'terminal'}, onAction),
      ),
    )
    .addGroup(group => group
      .addMenu({text: 'Git', mnemonic: 'G'}, menu => menu
        .addMenuItem({text: 'Add', icon: 'add', accelerator: ['Ctrl', 'Alt', 'A']}, onAction)
        .addMenu({text: 'GitHub', icon: 'github', id: 'menu:github'}, menu => menu
          .addGroup(group => group
            .addMenuItem({text: 'Create Pull Request...', icon: 'github'}, onAction)
            .addMenuItem({text: 'view Pull Requests'}, onAction),
          )
          .addGroup(group => group
            .addMenuItem({text: 'Share Project on GitHub'}, onAction)
            .addMenuItem({text: 'Clone Repository from GitHub...'}, onAction),
          )
          .addGroup({id: 'additions'})
          .addGroup(group => group
            .addMenuItem({text: 'Manage GitHub Accounts...'}, onAction),
          ),
        ),
      ),
    ),
  );
}

function onAction(): void {
}
