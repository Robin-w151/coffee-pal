/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

const wbManifest = self.__WB_MANIFEST;

if (wbManifest) {
  precacheAndRoute(wbManifest);
}
