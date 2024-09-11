# [18.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.5...18.0.0-beta.6) (2024-09-11)


### Bug Fixes

* **workbench/messagebox:** display message if opened from a `CanClose` guard of a microfrontend view ([b0829b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b0829b31bd78e672ee90e37abc9ad735e46e9bd2)), closes [#591](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/591)
* **workbench/view:** restore scroll position when switching views ([9265951](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/92659517c830e36d4d819743cac4f24229e92486)), closes [#588](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/588)
* **workbench:** disable change detection during navigation to prevent inconsistent layout rendering ([68ecca7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/68ecca76b421e23ff8fffcd3cf0b5ca573b4a852))


### Features

* **workbench/popup:** support returning result on focus loss ([ce5089e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce5089e57ba48f53f17fede4ffe4fa72cf74a01b))
* **workbench/view:** enable translation of built-in context menu ([9bfdf74](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9bfdf7497ab8557b060e88cdb2bb87b7de5a5e10))


### BREAKING CHANGES

* **workbench/popup:** The method `closeWithError` has been removed from the `Popup` handle. Instead, pass an `Error` object to the `close` method.

**Before migration:**
```ts
import {inject} from '@angular/core';
import {Popup} from '@scion/workbench';

inject(Popup).closeWithError('some error');
```

**After migration:**
```ts
import {inject} from '@angular/core';
import {Popup} from '@scion/workbench';

inject(Popup).close(new Error('some error'));
```



