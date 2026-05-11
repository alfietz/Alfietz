<!-------- (App.vue) ./src/App.vue ------------>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { db } from './db/client'

// ==========================================
// 1. IMPORT ALL COMPONENTS
// ==========================================
import NavigationBar from './components/layout/NavigationBar.vue'
import WebHeader from './components/layout/WebHeader.vue'
import LoadingSpinner from './components/layout/LoadingSpinner.vue'

// Intro & Auth
import Splash from './components/layout/Splash.vue'
import Login from './components/auth/Login.vue'
import SignUp from './components/auth/SignUp.vue'
import ForgotPassword from './components/auth/ForgotPassword.vue'
import VerifyCode from './components/auth/VerifyCode.vue'
import ResetPassword from './components/auth/ResetPassword.vue'

// Main Tabs
import Home from './components/shop/Home.vue'
import FavoritesList from './components/profile/FavoritesList.vue'
import Profile from './components/profile/Profile.vue'

// Sub-pages (Shop/Explore)
import ProductDetails from './components/shop/ProductDetails.vue'
import ExploreMore from './components/shop/ExploreMore.vue'
import Notifications from './components/profile/Notifications.vue'
import SearchPage from './components/shop/SearchPage.vue'
import SearchResults from './components/shop/SearchResults.vue'
import CategoryList from './components/shop/CategoryList.vue'
import TailorDetails from './components/shop/TailorDetails.vue'
import UploadWork from './components/shop/UploadWork.vue'

// Sub-pages (Reviews)
import ReviewsList from './components/communication/ReviewsList.vue'
import WriteReview from './components/communication/WriteReview.vue'

// Sub-pages (Profile & Settings)
import EditProfile from './components/profile/EditProfile.vue'
import Settings from './components/profile/Settings.vue'
import TailorConsole from './components/profile/TailorConsole.vue'
import Orders from './components/profile/Orders.vue'
import Help from './components/communication/Help.vue'
import PrivacyPolicy from './components/legal/PrivacyPolicy.vue'
import TermsConditions from './components/legal/TermsConditions.vue'
import AboutUs from './components/legal/AboutUs.vue'
import Feedback from './components/communication/Feedback.vue'

// i18n
import { translations } from './translations'

// ==========================================
// 2. STATE MANAGEMENT & PERSISTENCE
// ==========================================
const STORAGE_KEY_PREFIX = 'alfie_app_'

// Helper to get from localStorage
const getStored = (key, defaultValue) => {
  const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key)
  if (stored === null) return defaultValue
  try {
    return JSON.parse(stored)
  } catch (e) {
    return stored
  }
}

// Helper to set to localStorage
const setStored = (key, value) => {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value))
}

const currentLanguage = ref(getStored('language', 'en')) 
const currentScreen = ref(getStored('screen', 'splash')) 
const theme = ref(getStored('theme', 'light'))

const isGlobalLoading = ref(false)
const loadingMessage = ref('')

// Translation helper
const t = (key) => {
  const lang = currentLanguage.value || 'en'
  return translations[lang][key] || key
}
const favoriteItems = ref(getStored('favorites', []))
const userData = ref(getStored('user_data', {
  id: 'guest',
  username: 'johnabram',
  firstName: 'John',
  lastName: 'Abram',
  email: 'johnabram@gmail.com',
  whatsapp: '+255700000000',
  avatar: 'https://i.pravatar.cc/150?u=johnabram',
  userType: 'buyer',
  needs: '',
  gives: '',
  theme: 'light'
}))

const categories = ref([])
const trendingProducts = ref([])
const trendingSellers = ref([])
const allProducts = ref([])
const exploreItems = ref([])
const productReviews = ref([])
const searchResults = ref([])
const userNotifications = ref([])
const userProductCount = ref(0)

const selectedSeller = ref(getStored('selected_seller', null))
const selectedCategory = ref(getStored('selected_category', 'Explore more'))
const selectedProduct = ref(getStored('selected_product', null))

const filteredExploreItems = computed(() => {
  if (selectedCategory.value === 'Explore more' || selectedCategory.value === 'Trending Trends') {
    return allProducts.value
  }
  return allProducts.value.filter(p => {
    const cat = categories.value.find(c => c.id === p.category_id)
    return cat && cat.name === selectedCategory.value
  })
})

