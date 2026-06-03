Visual Design Findings (app.json)
I've checked your configuration, and here is how the "design" of your notifications is set up:

- Primary Color: You haven't explicitly set a notification.color in app.json, so it will use the default system color (likely the blue from your brand).
- Deep Linking (Tapping the notification): This is perfectly set up! Your scheme is dandelionz. This means if the
  backend sends dandelionz://receipt/123, the app will automatically open and show the receipt for that order.
- Web Alignment: You have intentFilters for dandelionz.com.ng. This means if a user clicks a link in their email or a web notification, Android will ask: "Do you want to open this in the Dandelionz App?"

Recommendation for "The Icon"
On Android, the notification icon must be different from your regular app icon.

- Regular Icon: Full color, rounded square.
- Notification Icon: Pure white silhouette on a transparent background.
  If you use your regular app icon for notifications, Android will often just show a solid white square because it
  forces all non-transparent pixels to white.

Advice for you:
Tell your designer to create a "Monochrome Notification Icon" (PNG, transparent background, white shapes only). You
should then add it to app.json under expo.notification.icon.
" (PNG, transparent background, white shapes only). You
  should then add it to app.json under expo.notification.icon.
