### Global Menu Bar: menu:org.eclipse.ui.main.menu
View Menu Bar:  menu:org.eclipse.ui.view.menu
Global Toolbar: toolbar:org.eclipse.ui.main.toolbar
View Toolbar: toolbar:org.eclipse.ui.view.toolbar?viewId=my.plugin.view

### Context Menu:
popup:com.example.view.contextMenu
popup:com.example.view.contextMenu?after=additions
popup:org.eclipse.ui.popup.any

### Adding Menu Items:
File: menu:org.eclipse.ui.main.menu?after=additions
Edit: menu:org.eclipse.ui.main.menu?after=menuitem:file // menu item
Edit: menu:org.eclipse.ui.main.menu?after=menu:disposition // sub menu or group
File: menu:org.eclipse.ui.main.menu?after=additions

## Ideas
- contributing sub-menu and menu-group is the same
  group simply does not create a sub-menu
- menu, group and menu-item can have id to contribute items relative to it
- move icon provider to @scion/components for use in menu
- move Material icon as fallback to the end
- programmatic API (fluent, builder) and template-contribution API


## API
```ts
const menuStart =  new Menu('menu:workbench.view.start.menu?viewId=myview');
const menuEnd =  new Menu('menu:workbench.view.end.menu?viewId=myview;align=end');

const menu =  new Menu('menu:org.eclipse.ui.view?viewId=myview;align=start', menu => menu
  .addMenuItem({id: 'print', icon: 'print'}, () => {})
  .addMenu({icon: 'Move To'}, menu => menu
    .addMenuItem({icon: 'Left Top'}, () => {})
    .addMenuItem({icon: 'Left Bottom'}, () => {})
  )
  .addGroup(group => group
    .addMenuItem({icon: 'collapse', label: 'Collapse'}, () => {})
    .addMenuItem({icon: 'expand', label: 'Expand'}, () => {})
  ));

menu.addMenuItem('menu:myenu?after=print', {
  
});

interface Menu {
  addMenuItem(locatorUR: string, menuItem: MenuItem): void;
}
```

```html
<ng-template sciMenuContribution locationURI="menu:workbench.view.start.menu">
  Text
</ng-template>
<ng-template sciMenuContribution locationURI="menu:workbench.view.start.menu">
  <wb-menu id="hello">
</ng-template>
```

```xml  

<extension point="org.eclipse.ui.menus">
  <menuContribution
    locationURI="menu:org.eclipse.ui.main.menu">
    <menu
      id="com.example.menu"
      label="Example">
      <command
        commandId="com.example.command.myCommand"
        label="My Command"
        style="push"/>
    </menu>
  </menuContribution>
</extension>
```

## Adding a menu before or after another menu in the main menubar

```xml

<menuContribution
  locationURI="menu:org.eclipse.ui.main.menu?before=org.eclipse.ui.edit.menu">
  <menu
    id="com.example.menu.myMenu"
    label="My Menu"/>
</menuContribution>
```

```xml

<menuContribution
  locationURI="menu:org.eclipse.ui.main.menu?after=org.eclipse.ui.file.menu">
  <menu
    id="com.example.menu.myMenu"
    label="My Menu"/>
</menuContribution>
```

## Example placing a command (menu-item) after a known group:

```xml

<menuContribution
  locationURI="menu:org.eclipse.ui.edit.menu?after=additions">
  <command
    commandId="com.example.command.myCommand"
    label="My Item"/>
</menuContribution>
```

## Example placing before a specific item:

```xml     

<menuContribution
  locationURI="menu:org.eclipse.ui.edit.menu?before=undo">
  <command
    commandId="com.example.command.myCommand"
    label="My Item"/>
</menuContribution>
```

## How to contribute sub-menu to existing menu:

Adds menu to main menu after additions

```xml

<menuContribution
  locationURI="menu:org.eclipse.ui.file.menu?after=additions">
  <menu
    id="com.example.menu.child"
    label="Child Menu"/>
</menuContribution>
```

