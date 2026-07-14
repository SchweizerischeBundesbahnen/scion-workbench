TODO:
- Move changes of @scion/workbench-client to menu microfrontend commit (to not release @scion/workbench-client)
- Replace https://cdn.jsdelivr.net/gh/SchweizerischeBundesbahnen/scion-toolkit@issue/592/ by https://cdn.jsdelivr.net/npm/@scion/components/




BREAKING CHANGES
- Design Tokens:
- --sci-workbench-layout-panel-left-width -> --sci-workbench-activity-panel-left-width
- --sci-workbench-layout-panel-right-width -> --sci-workbench-activity-panel-right-width
- --sci-workbench-layout-panel-bottom-height -> --sci-workbench-activity-panel-bottom-align
- --sci-workbench-layout-panel-align -> --sci-workbench-activity-panel-bottom-align
- --sci-workbench-layout-panel-animate -> --sci-workbench-activity-panel-animate
- --sci-workbench-contextmenu-width -> --sci-workbench-view-contextmenu-width
- --sci-workbench-button-cursor -> --sci-button-cursor
- --sci-workbench-button-background-color-hover -> --sci-button-background-color-hover
- --sci-workbench-button-background-color-active -> --sci-button-background-color-active
- --sci-workbench-button-outline-width-focus -> --sci-button-outline-width
- --sci-workbench-button-outline-width-focus -> --sci-button-outline-width


Translations:
- built-in workbench texts are now prefixed with  `scion.workbench.`. Previously only `workbench.`.


- Removed VIEW_TAB_RENDERING_CONTEXT (ViewTabRenderingContext): no replacement
- Removed `WorkbenchPart.actions`. No replacement
- Removed `WorkbenchView.menuItems`. No replacement

RECOMMENDATIONS:


DEPRECATIONS:



RELEASE:
- Release @scion/workbench version "22.0.0-beta.2"


projects/scion/workbench/src
