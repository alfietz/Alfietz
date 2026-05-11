import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'splash', component: () => import('../components/layout/Splash.vue') },
  { path: '/login', name: 'login', component: () => import('../components/auth/Login.vue') },
  { path: '/signup', name: 'signup', component: () => import('../components/auth/SignUp.vue') },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../components/auth/ForgotPassword.vue') },
  { path: '/verify-code', name: 'verify-code', component: () => import('../components/auth/VerifyCode.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('../components/auth/ResetPassword.vue') },
  { path: '/home', name: 'home', component: () => import('../components/shop/Home.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('../components/profile/FavoritesList.vue') },
  { path: '/profile', name: 'profile', component: () => import('../components/profile/Profile.vue') },
  { path: '/product', name: 'product-details', component: () => import('../components/shop/ProductDetails.vue') },
  { path: '/explore', name: 'explore', component: () => import('../components/shop/ExploreMore.vue') },
  { path: '/category-list', name: 'category-list', component: () => import('../components/shop/CategoryList.vue') },
  { path: '/tailor-details', name: 'tailor-details', component: () => import('../components/shop/TailorDetails.vue') },
  { path: '/upload-work', name: 'upload-work', component: () => import('../components/shop/UploadWork.vue') },
  { path: '/search', name: 'search', component: () => import('../components/shop/SearchPage.vue') },
  { path: '/search-results', name: 'search-results', component: () => import('../components/shop/SearchResults.vue') },
  { path: '/notifications', name: 'notifications', component: () => import('../components/profile/Notifications.vue') },
  { path: '/reviews', name: 'reviews', component: () => import('../components/communication/ReviewsList.vue') },
  { path: '/write-review', name: 'write-review', component: () => import('../components/communication/WriteReview.vue') },
  { path: '/edit-profile', name: 'edit-profile', component: () => import('../components/profile/EditProfile.vue') },
  { path: '/settings', name: 'settings', component: () => import('../components/profile/Settings.vue') },
  { path: '/tailor-console', name: 'tailor-console', component: () => import('../components/profile/TailorConsole.vue') },
  { path: '/orders', name: 'orders', component: () => import('../components/profile/Orders.vue') },
  { path: '/help', name: 'help', component: () => import('../components/communication/Help.vue') },
  { path: '/privacy', name: 'privacy', component: () => import('../components/legal/PrivacyPolicy.vue') },
  { path: '/terms', name: 'terms', component: () => import('../components/legal/TermsConditions.vue') },
  { path: '/about', name: 'about', component: () => import('../components/legal/AboutUs.vue') },
  { path: '/feedback', name: 'feedback', component: () => import('../components/communication/Feedback.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