Adds a sub menu in above menu

```xml

<menuContribution
  locationURI="menu:com.example.menu.child">
  <menu
    id="com.example.menu.grandchild"
    label="Grandchild Menu"/>
</menuContribution>
```

## How to contribute to a context menu?

In Eclipse RCP 3.x, context menus are contributed through the same menu contribution mechanism as the menubar, but the target is a popup menu identified by its menu ID. The menu must be registered by the view or editor.

1. The view or editor must register a context menu

```ts
const menuMgr = new MenuManager();
menuMgr.setRemoveAllWhenShown(true);
menuMgr.addMenuListener(mgr => fillContextMenu(mgr));
const menu = menuMgr.createContextMenu(viewer.getControl());
viewer.getControl().setMenu(menu);
getSite().registerContextMenu("com.example.view.contextMenu", menuMgr, viewer);
```

```xml

<extension point="org.eclipse.ui.menus">
  <menuContribution
    locationURI="popup:com.example.view.contextMenu">
    <command
      commandId="com.example.command.myCommand"
      label="My Action"/>
  </menuContribution>
</extension>
<menuContribution
locationURI="popup:com.example.view.contextMenu?after=additions">
<command
  commandId="com.example.command.myCommand"
  label="My Action"/>
</menuContribution>
```

### Contributing to all context menus:

```xml

<menuContribution locationURI="popup:org.eclipse.ui.popup.any">
  <command
    commandId="com.example.command.global"
    label="Global Action"/>
</menuContribution>
```

### How to contribute a checkmark menu?

```xml

<command
  commandId="com.example.command.toggle"
  label="Enable Option"
  style="toggle"/>
```

### How to add a separator?

Separator inside an existing menu

```xml

<extension point="org.eclipse.ui.menus">
  <menuContribution locationURI="menu:org.eclipse.ui.file.menu?after=additions">
    <separator
      name="com.example.separator1"/>
  </menuContribution>
</extension>
  ```

### Group marker as an insertion point

```xml

<menuContribution locationURI="menu:org.eclipse.ui.file.menu">
  <groupMarker
    name="com.example.group1"/>
</menuContribution>
```  

A group marker does not draw a separator unless items are added to the group. It exists only for positioning.

### How to add a radio button?
In Eclipse RCP 3.x, radio buttons in menus are implemented as radio style menu items bound to a shared command state. Mutual exclusion is achieved by using the same state ID.

```xml
<extension point="org.eclipse.ui.menus">
  <menuContribution locationURI="menu:org.eclipse.ui.view.menu?after=additions">
    <command
        commandId="com.example.command.mode"
        label="Mode 1"
        style="radio">
      <parameter
          name="org.eclipse.ui.commands.radioStateParameter"
          value="mode1"/>
    </command>

    <command
        commandId="com.example.command.mode"
        label="Mode 2"
        style="radio">
      <parameter
          name="org.eclipse.ui.commands.radioStateParameter"
          value="mode2"/>
    </command>

    <command
        commandId="com.example.command.mode"
        label="Mode 3"
        style="radio">
      <parameter
          name="org.eclipse.ui.commands.radioStateParameter"
          value="mode3"/>
    </command>
  </menuContribution>
</extension>
```

### How to contribute to toolbar?
```xml
<extension point="org.eclipse.ui.menus">
    <menuContribution
        locationURI="toolbar:org.eclipse.ui.main.toolbar">
        <command
            commandId="my.plugin.command"
            icon="icons/myicon.png"
            style="push"/>
    </menuContribution>
</extension>
```

How to contribute to view toolbar?
```xml
<extension point="org.eclipse.ui.menus">
  <menuContribution
    locationURI="toolbar:org.eclipse.ui.view.toolbar?viewId=my.plugin.view">
    <command
      commandId="my.plugin.command"
      icon="icons/myicon.png"
      style="push"/>
  </menuContribution>
</extension>
```