// Fetching Logic
const fetchInitialData = async () => {
  try {
    // 1. Sync User Profile & Theme
    if (userData.value.id !== 'guest') {
      const userRes = await db.execute({
        sql: "SELECT * FROM users WHERE id = ?",
        args: [userData.value.id]
      })
      if (userRes.rows.length > 0) {
        const u = userRes.rows[0]
        userData.value = {
          id: u.id,
          username: u.username,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          whatsapp: u.whatsapp,
          avatar: u.avatar,
          userType: u.user_type,
          needs: u.needs || '',
          gives: u.gives || '',
          theme: u.theme || 'light'
        }
        theme.value = u.theme || 'light'
      }
    }

    // 2. Fetch Notifications
    const notifRes = await db.execute({
      sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      args: [userData.value.id]
    })
    userNotifications.value = notifRes.rows.map(n => ({ id: n.id, name: n.message, time: 'Just now', unread: !!n.is_unread }))

    // 3. Fetch Favorites
    const favRes = await db.execute({
      sql: "SELECT product_id FROM favorites WHERE user_id = ?",
      args: [userData.value.id]
    })
    const favoriteIds = favRes.rows.map(f => f.product_id)

    // 4. Fetch User Stats (Uploaded Trends)
    const statsRes = await db.execute({
      sql: "SELECT COUNT(*) as total FROM products WHERE owner_id = ?",
      args: [userData.value.id]
    })
    userProductCount.value = statsRes.rows[0].total

    const cats = await db.execute("SELECT * FROM categories")
    categories.value = cats.rows

    const products = await db.execute("SELECT * FROM products ORDER BY likes_count DESC")
    allProducts.value = products.rows.map(p => ({ ...p, liked: favoriteIds.includes(p.id) }))
    favoriteItems.value = allProducts.value.filter(p => p.liked)
    
    // Trending = Top Liked
    trendingProducts.value = allProducts.value.slice(0, 4)
    
    // Explore More = Random or other products
    exploreItems.value = [...allProducts.value].sort(() => 0.5 - Math.random()).slice(0, 6)

    const sellers = await db.execute("SELECT * FROM sellers ORDER BY rating DESC, likes_count DESC, clients_count DESC")
    trendingSellers.value = sellers.rows.map(s => ({ 
      ...s, 
      isVerified: !!s.is_verified,
      likesCount: s.likes_count,
      clientsCount: s.clients_count
    }))
  } catch (e) {
    console.error("Database fetch error:", e)
  }
}

onMounted(() => {
  fetchInitialData()

  // Auto-redirect if already logged in
  if (userData.value.id !== 'guest') {
    if (['splash', 'login', 'signup'].includes(currentScreen.value)) {
      currentScreen.value = 'home'
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.screen) {
      currentScreen.value = event.state.screen
      if (event.state.selectedProduct) selectedProduct.value = event.state.selectedProduct
      if (event.state.selectedSeller) selectedSeller.value = event.state.selectedSeller
      if (event.state.selectedCategory) selectedCategory.value = event.state.selectedCategory
    }
  })

  // Initialize first history state
  if (!history.state) {
    history.replaceState({
      screen: currentScreen.value,
      selectedProduct: selectedProduct.value,
      selectedSeller: selectedSeller.value,
      selectedCategory: selectedCategory.value
    }, '', '')
  }
})

// Auto-save watchers
watch(currentScreen, (val) => setStored('screen', val))
watch(currentLanguage, (val) => setStored('language', val))
watch(theme, async (val) => {
  setStored('theme', val)
  // Apply theme to body
  document.body.classList.remove('light-theme', 'dark-theme')
  document.body.classList.add(val + '-theme')
  
  if (userData.value.id !== 'guest') {
    try {
      await db.execute({
        sql: "UPDATE users SET theme = ? WHERE id = ?",
        args: [val, userData.value.id]
      })
    } catch (e) {
      console.error("Theme sync error:", e)
    }
  }
}, { immediate: true })
watch(favoriteItems, (val) => setStored('favorites', val), { deep: true })
watch(userData, (val) => setStored('user_data', val), { deep: true })
watch(selectedSeller, (val) => setStored('selected_seller', val), { deep: true })
watch(selectedProduct, (val) => setStored('selected_product', val), { deep: true })
watch(selectedCategory, (val) => setStored('selected_category', val))

