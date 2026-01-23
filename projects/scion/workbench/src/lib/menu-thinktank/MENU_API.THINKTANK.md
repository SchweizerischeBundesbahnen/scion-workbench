```html

    <ng-template sciMenuContribution >
      
    </ng-template>

```

```html
<sci-toolbar id="toolbar:workbench.part"/>


```

```ts
import {Signal} from '@angular/core';

// toolbar:workbench.part.primary
// toolbar:workbench.part.secondary
// toolbar:workbench.activity
// contextmenu:workbench.view

function contributrMenu(injector: {}): Disposable {
}

openMenu('contextmenu:workbench.view', {anchor: 'HTMLElmenet'});

provideMenu('contextmenu:workbench.view', contextmenu => oncontextmenu()

provideMenu('group:hello', contextmenu => oncontextmenu()

provideMenu('toolbar:workbench.part', toolbar => toolbar

provideMenu('menu:workbench.view', toolbar => toolbar,
);

provideMenu('contextmenu:workbench.view', menu => menu
  .addMenu(menu => menu
    .text('Show on Double-Click')
    .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
    .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
  )
  .addMenu(menu => menu
    .text('Configure Local Changes')
    .addGroup(group => group
      .label('Display as')
      .addMenuItem({text: 'Staging Area', style: 'toggle'}, onSelect)
      .addMenuItem({text: 'Changelists', style: 'toggle'}, onSelect),
    ),
  )
  .addMenuItem({text: 'Commit All when Nothing Is Staged', style: 'toggle'}, onSelect),
);

contributeMenu('menu:workbench.part.toolbar.menu.additions', menu => menu
  .addMenu(menu => menu
    .icon('⋮')
    .id('menu:workbench.part.toolbar.menu.additions')
    .addGroup(group => group
      .id('my group')
      .addMenu(menu => menu
        .text('Show on Double-Click')
        .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
        .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
      )
      .addMenu({icon: '', text: 'Show on Double-Click'}, menu => menu
        .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
        .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
      )
      .addMenu('Show on Double-Click', {id: '123', tooltip: '333'}, menu => menu
        .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
        .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
      )
      .addMenu(menu => menu
        .configure({text: '', tooltip: '', id: '', disabled: () => Signal<boolean>})
        .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
        .addMenuItem({text: 'Source', icon: 'icon', style: 'toggle'}, () => {

        })
        .addMenuItem('title', () => {

        }, {id: 'dsafsaf', icon: ''})
        .addMenuItem({
          text: 'Source',
          icon: 'icon',
          style: 'toggle',
          action: () => {

          },
        })
        .addMenuItem({text: 'Source', icon: 'icon', style: 'toggle', disabled: true}, () => {

        })
      ),
    )
    .addMenu('Show on Double-Click', menu => menu
      .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
      .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
    )
    .addMenu({text: 'Show on Double-Click', id: ''}, menu => menu
      .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
      .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
    )
    .addMenu(menu => menu
      .text('Configure Local Changes')
      .addGroup(group => group
        .label('Display as')
        .addMenuItem({text: 'Staging Area', style: 'toggle'}, onSelect)
        .addMenuItem({text: 'Changelists', style: 'toggle'}, onSelect),
      ),
    )
    .addMenuItem({text: 'Commit All when Nothing Is Staged', style: 'toggle'}, onSelect),
  ),
)
;

provideMenu('menu:workbench.part', menu => menu
  .addMenuItem({icon: 'refresh', accelerator: 'F5', disabled: isDisabled}, onSelect)
  .addToolbarItem({component: Component}, onSelect)
  .addGroup(group => group
    // .label('Font style')
    .addMenuItem({icon: 'bold', style: 'toggle'}, onSelect)
    .addMenuItem({icon: 'regular', style: 'toggle'}, onSelect)
    .addMenuItem({icon: 'italic', style: 'toggle'}, onSelect),
  )
}

provideMenu('group:dispositions', menu => menu

}

provideToolbar('toolbar:workbench.part', toolbar => toolbar
  .addMenuItem({icon: 'refresh', accelerator: 'F5', disabled: isDisabled}, onSelect)
  .addMenuItem({component: Component}, onSelect)
  .addGroup(group => group
    // .label('Font style')
    .addMenuItem({icon: 'bold', style: 'toggle'}, onSelect)
    .addMenuItem({icon: 'regular', style: 'toggle'}, onSelect)
    .addMenuItem({icon: 'italic', style: 'toggle'}, onSelect),
  )
  .addMenu(menu => menu
    .icon('⋮')
    .id('menu:workbench.part.toolbar.menu.additions')
    .addGroup(group => group
      .id('my group')
      .addMenu(menu => menu
        .text('Show on Double-Click')
        .addMenuItem({text: 'Diff', style: 'toggle'}, onSelect)
        .addMenuItem({text: 'Source', style: 'toggle'}, onSelect),
      )
      .addMenu(menu => menu
        .text('Configure Local Changes')
        .addGroup(group => group
          .label('Display as')
          .addMenuItem({text: 'Staging Area', style: 'toggle'}, onSelect)
          .addMenuItem({text: 'Changelists', style: 'toggle'}, onSelect),
        ),
      )
      .addMenuItem({text: 'Commit All when Nothing Is Staged', style: 'toggle'}, onSelect),
    )
  .addGroup(group => group
    .addMenuItem({text: 'Speed Search', icon: 'search', accelerator: 'Ctrl + F or any symbol'}, onSelect),
  )
  .addGroup(group => group
    // .label('Misc')
    .addMenuItem({text: 'Show Toolbar', style: 'toggle'}, onSelect)
    .addMenuItem({text: 'Group Tabs', style: 'toggle'}, onSelect)
    .addMenu(menu => menu
      .text('Panel Alignment')
      .addMenuItem({text: 'Center', style: 'toggle'}, onSelect)
      .addMenuItem({text: 'Justify', style: 'toggle'}, onSelect)
      .addMenuItem({text: 'Left', style: 'toggle'}, onSelect)
      .addMenuItem({text: 'Right', style: 'toggle'}, onSelect),
    )
    .addMenu(menu => menu
      .text('Move to')
      .addMenuItem({text: 'Left Top'}, onSelect)
      .addMenuItem({text: 'Left Bottom'}, onSelect)
      .addMenuItem({text: 'Right Top'}, onSelect)
      .addMenuItem({text: 'Right Bottom'}, onSelect),
    ),
  )
  .addGroup(group => group
    .addMenuItem({text: 'Remove from sidebar'}, onSelect),
  )
  .addGroup(group => group
    .addMenuItem({text: 'Help', icon: 'help'}, onSelect),
  )
)
)
;

contributeMenuItems('menu:workbench.part.toolbar.menu.additions?after=speedsearch', menu => menu
  .addMenuItem({text: 'Contribution', style: 'toggle'}, onSelect),
);

```

function isDisabled(): Signal<boolean> {

}

function onSelect(): void {

}

```

