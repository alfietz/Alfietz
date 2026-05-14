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
  { path: '/product/:id', name: 'product-details', component: () => import('../components/shop/ProductDetails.vue') },
  { path: '/explore/:category?', name: 'explore', component: () => import('../components/shop/ExploreMore.vue') },
  { path: '/category-list', name: 'category-list', component: () => import('../components/shop/CategoryList.vue') },
  { path: '/tailor/:id', name: 'tailor-details', component: () => import('../components/shop/TailorDetails.vue') },
  { path: '/upload-work', name: 'upload-work', component: () => import('../components/shop/UploadWork.vue') },
  { path: '/search', name: 'search', component: () => import('../components/shop/SearchPage.vue') },
  { path: '/search-results', name: 'search-results', component: () => import('../components/shop/SearchResults.vue') },
  { path: '/notifications', name: 'notifications', component: () => import('../components/profile/Notifications.vue') },
  { path: '/reviews', name: 'reviews', component: () => import('../components/communication/ReviewsList.vue') },
  { path: '/app-review', name: 'app-review', component: () => import('../components/profile/AppReview.vue') },
  { path: '/write-review', name: 'write-review', component: () => import('../components/communication/WriteReview.vue') },
  { path: '/edit-profile', name: 'edit-profile', component: () => import('../components/profile/EditProfile.vue') },
  { path: '/settings', name: 'settings', component: () => import('../components/profile/Settings.vue') },
  { path: '/tailor-console', name: 'tailor-console', component: () => import('../components/profile/TailorConsole.vue') },
  { path: '/orders', name: 'orders', component: () => import('../components/profile/Orders.vue') },
  { path: '/help', name: 'help', component: () => import('../components/communication/Help.vue') },
  { path: '/feedback', name: 'feedback', component: () => import('../components/communication/Feedback.vue') },
  { path: '/stories', name: 'stories', component: () => import('../components/communication/HeritageStories.vue') },
  { path: '/chats', name: 'chats', component: () => import('../components/communication/ChatList.vue') },
  { path: '/chat/:userId', name: 'chat-detail', component: () => import('../components/communication/ChatDetail.vue') },
  { path: '/legal/privacy', name: 'privacy', component: () => import('../components/legal/PrivacyPolicy.vue') },
  { path: '/legal/terms', name: 'terms', component: () => import('../components/legal/TermsConditions.vue') },
  { path: '/legal/about', name: 'about', component: () => import('../components/legal/AboutUs.vue') },
  { path: '/legal/returns', name: 'returns', component: () => import('../components/legal/ReturnPolicy.vue') },
  { path: '/legal/guidelines', name: 'guidelines', component: () => import('../components/legal/CommunityGuidelines.vue') },
  { path: '/legal/safety', name: 'safety', component: () => import('../components/legal/SafetyTips.vue') },
  { path: '/legal/measurements', name: 'measurements', component: () => import('../components/legal/MeasurementGuide.vue') },
  { path: '/legal/ip-policy', name: 'ip-policy', component: () => import('../components/legal/IPPolicy.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const STORAGE_KEY_PREFIX = 'alfie_app_'
  const storedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'user_data')
  let userData = { id: 'guest' }
  
  if (storedUser) {
    try {
      userData = JSON.parse(storedUser)
    } catch (e) {
      console.error('Failed to parse user data from storage', e)
    }
  }

  const isGuest = userData.id === 'guest'
  
  // Routes that require authentication
  const authRoutes = [
    'profile', 'chats', 'chat-detail', 'edit-profile', 
    'settings', 'tailor-console', 'orders', 'upload-work',
    'notifications', 'write-review', 'app-review'
  ]

  if (authRoutes.includes(to.name) && isGuest) {
    next({ name: 'login' })
  } else if (['login', 'signup', 'splash'].includes(to.name) && !isGuest) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
