# [1.0.0-beta.26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.25...workbench-client-1.0.0-beta.26) (2024-09-11)


### Features

* **workbench-client/popup:** support returning result on focus loss ([ce5089e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce5089e57ba48f53f17fede4ffe4fa72cf74a01b))


### BREAKING CHANGES

* **workbench-client/popup:** The method `closeWithError` has been removed from the `WorkbenchPopup` handle. Instead, pass an `Error` object to the `close` method.

**Before migration:**
```ts
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchPopup} from '@scion/workbench-client';

Beans.get(WorkbenchPopup).closeWithError('some error');
```

**After migration:**
```ts
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchPopup} from '@scion/workbench-client';

Beans.get(WorkbenchPopup).close(new Error('some error'));
```



