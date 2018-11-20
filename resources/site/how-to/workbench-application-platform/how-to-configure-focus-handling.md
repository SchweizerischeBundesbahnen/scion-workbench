![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to configure focus handling

The platform allows configuring focus handling for Angular applications.

Open `app.module.ts` and configure focus handling when importing `WorkbenchApplicationModule`:

Following configurations are supported:

|property|type|default|description|
|-|-|-|-|
|trapFocus|boolean|true|Specifies if to create a focus-trapping region around this application, meaning, that when inside the application, pressing tab or shift+tab should cycle the focus within the application only.|
|autofocus|boolean|true|Specifies if to focus the first focusable element when the application loads. Alternatively, you can use the `autofocus` HTML attribute to make an input take focus when the form is presented.|
|restoreFocusOnActivate|boolean|true|Specifies if to restore the focus to the last focused element (if any) when this application is activated.|

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md