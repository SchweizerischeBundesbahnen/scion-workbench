<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Localization

The SCION Workbench supports translation of built-in texts and application-specific texts used in the layout.

### How to Localize Texts in the Workbench
Texts can be localized using a text provider registered via configuration passed to the `provideWorkbench` function.
A text provider is a function that returns the text for a translation key.

```ts
import {provideWorkbench} from '@scion/workbench';
import {MaybeSignal} from '@scion/components/common';
import {inject} from '@angular/core';

provideWorkbench({
  textProvider: (key: string, params: Record<string, string>): MaybeSignal<string> | undefined => {
    // The `TranslateService` is illustrative and not part of the Workbench API.
    return inject(TranslateService).translate(key, params);
  },
});
```

> [!TIP]
> - The function can call `inject` to get any required dependencies, such as a translation service.
> - If working with observables, the function can use `toSignal` to convert an `Observable` to a `Signal`.

Texts subject to localization are of the type `Translatable`. A `Translatable` is a `string` that, if starting with the percent symbol (`%`), is passed to the text provider for translation, with the percent symbol omitted.
Otherwise, the text is returned as is. A translation key may include parameters in matrix notation for text interpolation.

Examples:
- `%key`: translation key
- `%key;param=value`: translation key with a single interpolation parameter
- `%key;param1=value1;param2=value2`: translation key with multiple interpolation parameters
- `text`: no translation key, text is returned as is

Example of using the translation key `%projects` as the label of a workbench part:

```ts
import {MAIN_AREA, provideWorkbench} from '@scion/workbench';

provideWorkbench({
  layout: factory => factory
    .addPart(MAIN_AREA)
    // Add a docked part with the translatable label '%projects'.
    // The translation key `projects` will be passed to the text provider for translation.   
    .addPart('projects', {dockTo: 'left-top'}, {label: '%projects', icon: 'project'}),
});

```

The SCION Workbench uses the following translation keys for built-in texts. Using a text provider, they can be changed or localized.

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

The translation keys of texts used by the SCION Workbench start with the `scion.workbench.` prefix. To not localize built-in SCION texts, the text provider can return `undefined` instead.

```ts
import {provideWorkbench} from '@scion/workbench';
import {MaybeSignal} from '@scion/components/common';
import {inject} from '@angular/core';

provideWorkbench({
  textProvider: (key: string): MaybeSignal<string> | undefined => {
    if (key.startsWith('scion.')) {
      return undefined;
    }

    // The `TranslateService` is illustrative and not part of the Workbench API.
    return inject(TranslateService).translate(key);
  },
});
```
[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
