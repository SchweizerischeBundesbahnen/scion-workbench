<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Activity

#### How to set an icon for an activity

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

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
