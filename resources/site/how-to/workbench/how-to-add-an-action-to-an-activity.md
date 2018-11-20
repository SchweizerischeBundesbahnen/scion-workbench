![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to add an action to an activity

The platform allows to register actions with an activity. To register an action, go to the activity component template and model the action as a view child in the form of a `<ng-template>` decorated with `wbActivityAction` directive. The content of `ng-template` is then used to display the action.

The following snippet registers a Material-styled button as activity action. It is embedded in a `ng-template` decorated with `wbActivityAction` directive. When clicked, a view opens to create a new person.

```html 
<ng-template wbActivityAction>
    <button wbRouterLink="/person/new" mat-icon-button title="Create person">
        <mat-icon>add</mat-icon>
    </button>
</ng-template>
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md