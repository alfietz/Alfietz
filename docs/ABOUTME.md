# ABOUTME - Alfietz (African Heritage Crafts Marketplace)

## 🌟 Abstract
Alfietz is a sophisticated, responsive marketplace application built with **Vue 3** and **Vite**, dedicated to promoting and facilitating the trade of **African heritage crafts**. It bridges the gap between skilled artisans (Suppliers/Tailors) and enthusiasts (Buyers), providing a seamless platform for discovery, interaction, and commerce. The app leverages a modern tech stack, including **libSQL (Turso)** for client-side data persistence and **Vue Router** for fluid navigation, all wrapped in a theme-aware, mobile-first design that blends traditional motifs with a modern "tech vibe."

---

## 🏆 Achievements
Since its inception, Alfietz has successfully transitioned from a prototype to a feature-rich application:
*   **Complete Navigation Flow**: Over 25 dedicated screens covering the entire user journey.
*   **Multi-Role Architecture**: Dynamic interface switching for **Buyers** and **Tailors**.
*   **Database Integration**: Real-time interaction with Turso libSQL for products, users, and orders.
*   **Modern Routing**: Fully migrated to `vue-router` with lazy-loading, smooth scroll behavior, and contextual pre-fetching.
*   **Theme Engine**: Robust light/dark mode support synchronized across `localStorage` and the database.
*   **Localized Reach**: Native support for **English (en)** and **Swahili (sw)**, respecting its primary target audience.
*   **WhatsApp Commerce**: Integrated direct-to-artisan communication with automated message pre-filling and number normalization (e.g., +255 for TZ).

---

## 💪 Strengths
*   **Performance**: Uses Vite for lightning-fast HMR and Vue 3's Composition API for efficient reactivity.
*   **Centralized State Management**: Employs a **"Centralized Ref Pattern"** in `App.vue`, ensuring a single source of truth for global data (User, Theme, Language) passed down via props for maximum predictability.
*   **Branding & UX**: Consistent "Heritage" and "Tribe" motif used throughout UI feedback (e.g., *"Authenticating with the Tribe"*, *"Weaving your work into the heritage"*).
*   **Flexible Data Modeling**: Uses libSQL JSON columns (`variants_json`, `gallery_json`) to handle complex product attributes like colors, sizes, and image galleries within a structured SQL environment.
*   **Theming**: Seamless transitions between light and dark modes based on user preference or profile settings.

---

## ⚠️ Weaknesses (Roadmap for Improvement)
*   **Context Fragmentation (The "WhatsApp Bridge")**: The reliance on external WhatsApp redirects for transactions creates a disjointed user journey.
    *   *Roadmap:* Implement an in-app **"Heritage Chat"** system for negotiations and integrated payment gateways.
*   **UX Friction (Alert-based Feedback)**: The use of native `window.alert()` for feedback is disruptive and non-idiomatic.
    *   *Roadmap:* Replace with a custom **Toast/Snackbar notification system** that aligns with the app's aesthetic.
*   **Data Fragility**: Heavy reliance on `localStorage` for state persistence (favorites, theme, partial user data) is insecure and easily lost.
    *   *Roadmap:* Transition to a full **Server-Side State** model where all user preferences are synced to the Turso database upon every change.
*   **Accessibility (a11y)**: Icon-only buttons lack ARIA labels, and some color contrasts fail WCAG 2.1 standards.
    *   *Roadmap:* Conduct a full **a11y audit** and implement semantic HTML across all templates.
*   **Desktop Responsiveness**: Horizontal scroll containers are optimized for touch but difficult to navigate with a mouse.
    *   *Roadmap:* Add **explicit navigation arrows** for desktop users and improve layout utilization on wide screens.
*   **State Scalability**: The "Centralized Ref" pattern in `App.vue` is becoming a bottleneck as the component tree grows.
    *   *Roadmap:* Migrate global state to **Pinia** for better modularity and developer experience.
*   **Offline Resilience**: Current "Offline Support" is limited to local cache.
    *   *Roadmap:* Transform the app into a full **PWA (Progressive Web App)** with Service Workers for unstable heritage-site connectivity.

---

## 📂 Component Architecture & Functionality

### 1. 🏗️ Layout Components (`src/components/layout/`)
*   **`AppBar.vue`**: Branding and contextual action bar.
*   **`NavigationBar.vue`**: Bottom navigation for core mobile sections (Home, Search, Profile).
*   **`Splash.vue`**: Entry screen that initializes data and handles auto-login redirects.
*   **`SectionHeader.vue`**: Reusable header for individual content sections.

### 2. 🔐 Auth Components (`src/components/auth/`)
*   **`Login.vue` / `SignUp.vue`**: Traditional entry points with role-based registration (Buyer vs Tailor).
*   **`VerifyCode.vue` / `ResetPassword.vue`**: Secure flows for account recovery.

### 3. 🛍️ Shop Components (`src/components/shop/`)
*   **`Home.vue`**: Landing page featuring trending "Trends" and top "Tailors."
*   **`ProductDetails.vue`**: A high-complexity component managing variants, color selection, image galleries, and WhatsApp negotiation logic.
*   **`UploadWork.vue`**: A comprehensive form for Suppliers to list products, handling image metadata and JSON-structured variants.
*   **`SearchPage.vue` / `SearchResults.vue`**: Dynamic filtering of the heritage catalog.

