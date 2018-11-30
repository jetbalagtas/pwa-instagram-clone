/* eslint-disable quotes */
/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "83bd00e8352c68fdd86bf4fcb882cf56"
  },
  {
    "url": "manifest.json",
    "revision": "2d81e90280825b2c424e0b5f97868275"
  },
  {
    "url": "offline.html",
    "revision": "f4d0ab34874f4dacd8bd04cb91bf2159"
  },
  {
    "url": "src/css/app.css",
    "revision": "59d917c544c1928dd9a9e1099b0abd71"
  },
  {
    "url": "src/css/feed.css",
    "revision": "c42a64cda5cc2a9756300296f70068a0"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "ea798032aefb4f148ebbb1f23f5e9041"
  },
  {
    "url": "src/js/feed.js",
    "revision": "736c44590cbb4462f9768f7620382402"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "28d0b3f7194cb2f8c8258e8defb31349"
  },
  {
    "url": "src/js/idb.js",
    "revision": "044976e13e918fd8d4d74364bd92f861"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "004d53512554ecef425a7a02d4c528d6"
  },
  {
    "url": "src/js/utility.js",
    "revision": "aba87d974483e024ef3f05ab4cc5f471"
  },
  {
    "url": "sw.js",
    "revision": "05f2b12306f0fa28627758b1b164e362"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
