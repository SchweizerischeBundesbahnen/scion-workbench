<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Localization

Learn how to localize texts in the SCION Workbench.

***
**Content:**
- [Text Provider](#text-provider)
- [Translatable Text](#translatable-text)
- [Built-In Texts](#built-in-texts)
- [Related Information](#related-information)
***

### Text Provider
Text providers are used to provide texts to the SCION Workbench. A text provider is a function that returns the text for a translation key.

A text provider can be registered via configuration passed to the `provideWorkbench` function.

```ts
import {provideWorkbench} from '@scion/workbench';
import {MaybeSignal} from '@scion/components/common';
import {inject} from '@angular/core';

provideWorkbench({
  textProvider: (key: string, params: Record<string, string>): MaybeSignal<string> | undefined => {
    if (key.startsWith('scion.')) {
      return undefined; // <--- return `undefined` to not translate built-in texts
    }
    return inject(TranslateService).translate(key, params); // The `TranslateService` is illustrative.
  },
});
```

> [!TIP]
> - The function can call `inject` to get any required dependencies, such as a translation service.
> - The function can use `toSignal` to convert an `Observable` to a `Signal`.
> - The function can return `undefined` to skip translating a key, e.g., to use the default text for built-in texts.
> - Built-in texts start with the `scion.` prefix.

### Translatable Text
Texts subject to localization are typed as `Translatable`. A `Translatable` is a `string` that, if it starts with the percent symbol (`%`), is passed to registered text providers for translation, with the percent symbol omitted.
Otherwise, the text is used as is. A translation key may include parameters in matrix notation for text interpolation.

Example of a translatable property:
```ts
interface DockedPartExtras {
  label: Translatable; // <--- translatable property
  // ... other properties skipped
}
```

Example usage:
```ts
import {MAIN_AREA, provideWorkbench} from '@scion/workbench';

provideWorkbench({
  layout: factory => factory
    .addPart(MAIN_AREA)
    .addPart('projects', {dockTo: 'left-top'}, {
      label: '%projects.label', // <--- `projects.label` is used as translation key and passed to registered text providers for translation
      icon: 'project',
    }),
});
```

Examples of Translatables:
- `%key`: translation key
- `%key;param=value`: translation key with a single interpolation parameter
- `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
- `text`: no translation key; text is used as a literal string

> [!TIP]
> Semicolons in interpolation parameters must be escaped with two backslashes (`\\;`).

### Built-In Texts
The SCION Workbench uses the following built-in texts:

| Translation Key                                       | Default Text                                                                                                                  |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| scion.workbench.clear.tooltip                         | Clear                                                                                                                         |
| scion.workbench.close.action                          | Close                                                                                                                         |
| scion.workbench.close_all_tabs.action                 | Close All Tabs                                                                                                                |
| scion.workbench.close_other_tabs.action               | Close Other Tabs                                                                                                              |
| scion.workbench.close_tab.action                      | Close                                                                                                                         |
| scion.workbench.close_tab.tooltip                     | Close. {{close_others_modifier}}+Click to Close Others.                                                                       |
| scion.workbench.close_tabs_to_the_left.action         | Close Tabs to the Left                                                                                                        |
| scion.workbench.close_tabs_to_the_right.action        | Close Tabs to the Right                                                                                                       |
| scion.workbench.close.tooltip                         | Close                                                                                                                         |
| scion.workbench.dev_mode_only_hint.tooltip            | This hint is only displayed in dev mode.                                                                                      |
| scion.workbench.minimize.tooltip                      | Minimize                                                                                                                      |
| scion.workbench.move_tab_down.action                  | Move Down                                                                                                                     |
| scion.workbench.move_tab_to_new_window.action         | Move to New Window                                                                                                            |
| scion.workbench.move_tab_to_the_left.action           | Move Left                                                                                                                     |
| scion.workbench.move_tab_to_the_right.action          | Move Right                                                                                                                    |
| scion.workbench.move_tab_up.action                    | Move Up                                                                                                                       |
| scion.workbench.no_views.message                      | No views found.                                                                                                               |
| scion.workbench.null_content.message                  | Nothing to show.                                                                                                              |
| scion.workbench.null_view_developer_hint.message      | This view has not been navigated. Navigate the view "{{view}}" to display content.                                            |
| scion.workbench.ok.action                             | OK                                                                                                                            |
| scion.workbench.page_not_found.message                | The requested page {{path}} was not found. The URL may have changed.                                                          |
| scion.workbench.page_not_found.title                  | Page Not Found                                                                                                                |
| scion.workbench.page_not_found_developer_hint.message | You can create a custom "Not Found" page component and register it in the workbench configuration to personalize this page.   |
| scion.workbench.page_not_found_part.message           | The requested page {{path}} was not found. The URL may have changed. Try resetting the perspective.                           |
| scion.workbench.page_not_found_view.message           | The requested page {{path}} was not found. The URL may have changed. Try opening the view again or resetting the perspective. |
| scion.workbench.reset_perspective.action              | Reset Perspective                                                                                                             |
| scion.workbench.show_open_tabs.tooltip                | Show Open Tabs                                                                                                                |

> [!NOTE]
> The application can register a text provider to replace built-in SCION Workbench texts.

### Related Information
The SCION Workbench uses the text mechanism from `@scion/components`. See the [@scion/components documentation][link-scion-components-texts] for available text APIs and a list of the built-in texts used in SCION components.  

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md

[link-scion-components-texts]: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/scion-localization.md
