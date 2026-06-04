<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { db } from './db/client'
import { useRouter, useRoute } from 'vue-router'

// i18n
import { translations } from './translations'

// ==========================================
// CORE COMPONENTS
// ==========================================
import NavigationBar from './components/layout/NavigationBar.vue'
import WebHeader from './components/layout/WebHeader.vue'
import LoadingSpinner from './components/layout/LoadingSpinner.vue'
import Splash from './components/layout/Splash.vue'
import Cart from './components/shop/Cart.vue'
import { SpeedInsights } from "@vercel/speed-insights/vue"
import { Analytics } from "@vercel/analytics/vue"

// ==========================================
// STATE MANAGEMENT
// ==========================================
const STORAGE_KEY_PREFIX = 'alfie_app_'

const getStored = (key, def) => {
  const val = localStorage.getItem(STORAGE_KEY_PREFIX + key)
  if (!val) return def
  try { return JSON.parse(val) } catch { return def }
}

const setStored = (key, val) => {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val))
}

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
  theme: 'dark',
  profileViews: 0
}))

const currentLanguage = ref(getStored('language', 'en'))
const isGlobalLoading = ref(false)
const loadingMessage = ref('Summoning Heritage...')
const toast = ref({ show: false, message: '', type: 'info' })
const isDeepLoading = ref(false)
const resetEmail = ref('')
const resetVerificationCode = ref('')

const selectedSeller = ref(getStored('selected_seller', null))
const selectedCategory = ref(getStored('selected_category', 'Explore more'))
const selectedProduct = ref(getStored('selected_product', null))
const selectedReviewsTailorId = ref(null)
const isAppReview = ref(false)
const selectedEditProduct = ref(null)
const searchHistory = ref(getStored('search_history', []))
const cartItems = ref(getStored('cart_items', []))

// ==========================================
// DATA STATE
// ==========================================
const allProducts = ref(getStored('all_products_cache', []))
const trendingProducts = ref(getStored('trending_products_cache', []))
const trendingSellers = ref(getStored('trending_sellers_cache', []))
const categories = ref(getStored('categories_cache', []))
const favoriteItems = ref(getStored('favorites', []))
const userNotifications = ref([])
const userProductCount = ref(0)
const searchResults = ref([])
const appReviews = ref([])

const t = (key) => {
  const lang = currentLanguage.value || 'en'
  return translations[lang][key] || key
}

const filteredExploreItems = computed(() => {
  const cat = route.params.category || selectedCategory.value
  if (!cat || cat === 'Explore more' || cat === 'Trending Trends') {
    return allProducts.value
  }
  return allProducts.value.filter(p => p.categoryName === cat)
})

// ==========================================
// ROUTING & NAVIGATION
// ==========================================
const router = useRouter()
const route = useRoute()

// Sync selectedSeller with URL for reloads and direct navigation
watch(() => route.params.username, async (newUsername) => {
  if (route.name === 'tailor-details' && newUsername) {
    const cleanUsername = newUsername.startsWith('@') ? newUsername.slice(1) : newUsername;
    
    if (!selectedSeller.value || selectedSeller.value.username !== cleanUsername) {
      const cached = trendingSellers.value.find(s => s.username === cleanUsername);
      if (cached) {
        selectedSeller.value = cached;
      } else {
        // If not cached, we only have the username. 
        // TailorDetails.vue will fetch the full details (including ID).
        selectedSeller.value = { username: cleanUsername };
      }
    }
  }
}, { immediate: true });

