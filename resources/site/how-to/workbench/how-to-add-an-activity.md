![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to add an activity

An activity is a visual workbench element shown at the left-hand side of the workbench frame and acts as an entry point into the application. At any given time, only a single activity can be active.

Activities are modelled in `app.component.html` as content children of `<wb-workbench>` in the form of `<wb-activity>` elements. The activity items are displayed in the activity panel to the left of the workbench frame.
When clicked, the component registered under the specified router link is opened, either in the activity panel (which is by default), or as a view. Configure this behavior with `target` property.

Do not forget to register the route used as `routerLink` path.

The following snippet illustrates how to open the component in the activity panel.

```html
<wb-workbench>
  <wb-activity title="Persons"
               itemText="group"
               itemCssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```

The following snippet illustrates how to open the component as a view.

```html
<wb-workbench>
  <wb-activity title="Persons"
               itemText="group"
               cssClass="material-icons"
               itemCssClass="persons"
               target="view">
  </wb-activity>
</wb-workbench>
```


[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md