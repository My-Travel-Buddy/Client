# My Travel Buddy responsive authentication backgrounds

This pack contains the same ten travel themes in two aspect ratios:

- `desktop-webp/`: wide 1672 × 941 images for laptops and desktop screens.
- `mobile-webp/`: portrait 1024 × 1536 images for phones and narrow screens.
- `desktop-original-png/` and `mobile-original-png/`: full-quality source files.

Use the WebP folders in the application. They load faster than the PNG sources.

## Recommended CSS

```css
.auth-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

Use a desktop image by default, then switch to the matching mobile image below
700px. Keeping identical filenames in both WebP folders makes the switch easy.

```css
@media (max-width: 700px) {
  .auth-page {
    background-position: center;
  }
}
```

The images deliberately leave calmer space near the center and upper-middle so
the white login or sign-up card remains readable. A dark translucent overlay may
still be applied by the page, as in the current design.