// Scroll to top on route change since #app is the scroll container
watch(() => route.path, () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

const navigateTo = (screenName, extraState = {}) => {
  if (!screenName && !extraState.selectedProduct && !extraState.selectedSeller && !extraState.selectedCategory) {
    console.warn('[NavigateTo] Warning: screenName is missing and no specific entity navigation was requested.');
    return;
  }
  console.log(`[NavigateTo] Target: ${screenName}`, extraState);

  if (screenName === 'reviews') {
    selectedReviewsTailorId.value = extraState.tailorId || null
    isAppReview.value = extraState.isApp || false
  }

  if (extraState.selectedProduct) {
    if (!extraState.selectedProduct.id) {
      console.error('NavigateTo ERROR: Product object is missing id property', extraState.selectedProduct);
      return;
    }
    selectedProduct.value = extraState.selectedProduct
    setStored('selected_product', extraState.selectedProduct)
    console.log(`[NavigateTo] Going to product: ${extraState.selectedProduct.id}`);
    router.push({ name: 'product-details', params: { id: extraState.selectedProduct.id } })
    return
  }
  if (extraState.selectedSeller) {
    // Increment profile views optimistically
    try {
      db.runAction('increment_views', { 
        userId: extraState.selectedSeller.id || extraState.selectedSeller.owner_id 
      });
    } catch (e) {
      console.error('Failed to increment profile views:', e);
    }

    selectedSeller.value = extraState.selectedSeller
    setStored('selected_seller', extraState.selectedSeller)
    let username = extraState.selectedSeller.username;
    // Remove leading @ if present to avoid double @ in route
    if (username.startsWith('@')) username = username.slice(1);

    console.log(`[NavigateTo] Going to tailor: @${username}`);
    router.push({ name: 'tailor-details', params: { username } })
    return
  }
  if (extraState.selectedCategory) {
    selectedCategory.value = extraState.selectedCategory
    console.log(`[NavigateTo] Going to explore category: ${extraState.selectedCategory}`);
    router.push({ name: 'explore', params: { category: extraState.selectedCategory } })
    return
  }

  if (screenName) {
    const params = {};
    if (screenName === 'chat-detail' && extraState.userId) {
      params.userId = extraState.userId;
    }
    router.push({ name: screenName, params })
  }
}

const handleGoBack = () => {
  router.back()
}

const handleResetPassword = async (newPassword) => {
  isGlobalLoading.value = true
  loadingMessage.value = 'Forging new password...'
  try {
    await db.runAction('reset_password', { 
      password: newPassword, 
      email: resetEmail.value,
      code: resetVerificationCode.value // We need to store this
    })
    showToast('Password reset successfully!', 'success')
    navigateTo('login')
  } catch (e) {
    console.error('Reset password error:', e)
    showToast(e.message || 'Failed to reset password.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const handlePasswordReset = async (email) => {
  isGlobalLoading.value = true
  loadingMessage.value = 'Sending heritage code...'
  try {
    const res = await db.runAction('request_password_reset', { email })
    resetEmail.value = email
    
    // In our prototype, we show the code in the toast for easy testing
    // In production, this would only be sent via email
    const msg = `Verification code sent to ${email}.`
    showToast(msg, 'success')
    
    // For prototype convenience, if the API returned the code, let's log it
    if (res.code) console.log(`[PROTOTYPE] Verification code is: ${res.code}`)
    
    navigateTo('verify-code')
  } catch (e) {
    console.error('Password reset request error:', e)
    showToast(e.message || 'Failed to request reset.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const handleVerifyCode = async (code) => {
  isGlobalLoading.value = true
  loadingMessage.value = 'Verifying with ancestors...'
  try {
    await db.runAction('verify_reset_code', { email: resetEmail.value, code })
    resetVerificationCode.value = code
    showToast('Code verified!', 'success')
    navigateTo('reset-password')
  } catch (e) {
    console.error('Verification error:', e)
    showToast(e.message || 'Invalid verification code.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

// ==========================================
// DATA HANDLERS

// ==========================================
const handleLogin = async (data) => {
  console.log('[Auth] Login attempt for:', data.email);
  isGlobalLoading.value = true;
  loadingMessage.value = 'Authenticating with the Tribe...';
  try {
    const res = await db.runAction('login', { 
      email: data.email, 
      password: data.password 
    });

    if (res.user) {
      console.log('[Auth] Login successful! Setting user data.');
      
      // Store token securely
      if (res.token) {
        db.setToken(res.token);
      }
      
      const u = res.user;
      const loggedUser = {
        id: u.id,
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        whatsapp: u.whatsapp,
        avatar: u.avatar,
        userType: u.user_type,
        needs: u.needs,
        gives: u.gives,
        profileViews: u.profile_views
      };
      userData.value = loggedUser;
      setStored('user_data', loggedUser);
      
      await fetchInitialData();
      showToast(`Welcome back, ${u.first_name}!`, 'success');
      navigateTo('home');
    }
  } catch (e) {
    console.error('[Auth] Login error:', e);
    showToast(e.message || 'Login failed. Ancestors are silent.', 'error');
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleSignUp = async (data) => {
  console.log('[Auth] SignUp attempt:', data.email);
  isGlobalLoading.value = true;
  loadingMessage.value = 'Joining the heritage...';
  
  try {
    // Create user
    const newId = 'u' + Date.now();
    const signupData = { ...data, id: newId };
    
    const res = await db.runAction('signup', signupData);
    
    // Store token
    if (res.token) {
      db.setToken(res.token);
    }
    
    // Update state (server returns nothing or success, we use local data)
    userData.value = signupData;
    setStored('user_data', signupData);
    
    await fetchInitialData();
    showToast('Welcome to the heritage tribe!', 'success');
    navigateTo('home');
  } catch (e) {
    console.error('[Auth] Signup error:', e);
    showToast(e.message || 'Signup failed. Please try again.', 'error');
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleLogout = () => {
  db.clearToken()
  userData.value = { id: 'guest', username: 'guest' }
  setStored('user_data', { id: 'guest', username: 'guest' })
  setStored('favorites', []);
  favoriteItems.value = [];
  showToast('Logged out from the tribe.', 'info')
  navigateTo('splash')
}

const handleUpdateRole = async (newRole) => {
  if (userData.value.id === 'guest') return
  isGlobalLoading.value = true
  loadingMessage.value = 'Switching roles...'
  try {
    await db.runAction('update_role', { id: userData.value.id, role: newRole });
    userData.value.userType = newRole
    showToast(`Role successfully switched to ${newRole === 'supplier' ? 'Tailor' : 'Buyer'}!`, 'success')
  } catch (e) {
    console.error('Role update error:', e)
    showToast('Error switching roles. Please try again.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const isSyncing = ref(false)

const fetchInitialData = async (force = false) => {
  // Prevent duplicate concurrent syncs unless forced
  if (isSyncing.value && !force) return;
  
  try {
    isSyncing.value = true;
    
    // 1. Instant Cache Load (Already handled by refs initialization, but we ensure state is solid)
    const cachedCategories = getStored('categories_cache', []);
    if (cachedCategories.length > 0 && !force) {
      // If we have cache and it's not a forced refresh, we don't show the global spinner
      // This makes the app feel "instant"
    } else {
      isGlobalLoading.value = true;
    }

    // 2. Background Sync
    const data = await db.runAction('get_initial_data', { userId: userData.value.id });
    
    // 3. Smart Update (Only update refs if data actually changed)
    const favoriteIds = data.favorites || [];
    
    const newAllProducts = data.allProducts.map(p => ({
      ...p,
      liked: favoriteIds.includes(p.id)
    }));

    // Deep compare allProducts to avoid unnecessary re-renders
    if (JSON.stringify(newAllProducts) !== JSON.stringify(allProducts.value)) {
      allProducts.value = newAllProducts;
      setStored('all_products_cache', allProducts.value);
    }
    
    const newTrendingProducts = data.trendingProducts.map(p => ({
      ...p,
      liked: favoriteIds.includes(p.id)
    }));
    if (JSON.stringify(newTrendingProducts) !== JSON.stringify(trendingProducts.value)) {
      trendingProducts.value = newTrendingProducts;
      setStored('trending_products_cache', trendingProducts.value);
    }
    
    const newFavoriteItems = allProducts.value.filter(p => p.liked);
    if (JSON.stringify(newFavoriteItems) !== JSON.stringify(favoriteItems.value)) {
      favoriteItems.value = newFavoriteItems;
      setStored('favorites', favoriteItems.value);
    }

    if (JSON.stringify(data.categories) !== JSON.stringify(categories.value)) {
      categories.value = data.categories;
      setStored('categories_cache', categories.value);
    }
    
    const newTrendingSellers = data.trendingSellers.map(s => ({
      id: s.id,
      name: (s.first_name || s.last_name) ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : s.username,
      username: s.username,
      avatar: s.avatar,
      rating: s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : '0.0',
      likesCount: s.total_likes || 0,
      isVerified: s.is_verified === 1 || s.is_verified === true
    }));
    if (JSON.stringify(newTrendingSellers) !== JSON.stringify(trendingSellers.value)) {
      trendingSellers.value = newTrendingSellers;
      setStored('trending_sellers_cache', trendingSellers.value);
    }

    if (userData.value.id !== 'guest') {
      if (data.userRating !== undefined) {
        userData.value.rating = parseFloat(data.userRating || 0).toFixed(1);
      }
      userNotifications.value = data.notifications;
      userProductCount.value = data.productCount;
    }

    const newAppReviews = data.appReviews.map(r => ({
      id: r.id,
      author: (r.first_name || r.last_name) ? `${r.first_name || ''} ${r.last_name || ''}`.trim() : r.username,
      text: r.text,
      rating: r.rating,
      avatar: r.avatar
    }));
    if (JSON.stringify(newAppReviews) !== JSON.stringify(appReviews.value)) {
      appReviews.value = newAppReviews;
    }

  } catch (e) {
    console.error('[InitialData] Sync failed:', e);
  } finally {
    isGlobalLoading.value = false;
    isSyncing.value = false;
  }
}

const toggleLike = async (product) => {
  if (userData.value.id === 'guest') {
    navigateTo('login')
    return
  }
  
  const originalStatus = product.liked
  product.liked = !product.liked
  
  // Sync all references locally
  const updateProduct = (list) => {
    const p = list.find(item => item.id === product.id)
    if (p) p.liked = product.liked
  }
  updateProduct(allProducts.value)

  try {
    await db.runAction('toggle_like', { 
      userId: userData.value.id, 
      productId: product.id, 
      isAdding: product.liked 
    });
    
    if (product.liked) {
      if (!favoriteItems.value.find(item => item.id === product.id)) {
        favoriteItems.value.push({ ...product })
      }
    } else {
      favoriteItems.value = favoriteItems.value.filter(item => item.id !== product.id)
    }
    setStored('favorites', favoriteItems.value);
  } catch (e) {
    console.error("Toggle like error:", e)
    // Rollback on error
    product.liked = originalStatus
    updateProduct(allProducts.value)
  }
}

const handleUploadWork = async (data) => {
  isGlobalLoading.value = true;
  loadingMessage.value = data.id ? 'Updating your heritage piece...' : 'Weaving your work into the heritage...';
  try {
    if (data.id) {
      await db.runAction('update_product', { ...data, owner_id: userData.value.id });
      showToast('Work updated successfully!', 'success')
    } else {
      await db.runAction('create_product', { ...data, owner_id: userData.value.id });
      showToast('Work published successfully!', 'success')
    }
    await fetchInitialData();
    navigateTo('profile');
  } catch (e) {
    console.error('Upload error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleNewOrder = async (data) => {
  console.log('[Data] Saving new order:', data);
  const customerId = userData.value.id;
  const tailorId = data.tailorId;

  try {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    await db.runAction('create_order', {
      ...data,
      id: orderId,
      customerId: customerId
    });
    console.log('[Data] Order saved successfully');
    
    // Notify the tailor
    if (tailorId && tailorId !== 'guest') {
      await createNotification(tailorId, `New order created for "${data.itemName}"! 📦✨`);
    }
    
    // Also notify the customer if they aren't the same person
    if (customerId !== tailorId && customerId !== 'guest') {
      await createNotification(customerId, `Your order for "${data.itemName}" has been placed! 🧵`);
    }
      
    showToast('Order placed successfully! Connecting to WhatsApp...', 'success');
  } catch (e) {
    console.error('[Data] Failed to save order:', e);
    showToast('Failed to place order. Connection error.', 'error');
  }
}

const handleNewNegotiation = async (data) => {
  const customerId = userData.value.id;
  const tailorId = data.tailorId;

  try {
    await db.runAction('create_negotiation', {
      itemName: data.itemName || 'Unknown Item',
      customerId: customerId,
      tailorId: tailorId,
      price: data.offer || data.price || '0',
      size: data.size || 'N/A',
      color: data.color || 'N/A',
      notes: data.notes || '',
      image: data.image || ''
    })
    showToast('Negotiation initiated successfully!', 'success')
    
    if (tailorId && tailorId !== 'guest') {
      await createNotification(tailorId, `New negotiation offer for "${data.itemName}"! 💰`)
    }
  } catch (e) {
    console.error('Negotiation error:', e)
    showToast('Failed to start negotiation. Connection error.', 'error');
  }
}

const createNotification = async (userId, message) => {
  try {
    await db.runAction('create_notification', { userId, message });
    console.log(`[Notification] Created for ${userId}: ${message}`)
    // Refresh local notifications if it's for the current user
    if (userId === userData.value.id) {
      await fetchInitialData(true);
    }
  } catch (e) {
    console.error('[Notification] Failed to create:', e)
  }
}

const handleUpdateOrderStatus = async (data) => {
  console.log('[Data] Updating order status:', data);
  try {
    await db.runAction('update_order_status', { orderId: data.orderId, status: data.status });
    
    showToast(`Order status updated to ${data.status}`, 'success')
    
    // Notify the customer
    let msg = `Your order for "${data.itemName}" has been updated to: ${data.status}!`
    await createNotification(data.customerId, msg)
    await fetchInitialData()
  } catch (e) {
    console.error('[Data] Failed to update status:', e);
    showToast('Failed to update status. Connection error.', 'error');
  }
}

const handleWriteReview = async (data) => {
  if (selectedProduct.value?.id === undefined) return
  isGlobalLoading.value = true
  loadingMessage.value = 'Publishing your heritage review...'
  try {
    await db.runAction('write_review', {
      productId: selectedProduct.value.id,
      userId: userData.value.id,
      rating: data.rating,
      text: data.text,
      image: data.image || null
    });
    showToast('Review shared with the Tribe!', 'success')
    navigateTo('product-details', { selectedProduct: selectedProduct.value })
  } catch (e) {
    console.error('Review error:', e)
    showToast('Error sharing review. Please try again.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const handleAppExperienceSubmit = async (data) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Sharing your journey with the Tribe...';
  try {
    await db.runAction('submit_app_review', {
      userId: userData.value.id,
      rating: data.rating,
      text: data.text,
      image: data.image
    });
    showToast('Your journey has been recorded! ✨', 'success');
    navigateTo('profile');
  } catch (e) {
    console.error('App review error:', e);
    showToast('Error sharing experience.', 'error');
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleFeedbackSubmit = async (message) => {
  isGlobalLoading.value = true
  loadingMessage.value = 'Sending feedback...'
  try {
    await db.runAction('submit_feedback', { userId: userData.value.id, message })
    showToast('Feedback sent! Thank you.', 'success')
    navigateTo('home')
  } catch (e) {
    console.error('Feedback error:', e)
  } finally {
    isGlobalLoading.value = false
  }
}

const handleProductDelete = async (productId) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Removing heritage item...';
  try {
    await db.runAction('delete_product', { productId, userId: userData.value.id });
    showToast('Item removed successfully.', 'success')
    await fetchInitialData()
    navigateTo('home')
  } catch (e) {
    console.error('Delete product error:', e)
    showToast('Error removing item.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const handleUpdateProfile = async (val) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Updating your heritage profile...';
  try {
    await db.runAction('update_profile', val);
    userData.value = { ...val };
    setStored('user_data', userData.value);
    showToast('Profile updated successfully!', 'success')
    await fetchInitialData();
    navigateTo('profile');
  } catch (e) {
    console.error('Update profile error:', e);
    showToast('Failed to update profile. Username might be taken.', 'error')
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleGoChat = (userId) => {
  navigateTo('chat-detail', { userId })
}

const handleSearch = async (query, navigate = true) => {
  // If query is empty, just navigate to search page
  if (!query && navigate) {
    navigateTo('search');
    return;
  }
  if (!query) return;

  isGlobalLoading.value = navigate;
  loadingMessage.value = 'Searching the heritage...';
  try {
    const res = await db.runAction('search', { query, userId: userData.value.id });

    // Fetch favorites state
    const favoriteIds = favoriteItems.value.map(f => f.id);

    searchResults.value = {
      query: res.query || query,
      products: (res.products || []).map(p => ({
        ...p,
        liked: favoriteIds.includes(p.id)
      })),
      tailors: (res.tailors || []).map(t => ({
        ...t,
        name: (t.first_name || t.last_name) ? `${t.first_name || ''} ${t.last_name || ''}`.trim() : t.username,
        rating: t.rating ? parseFloat(t.rating).toFixed(1) : '0.0',
        isVerified: t.is_verified === 1 || t.is_verified === true
      }))
    };

    if (navigate) {
      navigateTo('search-results');
    }
  } catch (e) {
    console.error('Search error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

// ==========================================
// UTILS
// ==========================================
const showToast = (message, type = 'info') => {
  const emojis = { success: '✅', error: '⚠️', info: 'ℹ️' }
  const emoji = emojis[type] || 'ℹ️'
  toast.value = { show: true, message: `${emoji} ${message}`, type }
  setTimeout(() => toast.value.show = false, 3000)
}

watch([allProducts, userData], () => {
  if (userData.value.id !== 'guest') {
    userProductCount.value = allProducts.value.filter(p => p.owner_id === userData.value.id).length;
  } else {
    userProductCount.value = 0;
  }
}, { immediate: true })

const handleCartCheckout = (group) => {
  const buyerName = userData.value.firstName || userData.value.username;
  const sellerName = group.tailorName;
  const sparkles = "✨";
  const diamond = "🔹";
  
  let message = `Habari ${sellerName}! ${sparkles}\n\n`;
  message += `My name is ${buyerName}, and I'd like to place a combined order for the following items:\n\n`;
  
  group.items.forEach(item => {
    message += `${diamond} *${item.name}* (${item.price})\n`;
    if (item.selectedSize) message += `   Size: ${item.selectedSize}\n`;
    if (item.selectedColor) message += `   Color: ${item.selectedColor}\n`;
  });
  
  message += `\n*Estimated Total: TSh ${group.total.toLocaleString()}*\n\n`;
  message += `Could you please let me know how we can proceed with the payment and delivery? 🚚\n\n`;
  message += `Best regards,\n${buyerName} ✍️`;
  
  // Robust normalization for WhatsApp
  let phoneNumber = group.tailorPhone || '';
  let cleaned = phoneNumber.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('2550')) {
    cleaned = '255' + cleaned.slice(4)
  } else if (cleaned.startsWith('0')) {
    cleaned = '255' + cleaned.slice(1)
  }
  const normalized = cleaned
  
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
}

const handleAddToCart = (product, options = {}) => {
  if (userData.value.id === 'guest') {
    navigateTo('login');
    return;
  }
  const cartId = 'CART-' + Math.floor(1000 + Math.random() * 9000);
  const cartItem = {
    ...product,
    cartId: cartId,
    selectedSize: options.size || '',
    selectedColor: options.color || ''
  };
  cartItems.value.push(cartItem);
  setStored('cart_items', cartItems.value);
  showToast(`${product.name} added to cart!`, 'success');
}

const handleRemoveFromCart = (cartId) => {
  cartItems.value = cartItems.value.filter(item => item.cartId !== cartId);
  setStored('cart_items', cartItems.value);
  showToast('Item removed from cart.', 'info');
}

// Lifecycle
onMounted(() => {
  fetchInitialData()
})

const showNavBar = computed(() => {
  return ['home', 'favorites', 'profile', 'category-list', 'chats', 'notifications', 'search', 'explore'].includes(route.name)
})
</script>

<template>
  <div class="app-wrapper">
    <!-- DESKTOP HEADER (WEB MODE) -->
    <WebHeader 
      v-if="showNavBar" 
      :active-tab="route.name"
      :t="t"
      :cart-count="cartItems.length"
      @navigate="navigateTo"
      @go-notifications="navigateTo('notifications')"
      @go-cart="navigateTo('cart')"
    />

    <main :class="{ 'with-nav': showNavBar }">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component 
          :is="Component" 
          :t="t"
          :user-data="userData"
          :theme="theme"
          :language="currentLanguage"
          :categories="categories"
          :trending-products="trendingProducts"
          :trending-sellers="trendingSellers"
          :explore-items="filteredExploreItems"
          :favorite-items="favoriteItems"
          :my-products="allProducts.filter(p => p.owner_id === userData.id)"
          :product-count="userProductCount"
          :product-id="route.params.id || selectedProduct?.id"
          :tailor-id="selectedReviewsTailorId"
          :is-app="isAppReview"
          :current-user-id="userData.id"
          :category="route.params.category || selectedCategory"
          :seller="selectedSeller"
          :results="searchResults"
          :search-history="searchHistory"
          :cart-items="cartItems"
          :notifications="userNotifications"
          :app-reviews="appReviews"
          :is-loading="isGlobalLoading"
          :editing-product="selectedEditProduct"
          @navigate="navigateTo"
          @go-back="handleGoBack"
          @login="handleLogin"
          @signup="handleSignUp"
          @add-to-cart="handleAddToCart"
          @remove-item="handleRemoveFromCart"
          @checkout="handleCartCheckout"
          @submit="(val) => {
            if (route.name === 'forgot-password') handlePasswordReset(val)
            else if (route.name === 'verify-code') handleVerifyCode(val)
            else if (route.name === 'reset-password') handleResetPassword(val)
            else if (route.name === 'feedback') handleFeedbackSubmit(val)
            else if (route.name === 'write-review') handleWriteReview(val)
          }"
          @go-signup="navigateTo('signup')"
          @go-login="navigateTo('login')"
          @go-forgot="navigateTo('forgot-password')"
          @go-settings="navigateTo('settings')"
          @go-edit-profile="navigateTo('edit-profile')"
          @go-console="navigateTo('tailor-console')"
          @go-orders="navigateTo('orders')"
          @go-negotiations="navigateTo('orders')"
          @go-edit="(p) => { selectedEditProduct = p; navigateTo('upload-work') }"
          @go-upload="navigateTo('upload-work')"
          @go-app-review="navigateTo('app-review')"
          @logout="handleLogout"
          @go-reviews="(tailorId) => navigateTo('reviews', { tailorId })"
          @go-feedback="navigateTo('feedback')"
          @go-chats="navigateTo('chats')"
          @go-chat="handleGoChat"
          @go-product="(p) => navigateTo('product-details', { selectedProduct: p })"
          @go-details="(p) => navigateTo('product-details', { selectedProduct: p })"
          @go-search-details="(p) => navigateTo('product-details', { selectedProduct: p })"
          @toggle-favorite="(p) => toggleLike(p)"
          @toggle-like="(p) => toggleLike(p)"
          @toggle-search-favorite="(p) => toggleLike(p)"
          @delete="handleProductDelete"
          @select-category="(name) => navigateTo('explore', { selectedCategory: name })"
          @go-explore="(name) => navigateTo('explore', { selectedCategory: name })"
          @go-notifications="navigateTo('notifications')"
          @go-search="navigateTo('search')"
          @go-search-tailor="(s) => navigateTo('tailor-details', { selectedSeller: s })"
          @go-categories="navigateTo('category-list')"
          @go-trending="navigateTo('explore', { selectedCategory: 'Trending Trends' })"
          @go-tailor="(s) => navigateTo('tailor-details', { selectedSeller: s })"
          @search="handleSearch"
          @update:user-data="handleUpdateProfile"
          @update:language="(val) => { currentLanguage = val; setStored('language', val); }"
          @update:role="handleUpdateRole"
          @go-help="navigateTo('help')"
          @go-privacy="navigateTo('privacy')"
          @go-terms="navigateTo('terms')"
          @go-about="navigateTo('about')"
          @go-returns="navigateTo('returns')"
          @go-guidelines="navigateTo('guidelines')"
          @go-safety="navigateTo('safety')"
          @go-measurements="navigateTo('measurements')"
          @go-ip-policy="navigateTo('ip-policy')"
          @go-stories="navigateTo('stories')"
          @upload="handleUploadWork"
          @order="handleNewOrder"
          @negotiate="handleNewNegotiation"
          @update-status="handleUpdateOrderStatus"
          @submit-app-experience="handleAppExperienceSubmit"
          @loaded="userData.id !== 'guest' ? navigateTo('home') : navigateTo('login')"
        />
      </keep-alive>
    </router-view>
    </main>

    <NavigationBar 
      v-if="showNavBar" 
      :active-tab="route.name"
      :is-guest="userData.id === 'guest'"
      :t="t"
      @navigate="navigateTo"
    />

    <LoadingSpinner v-if="isGlobalLoading" :message="loadingMessage" />

    <!-- Modern Toast Notification -->
    <div v-if="toast.show" class="toast-notification animate-fade-up" :class="toast.type">
      <div class="toast-icon">
        <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <span class="toast-message">{{ toast.message }}</span>
    </div>

    <SpeedInsights />
    <Analytics />
  </div>
</template>


<style>
/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 100px;
  background: var(--wood-deep);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 9999;
  min-width: 280px;
  max-width: 90vw;
}
.toast-notification.success { border-color: #10B981; }
.toast-notification.error { border-color: #EF4444; }
.toast-notification.success .toast-icon { color: #10B981; }
.toast-notification.error .toast-icon { color: #EF4444; }
.toast-message { font-size: 14px; font-weight: 600; color: var(--text-primary); }

@keyframes fadeUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.animate-fade-up { animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

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

.with-nav {
  padding-top: 60px;
  padding-bottom: 100px;
}

@media (min-width: 768px) {
  .with-nav {
    padding-top: 80px;
    padding-bottom: 0;
  }
}
</style>
