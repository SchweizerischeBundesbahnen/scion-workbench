<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

SCION Workbench provides a set of settings to adapt the workbench to individual preferences and working styles.

The application can define defaults through design tokens and may provide a user interface for the user to change settings. User preferences are stored in workbench storage (defaults to local storage).
The SCION Workbench has no built-in user interface for changing settings; the application must implement it.

<details>
    <summary><strong>Theme</strong></summary>
    <br>

Specifies the workbench theme. Built-in themes are `scion-light` and `scion-dark`. Refer to [How to Theme the SCION Workbench][link-how-to-theme-workbench] for custom themes.

A theme is selected based on the user's OS color scheme preference or can be explicitly set using the `sci-theme` attribute on the HTML root element.
```html
<html sci-theme="scion-light">
   ...
</html>
```

Set user's preference via `WorkbenchService.settings.theme` property.
```ts
inject(WorkbenchService).settings.theme.set('scion-light');
```
</details>

[link-how-to-theme-workbench]: ./how-to-theme-workbench.md

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
