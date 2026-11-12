// しずかな時間: 一度開けば電波がなくても起動できるよう、必要なファイルを端末に保存する
const CACHE = 'shizuka-v4';
const FILES = ['./', 'index.html', 'manifest.json', 'bg-1.jpg', 'bg-2.jpg', 'bg-3.jpg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && !k.startsWith('shizuka-audio')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 音声は画面側で保存と再生を受け持つので、ここでは触らない
  if (e.request.url.split('#')[0].endsWith('.mp3')) return;
  // まず通信して新しい版を取り、だめなら保存済みのものを使う
  e.respondWith(fetch(e.request).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
