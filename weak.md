# UI/UX Weak Areas - Alfietz Project

Based on the code review conducted on May 11, 2026, the following areas have been identified as "weak" or needing improvement to reach production-grade standards.

## 1. Accessibility (a11y) - Grade: 4/10
This is the most critical area for improvement. The current implementation is difficult for users with screen readers or those relying on keyboard navigation.

*   **Issue:** Icon-only buttons (like the Heart button in `ProductCard.vue` or Search icons) lack descriptive labels.
    *   *Recommendation:* Add `aria-label="Like product"` or `aria-label="Search"` to all icon buttons.
*   **Issue:** Lack of semantic landmarks. While some sections use `<section>`, many important parts of the app are just generic `<div>` tags.
    *   *Recommendation:* Use `<nav>` for navigation bars, `<main>` for the primary content area in `App.vue`, and `<footer>` for bottom navigation.
*   **Issue:** Image ALT text. Most images in `ProductCard.vue` are background images, which are invisible to screen readers.
    *   *Recommendation:* If an image conveys information (like the product itself), use an `<img>` tag with a descriptive `alt` attribute instead of `background-image`.

## 2. Desktop UX: Horizontal Scrolling - Grade: 7.5/10
While the app looks great on mobile, the desktop experience suffers in the horizontal lists.

*   **Issue:** Hidden scrollbars (`scrollbar-width: none`) in `.scroll-container` make navigation difficult for desktop users who don't have touchpads.
    *   *Recommendation:* 
        *   Implement left/right navigation arrows that appear on hover for desktop screens.
        *   Alternatively, use `overflow-x: auto` but only hide the scrollbar for mobile devices using media queries.

## 3. Architecture: Scalability - Grade: 8/10
The current state management for navigation is manual, which will become brittle as the app grows.

*   **Issue:** Manual routing via `currentScreen` in `App.vue` and manual `history.pushState` handling.
    *   *Recommendation:* Integrate `vue-router`. This will handle "back" button behavior, deep linking (sharing a specific product URL), and scroll position restoration automatically.
*   **Issue:** Component Bloat in `App.vue`. `App.vue` is currently importing every single component in the project (~30 imports), which increases the initial load time.
    *   *Recommendation:* Use Vue's `defineAsyncComponent` or `vue-router` lazy loading to only load the components the user is actually looking at.

## 4. Color Contrast
*   **Issue:** Some text combinations might be low contrast (e.g., `--text-light: #A1887F` on `--bg-white: #F9F3EE`).
    *   *Recommendation:* Run the app through a WCAG contrast checker to ensure all text meets the 4.5:1 ratio requirement for readability.
