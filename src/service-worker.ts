/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

if (self.__WB_MANIFEST) {
  precacheAndRoute(self.__WB_MANIFEST);
}
