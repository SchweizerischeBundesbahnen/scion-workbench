![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to set an icon for an activity

The easiest way to set an icon for an activity is by using an icon font. In `<wb-activity>` element, you can specify a label and one or more CSS classes.

For Material icons, specify 'material-icons' as CSS class and the ligature as label, which renders the icon glyph by using its textual name.

```html
<wb-workbench>
  <wb-activity title="Persons"
               itemText="group"
               itemCssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```

For Font Awesome Icons, simply specify the CSS class(es) and leave 'label' empty.

```html
<wb-activity title="Persons"
             itemCssClass="fas fa-users"
             routerLink="persons">
</wb-activity>
```

As a prerequisite, include the icon font in your application, e.g. in `index.html` as following:

```html
<!-- Material Icon Font -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<!-- Font Awesome Icon Font -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md