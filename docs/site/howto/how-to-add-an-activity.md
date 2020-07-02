<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Activity

#### How to add an activity

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

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
