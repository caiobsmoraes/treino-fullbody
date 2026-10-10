/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d76fdb6b52ddd11670cd70caafa08db8"
  }, {
    "url": "pwa-512x512.png",
    "revision": "3130c03dcd427f6cebc7bc0b34148a8b"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9f922593b02d63394fd638ce82552efa"
  }, {
    "url": "index.html",
    "revision": "6f50b0b07288e25ffd1823df7c70c181"
  }, {
    "url": "icon.svg",
    "revision": "6a1fe99c6adaa1ae5212e5c0d447b099"
  }, {
    "url": "favicon.ico",
    "revision": "ba526fb8e3a29b6039f93d69ebf309f3"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "4da76257cc9ba027629e34137f4adb6a"
  }, {
    "url": "assets/index-C8z4fqWk.js",
    "revision": null
  }, {
    "url": "assets/index-BXqd5mnC.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "4da76257cc9ba027629e34137f4adb6a"
  }, {
    "url": "favicon.ico",
    "revision": "ba526fb8e3a29b6039f93d69ebf309f3"
  }, {
    "url": "icon.svg",
    "revision": "6a1fe99c6adaa1ae5212e5c0d447b099"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9f922593b02d63394fd638ce82552efa"
  }, {
    "url": "pwa-512x512.png",
    "revision": "3130c03dcd427f6cebc7bc0b34148a8b"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d76fdb6b52ddd11670cd70caafa08db8"
  }, {
    "url": "manifest.webmanifest",
    "revision": "f11f3e8f50b79b27ff3ae75bb3162272"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