const mockNotifications = ref([
  { id: 1, name: 'A master tailor is ready for your Maasai Beads order', time: '2 hours ago', unread: true },
  { id: 2, name: 'New Kente Royal collection just dropped!', time: '5 hours ago', unread: true },
  { id: 3, name: 'Your Ankara Infinity Dress has been shipped', time: '1 day ago', unread: false }
])

const navigateTo = async (screenName, extraState = {}) => {
  currentScreen.value = screenName
  
  // Sync additional state if provided
  if (extraState.selectedProduct) {
    selectedProduct.value = extraState.selectedProduct
    
    // Fetch real reviews for this product
    try {
      const res = await db.execute({
        sql: `
          SELECT r.*, u.first_name, u.last_name, u.avatar 
          FROM reviews r 
          JOIN users u ON r.user_id = u.id 
          WHERE r.product_id = ?
          ORDER BY r.created_at DESC
        `,
        args: [extraState.selectedProduct.id]
      })
      productReviews.value = res.rows.map(r => ({
        id: r.id,
        author: `${r.first_name} ${r.last_name}`,
        rating: r.rating,
        text: r.text,
        time: 'Recently', // You could format created_at here
        avatar: r.avatar
      }))
    } catch (e) {
      console.error("Fetch reviews error:", e)
      productReviews.value = []
    }
  }
  if (extraState.selectedSeller) selectedSeller.value = extraState.selectedSeller
  if (extraState.selectedCategory) selectedCategory.value = extraState.selectedCategory

  // Push to browser history if not already there
  const historyState = {
    screen: screenName,
    selectedProduct: selectedProduct.value,
    selectedSeller: selectedSeller.value,
    selectedCategory: selectedCategory.value
  }
  
  if (!history.state || history.state.screen !== screenName) {
    history.pushState(historyState, '', '')
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleLike = async (product) => {
  product.liked = !product.liked
  
  // Sync local state immediately
  const updateProduct = (list) => {
    const p = list.find(item => item.id === product.id)
    if (p) p.liked = product.liked
  }
  updateProduct(allProducts.value)
  updateProduct(trendingProducts.value)

  try {
    if (product.liked) {
      if (!favoriteItems.value.find(item => item.id === product.id)) {
        favoriteItems.value.push({ ...product })
        await db.execute({
          sql: "INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)",
          args: [userData.value.id, product.id]
        })
      }
    } else {
      favoriteItems.value = favoriteItems.value.filter(item => item.id !== product.id)
      await db.execute({
        sql: "DELETE FROM favorites WHERE user_id = ? AND product_id = ?",
        args: [userData.value.id, product.id]
      })
    }
  } catch (e) {
    console.error("Toggle like error:", e)
  }
}

const showNavBar = computed(() => {
  return ['home', 'favorites', 'profile', 'category-list'].includes(currentScreen.value)
})

// ==========================================
// 3. ACTION HANDLERS
// ==========================================

const handleLogin = async (data) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Authenticating with the Tribe...';
  try {
    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [data.email]
    });
    if (res.rows.length > 0) {
      const u = res.rows[0];
      userData.value = {
        id: u.id,
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        whatsapp: u.whatsapp,
        avatar: u.avatar,
        userType: u.user_type,
        needs: u.needs || '',
        gives: u.gives || '',
        theme: u.theme || 'light'
      };
      theme.value = u.theme || 'light';
      await fetchInitialData();
      navigateTo('home');
    } else {
      window.alert('User not found. Please sign up.');
    }
  } catch (e) {
    console.error('Login error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleSignUp = async (data) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Joining the heritage...';
  const newId = 'u' + Date.now();
  const signupData = { ...data, id: newId };
  try {
    await db.execute({
      sql: 'INSERT INTO users (id, username, first_name, last_name, email, whatsapp, avatar, user_type, needs, gives, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [signupData.id, signupData.username, signupData.firstName, signupData.lastName, signupData.email, signupData.whatsapp, signupData.avatar, signupData.userType, signupData.needs, signupData.gives, 'light']
    });
    userData.value = signupData;
    await fetchInitialData();
    navigateTo('home');
  } catch (e) {
    console.error('Signup DB error:', e);
    window.alert('Error signing up. Email or username might be taken.');
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleUploadWork = async (data) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Weaving your work into the heritage...';
  try {
    await db.execute({
      sql: 'INSERT INTO products (name, price, description, image, category_id, owner_id, status, variants_json, gallery_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [data.name, data.price, data.description, data.image, data.category_id, userData.value.id, data.status, data.variants_json, data.gallery_json]
    });
    window.alert('Work published successfully!');
    await fetchInitialData();
    navigateTo('profile');
  } catch (e) {
    console.error('Upload error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleFeedback = async (msg) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Sending your voice to the Tribe...';
  try {
    await db.execute({
      sql: 'INSERT INTO feedback (user_id, message) VALUES (?, ?)',
      args: [userData.value.id, msg]
    });
    window.alert('Heritage feedback received! Thank you.');
    navigateTo('settings');
  } catch (e) {
    console.error('Feedback error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleProductDelete = async (productId) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Removing heritage item...';
  try {
    // 1. Delete from favorites first (foreign key constraint might be there, but good practice anyway)
    await db.execute({
      sql: "DELETE FROM favorites WHERE product_id = ?",
      args: [productId]
    })
    
    // 2. Delete the product
    await db.execute({
      sql: "DELETE FROM products WHERE id = ? AND owner_id = ?",
      args: [productId, userData.value.id]
    })

    window.alert('Item removed successfully.')
    await fetchInitialData()
    navigateTo('home')
  } catch (e) {
    console.error('Delete product error:', e)
    window.alert('Error deleting item. Please try again.')
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleUpdateRole = async (newRole) => {
  if (userData.value.id === 'guest') return
  
  isGlobalLoading.value = true
  loadingMessage.value = 'Switching roles...'
  
  try {
    await db.execute({
      sql: 'UPDATE users SET user_type = ? WHERE id = ?',
      args: [newRole, userData.value.id]
    })
    
    userData.value.userType = newRole
    window.alert(`Role successfully switched to ${newRole === 'supplier' ? 'Tailor' : 'Buyer'}!`)
  } catch (e) {
    console.error('Role update error:', e)
    window.alert('Error switching roles. Please try again.')
  } finally {
    isGlobalLoading.value = false
  }
}

const handleLogout = () => {
  // Reset user data to guest but keep personal preferences like theme/language in storage if desired
  // Here we just reset the reactive state and update localStorage selectively
  userData.value = { 
    id: 'guest', 
    username: 'johnabram', 
    firstName: 'John', 
    lastName: 'Abram', 
    email: 'johnabram@gmail.com', 
    whatsapp: '+255700000000', 
    avatar: 'https://i.pravatar.cc/150?u=johnabram', 
    userType: 'buyer', 
    needs: '', 
    gives: '', 
    theme: 'light' 
  };
  
  // We don't call localStorage.clear() anymore to preserve language and theme settings
  setStored('user_data', userData.value);
  setStored('screen', 'login');
  setStored('favorites', []);
  
  navigateTo('login');
}

const handleSearch = async (query) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Searching the heritage...';
  try {
    const q = `%${query.toLowerCase()}%`;
    const res = await db.execute({
      sql: `
        SELECT p.*, u.username as owner_username, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.name LIKE ? 
           OR p.description LIKE ? 
           OR c.name LIKE ? 
           OR u.username LIKE ?
        ORDER BY p.likes_count DESC
      `,
      args: [q, q, q, q]
    });
    
    // Fetch favorites
    let favoriteIds = [];
    if (userData.value.id !== 'guest') {
      const favRes = await db.execute({
        sql: "SELECT product_id FROM favorites WHERE user_id = ?",
        args: [userData.value.id]
      });
      favoriteIds = favRes.rows.map(f => f.product_id);
    }
    
    searchResults.value = res.rows.map(p => ({
      ...p,
      liked: favoriteIds.includes(p.id)
    }));
    
    navigateTo('search-results');
  } catch (e) {
    console.error('Search error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleUpdateProfile = async (val) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Updating your heritage profile...';
  try {
    await db.execute({
      sql: `
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, whatsapp = ?, avatar = ?, user_type = ?, needs = ?, gives = ?
        WHERE id = ?
      `,
      args: [val.username, val.firstName, val.lastName, val.whatsapp, val.avatar, val.userType, val.needs, val.gives, val.id]
    });
    
    userData.value = { ...val };
    window.alert('Profile updated successfully!');
    await fetchInitialData();
    navigateTo('profile');
  } catch (e) {
    console.error('Update profile error:', e);
    window.alert('Failed to update profile. Username might be taken.');
  } finally {
    isGlobalLoading.value = false;
  }
}
</script>

<template>
  <div class="app-wrapper">
    
    <!-- DESKTOP HEADER (WEB MODE) -->
    <WebHeader 
      v-if="showNavBar" 
      :active-tab="currentScreen"
      :theme="theme"
      :t="t"
      @navigate="navigateTo"
      @go-notifications="navigateTo('notifications')"
      @toggle-theme="() => theme = (theme === 'light' ? 'dark' : 'light')"
    />

    <!-- SPLASH SCREEN -->
    <Splash v-if="currentScreen === 'splash'" 
      :language="currentLanguage"
      @select-language="(lang) => currentLanguage = lang"
      @loaded="userData.id !== 'guest' ? navigateTo('home') : navigateTo('login')" 
    />

    <!-- AUTHENTICATION FLOW -->
    <Login v-else-if="currentScreen === 'login'" 
      :t="t"
      @go-signup="navigateTo('signup')" 
      @go-forgot="navigateTo('forgot-password')"
      @go-back="navigateTo('splash')" 
      @login="handleLogin"
    />
    <SignUp v-else-if="currentScreen === 'signup'" 
      :t="t"
      @go-login="navigateTo('login')" 
      @go-back="navigateTo('login')" 
      @signup="handleSignUp"
    />
    <ForgotPassword v-else-if="currentScreen === 'forgot-password'" 
      @go-back="navigateTo('login')"
      @submit="navigateTo('verify-code')"
    />
    <VerifyCode v-else-if="currentScreen === 'verify-code'" 
      @go-back="navigateTo('forgot-password')"
      @submit="navigateTo('reset-password')"
    />
    <ResetPassword v-else-if="currentScreen === 'reset-password'" 
      @go-back="navigateTo('verify-code')"
      @submit="navigateTo('login')"
    />

    <!-- MAIN APP TABS -->
    <Home v-else-if="currentScreen === 'home'" 
      :categories="categories"
      :trending-products="trendingProducts"
      :trending-sellers="trendingSellers"
      :explore-items="exploreItems"
      @go-details="(p) => navigateTo('product-details', { selectedProduct: p })"
      @go-notifications="navigateTo('notifications')"
      @go-search="navigateTo('search')"
      @search="handleSearch"
      @go-explore="(name) => navigateTo('explore', { selectedCategory: name || 'Explore more' })"
      @go-categories="navigateTo('category-list')"
      @go-trending="() => navigateTo('explore', { selectedCategory: 'Trending Trends' })"
      @go-tailor="(seller) => navigateTo('tailor-details', { selectedSeller: seller })"
      @toggle-like="toggleLike"
    />
    <FavoritesList v-else-if="currentScreen === 'favorites'" 
      :favorite-items="favoriteItems"
      @go-back="navigateTo('home')"
      @go-details="(p) => navigateTo('product-details', { selectedProduct: p })"
      @toggle-like="toggleLike"
    />

    <Profile v-else-if="currentScreen === 'profile'" 
      :user-data="userData"
      :product-count="userProductCount"
      :t="t"
      @go-back="navigateTo('home')"
      @go-edit-profile="navigateTo('edit-profile')"
      @go-settings="navigateTo('settings')"
      @go-console="navigateTo('tailor-console')"
      @go-orders="navigateTo('orders')"
      @go-upload="navigateTo('upload-work')"
      @logout="handleLogout"
    />

    <TailorConsole v-else-if="currentScreen === 'tailor-console'"
      :user-data="userData"
      :t="t"
      @go-back="navigateTo('profile')"
    />

    <Orders v-else-if="currentScreen === 'orders'"
      :user-data="userData"
      :t="t"
      @go-back="navigateTo('profile')"
    />

    <!-- SHOP & EXPLORE PAGES -->
<ProductDetails v-else-if="currentScreen === 'product-details'" 
      :product-id="selectedProduct?.id"
      :current-user-id="userData.id"
      :t="t"
      @go-back="navigateTo('home')" 
      @go-reviews="navigateTo('reviews')"
      @go-feedback="navigateTo('feedback')"
      @toggle-favorite="(p) => toggleLike(p)"
      @delete="handleProductDelete"
    />
    <ExploreMore v-else-if="currentScreen === 'explore'" 
      :category="selectedCategory"
      :explore-items="filteredExploreItems"
      @go-back="navigateTo('home')"
      @go-details="(p) => navigateTo('product-details', { selectedProduct: p })"
      @toggle-like="toggleLike"
    />
    <CategoryList v-else-if="currentScreen === 'category-list'" 
      :categories="categories"
      @go-back="navigateTo('home')"
      @select-category="(name) => navigateTo('explore', { selectedCategory: name })"
    />
    <TailorDetails v-else-if="currentScreen === 'tailor-details'"
      :seller="selectedSeller"
      @go-back="navigateTo('home')"
      @go-reviews="navigateTo('reviews')"
      @go-feedback="navigateTo('feedback')"
    />
    <UploadWork v-else-if="currentScreen === 'upload-work'"
      :categories="categories"
      @go-back="navigateTo('profile')"
      @upload="handleUploadWork"
    />
    <SearchPage v-else-if="currentScreen === 'search'" 
      :t="t"
      :categories="categories"
      @go-back="navigateTo('home')"
      @search="handleSearch"
      @select-category="(name) => navigateTo('explore', { selectedCategory: name })"
    />
    <SearchResults v-else-if="currentScreen === 'search-results'" 
      :results="searchResults"
      @go-back="navigateTo('search')"
      @go-details="(p) => navigateTo('product-details', { selectedProduct: p })"
      @toggle-like="toggleLike"
    />
    <Notifications v-else-if="currentScreen === 'notifications'" 
      :notifications="userNotifications"
      @go-back="navigateTo('home')" 
    />

    <!-- REVIEWS -->
    <ReviewsList v-else-if="currentScreen === 'reviews'" 
      @go-back="navigateTo('product-details')"
      @go-write-review="navigateTo('write-review')"
    />
    <WriteReview v-else-if="currentScreen === 'write-review'" @go-back="navigateTo('reviews')" />

    <!-- PROFILE & SETTINGS PAGES -->
    <EditProfile v-else-if="currentScreen === 'edit-profile'" 
      :user-data="userData"
      @update:user-data="handleUpdateProfile"
      @go-back="navigateTo('profile')" 
    />
    
    <Settings v-else-if="currentScreen === 'settings'" 
      :theme="theme"
      :language="currentLanguage"
      :t="t"
      @update:theme="(val) => theme = val"
      @update:language="(val) => currentLanguage = val"
      @go-back="navigateTo('profile')"
      @go-help="navigateTo('help')"
      @go-privacy="navigateTo('privacy')"
      @go-terms="navigateTo('terms')"
      @go-about="navigateTo('about')"
      @go-feedback="navigateTo('feedback')"
    />

    <Help v-else-if="currentScreen === 'help'" @go-back="navigateTo('settings')" />
    <PrivacyPolicy v-else-if="currentScreen === 'privacy'" @go-back="navigateTo('settings')" />
    <TermsConditions v-else-if="currentScreen === 'terms'" @go-back="navigateTo('settings')" />
    <AboutUs v-else-if="currentScreen === 'about'" @go-back="navigateTo('settings')" />
    <Feedback v-else-if="currentScreen === 'feedback'" 
      @go-back="navigateTo('settings')"
      @submit="handleFeedback"
    />

    <!-- BOTTOM NAVIGATION BAR -->
    <NavigationBar 
      v-if="showNavBar" 
      :active-tab="currentScreen"
      :t="t"
      @navigate="navigateTo"
    />

    <!-- GLOBAL LOADING OVERLAY -->
    <LoadingSpinner v-if="isGlobalLoading" :message="loadingMessage" />

  </div>
</template>

<style>
/* App Wrapper - Responsive & Centered */
.app-wrapper {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
  background-color: transparent;
  box-shadow: var(--shadow-md);
  overflow-x: hidden;
}
</style>