### 4. 👤 Profile Components (`src/components/profile/`)
*   **`Profile.vue`**: Overview of "My Heritage," stats, and role-specific actions.
*   **`TailorConsole.vue`**: Specialized dashboard for artisans to manage their "Uploaded Trends" and sales.
*   **`FavoritesList.vue`**: A curated collection of "liked" heritage items.

### 5. 💬 Communication & ⚖️ Legal
*   **`ReviewsList.vue` / `WriteReview.vue`**: Trust-building through peer feedback.
*   **`Help.vue` / `Feedback.vue`**: Support and community engagement channels.
*   **`PrivacyPolicy.vue` / `TermsConditions.vue`**: Core compliance documents, including specific clauses for REBi Group's liability limitation.
*   **`ReturnPolicy.vue`**: Differentiates between custom-made and ready-to-wear heritage items.
*   **`CommunityGuidelines.vue`**: Establishing "The Tribe" code of conduct.
*   **`SafetyTips.vue` / `MeasurementGuide.vue` / `IPPolicy.vue`**: Additional resources protecting users and artisans.
*   **`AboutUs.vue`**: Transparency and mission overview.

---

## 🗺️ App Sitemap & Routes

The application follows a logical flow from onboarding to core marketplace interactions.

### 📊 Navigation Flow
```mermaid
graph TD
    Splash[/Splash/] --> Login[Login]
    Splash --> Home[Home]
    
    subgraph Auth_Flow [Authentication]
        Login --> SignUp[Sign Up]
        Login --> ForgotPassword[Forgot Password]
        ForgotPassword --> VerifyCode[Verify Code]
        VerifyCode --> ResetPassword[Reset Password]
    end
    
    subgraph Shop_Flow [Marketplace]
        Home --> CategoryList[Category List]
        Home --> ProductDetails[Product Details]
        Home --> TailorDetails[Tailor Details]
        Search[Search] --> SearchResults[Search Results]
        CategoryList --> Explore[Explore]
    end
    
    subgraph Profile_Flow [User Management]
        ProfileView[Profile] --> EditProfile[Edit Profile]
        ProfileView --> Favorites[Favorites]
        ProfileView --> Notifications[Notifications]
        ProfileView --> Settings[Settings]
        ProfileView --> Orders[Orders]
        ProfileView --> TailorConsole[Tailor Console]
        TailorConsole --> UploadWork[Upload Work]
    end
    
    subgraph Support_Legal [Support & Legal]
        Settings --> Help[Help]
        Settings --> About[About Us]
        Settings --> Privacy[Privacy Policy]
        Settings --> Terms[Terms & Conditions]
        Help --> Feedback[Feedback]
        Help --> Stories[Heritage Stories]
        Help --> Safety[Safety Tips]
        Help --> Measurements[Measurement Guide]
    end

    subgraph Review_System [Engagement]
        ProductDetails --> Reviews[Reviews List]
        Reviews --> WriteReview[Write Review]
    end
    ```

    ### 🗺️ Full Application Path Chart

    The application follows an SEO-optimized routing structure to ensure all heritage content and legal documents are indexable.

    | Category | Path / Entry Point | Type | Description |
    | :--- | :--- | :--- | :--- |
    | **Entry** | `/` | Route | Initial splash & data hydration |
    | **Auth Flow** | `/login` ↔ `/signup` | Route | User authentication & role selection |
    | **Marketplace** | `/home` | Route | Main dashboard with Trends & Tailors |
    | **Product** | `/product/:id` | Route | Detail view with WhatsApp negotiation |
    | **Legal** | `/legal/privacy` | Route | Privacy Policy (SEO-indexed) |
    | **Legal** | `/legal/terms` | Route | Terms & Conditions (SEO-indexed) |
    | **Legal** | `/legal/about` | Route | Mission & Heritage Overview |
    | **Legal** | `/legal/safety` | Route | Safety & Security Resources |
    | **Legal** | `/legal/returns` | Route | Return & Refund Policy |
    | **Legal** | `/legal/guidelines`| Route | Community Standards |
    | **Legal** | `/legal/measurements`| Route | Sizing & Measurement Guide |
    | **Legal** | `/legal/ip-policy` | Route | Intellectual Property Policy |
    | **Support** | `/help` | Route | Hub for support & legal portal |
    | **Support** | `/feedback` | Route | User feedback channel |
    | **Support** | `/stories` | Route | Heritage Stories & Blogs |
    | **Discovery** | `/explore/:category?` | Route | Filtered marketplace view |
    | **Search** | `/search` → `/search-results` | Sequence | Query interface and result rendering |
    | **Artisan** | `/tailor/:id` | Route | Public tailor profile & portfolio |
    | **Management** | `/tailor-console` | Route | Private artisan dashboard |
    | **Profile** | `/profile` ↔ `/edit-profile` | Route | User heritage management |
    | **Commerce** | `External (WhatsApp)` | Integration | Direct-to-artisan negotiation channel |

    ---

    ## 🗄️ Data & State Layer*   **Database**: **Turso (libSQL)**. Initialized in `src/db/client.js`. Critical for persisting "Heritage" items, user profiles, and favorites.
*   **Persistence**: Handled via `localStorage` with a prefix-based system (`alfie_app_`) to avoid collisions.
*   **i18n**: Managed via `src/translations.js`, supporting English and Swahili with a global `t()` helper function.

---
*Last Updated: May 13, 2026*
