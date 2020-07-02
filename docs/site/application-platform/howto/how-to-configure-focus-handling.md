<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Focus

#### How to configure focus handling

The platform allows configuring focus handling for Angular applications.

Open `app.module.ts` and configure focus handling when importing `WorkbenchApplicationModule`:

Following configurations are supported:

|property|type|default|description|
|-|-|-|-|
|trapFocus|boolean|true|Specifies if to create a focus-trapping region around this application, meaning, that when inside the application, pressing tab or shift+tab should cycle the focus within the application only.|
|autofocus|boolean|true|Specifies if to focus the first focusable element when the application loads. Alternatively, you can use the `autofocus` HTML attribute to make an input take focus when the form is presented.|
|restoreFocusOnActivate|boolean|true|Specifies if to restore the focus to the last focused element (if any) when this application is activated.|

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
