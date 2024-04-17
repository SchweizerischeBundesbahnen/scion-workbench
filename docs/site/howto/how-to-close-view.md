<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to close a view

A view can be closed via the view's handle `WorkbenchView`, the `WorkbenchService`, or the `WorkbenchRouter`.

#### Closing a view using its handle
Inject `WorkbenchView` handle and invoke the `close` method.

```ts
import {inject} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';

inject(WorkbenchView).close();
```

#### Closing view(s) using the `WorkbenchService`
Inject `WorkbenchService` and invoke `closeViews`, passing the ids of the views to close.


```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).closeViews('view.1', 'view.2');
```

#### Closing view(s) via `WorkbenchRouter`

The router supports for closing views matching the routing commands by setting `close` in navigation extras.

Matrix parameters do not affect view resolution. The path supports the asterisk wildcard segment (`*`) to match views with any value in a segment. To close a specific view, set a view target instead of a path.

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(['path/*/view'], {close: true});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
