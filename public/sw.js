self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url || '/'
            },
            ...data.options
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If so, just focus it.
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// A simple fetch handler for basic PWA compliance
self.addEventListener('fetch', function (event) {
    // Can be expanded later for offline caching. For now, Network First.
});
