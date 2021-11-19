const version = '20211119134556';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/%E8%AA%AA%E6%98%8E%E6%9C%83/2021/06/06/2021intro-taiwan/","/%E8%AA%AA%E6%98%8E%E6%9C%83/2020/03/08/2021intro/","/%E8%AA%AA%E6%98%8E%E6%9C%83/2020/02/22/2020intro/","/%E8%AA%AA%E6%98%8E%E6%9C%83/2018/04/01/2018intro/","/%E8%AA%AA%E6%98%8E%E6%9C%83/2017/04/01/2017intro/","/%E8%AA%AA%E6%98%8E%E6%9C%83/2016/04/01/2016intro/","/about/","/categories/","/contact/","/js/mermaid/docs/content/demos/","/js/mermaid/docs/content/development/","/events/","/js/mermaid/docs/content/flowchart/","/js/mermaid/docs/content/gantt/","/news/","/js/mermaid/docs/content/","/","/links/","/manifest.json","/js/mermaid/docs/content/mermaidCLI/","/assets/search.json","/js/mermaid/docs/content/sequenceDiagram/","/js/mermaid/docs/content/upgrading/","/js/mermaid/docs/content/usage/","/redirects.json","/sitemap.xml","/robots.txt","/feed.xml","/img/harvardicon.png", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
