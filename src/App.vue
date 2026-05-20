<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { db } from './db/client'
import { useRouter, useRoute } from 'vue-router'
import bcrypt from 'bcryptjs'

// ==========================================
// 1. IMPORT GLOBAL COMPONENTS
// ==========================================
import { SpeedInsights } from '@vercel/speed-insights/vue'
import NavigationBar from './components/layout/NavigationBar.vue'
import WebHeader from './components/layout/WebHeader.vue'
import LoadingSpinner from './components/layout/LoadingSpinner.vue'
import { Analytics } from '@vercel/analytics/vue'

// i18n
import { translations } from './translations'

// ==========================================
// 2. STATE MANAGEMENT & PERSISTENCE
// ==========================================
const STORAGE_KEY_PREFIX = 'alfie_app_'

const getStored = (key, defaultValue) => {
  const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key)
  if (stored === null) return defaultValue
  try {
    return JSON.parse(stored)
  } catch (e) {
    return stored
  }
}

const setStored = (key, value) => {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value))
}

const router = useRouter()
const route = useRoute()

const currentLanguage = ref(getStored('language', 'en')) 
const theme = ref(getStored('theme', 'light'))

const isGlobalLoading = ref(false)
const loadingMessage = ref('')

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
  theme: 'light',
  profileViews: 0
}))

const categories = ref(getStored('categories_cache', []))
const trendingProducts = ref(getStored('trending_products_cache', []))
const trendingSellers = ref(getStored('trending_sellers_cache', []))
const allProducts = ref(getStored('all_products_cache', []))
const exploreItems = ref(getStored('explore_items_cache', []))
const productReviews = ref([])
const searchResults = ref([])
const searchHistory = ref(getStored('search_history', []))
const userNotifications = ref([])
const userProductCount = ref(0)

const isDeepLoading = ref(false)

const selectedSeller = ref(getStored('selected_seller', null))
const selectedCategory = ref(getStored('selected_category', 'Explore more'))
const selectedProduct = ref(getStored('selected_product', null))
const selectedEditProduct = ref(null)
const resetEmail = ref('')

const filteredExploreItems = computed(() => {
  if (selectedCategory.value === 'Explore more' || selectedCategory.value === 'Trending Trends') {
    return allProducts.value
  }
  return allProducts.value.filter(p => {
    const cat = categories.value.find(c => c.id === p.category_id)
    return cat && cat.name === selectedCategory.value
  })
})

const userPreferences = ref(getStored('user_preferences', {}))

const updatePreference = (categoryId, weight = 1) => {
  if (!categoryId) return
  const current = userPreferences.value[categoryId] || 0
  userPreferences.value[categoryId] = current + weight
  setStored('user_preferences', userPreferences.value)
}

const fetchInitialData = async () => {
  console.log('[SpeedDemon] Phase 1: Fetching Core Data...');
  try {
    // 1. User & Session Core
    if (userData.value.id !== 'guest') {
      const userRes = await db.execute({
        sql: "SELECT * FROM users WHERE id = ?",
        args: [userData.value.id]
      })
      if (userRes.rows?.length > 0) {
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
          theme: u.theme || 'light',
          profileViews: u.profile_views || 0
        }
        theme.value = u.theme || 'light'
      } else {
        console.warn('[Data] Session user not found in DB. Logging out.');
        handleLogout();
      }
    }

    // 2. Critical Home Data (Top 4 Products + Categories)
    const [catRes, prodRes] = await Promise.all([
      db.execute("SELECT * FROM categories"),
      db.execute("SELECT * FROM products ORDER BY likes_count DESC LIMIT 4")
    ])
    
    categories.value = catRes.rows || []
    trendingProducts.value = prodRes.rows || []
    
    // Cache immediately for next visit
    setStored('categories_cache', categories.value)
    setStored('trending_products_cache', trendingProducts.value)

    // BOOT COMPLETE - Clear spinner early
    isGlobalLoading.value = false
    console.log('[SpeedDemon] Phase 1 Complete. User can now peruse.');

    // Phase 2: Deep Loading in Background
    fetchDeepData()
  } catch (e) {
    console.error("[SpeedDemon] Phase 1 Error:", e)
    isGlobalLoading.value = false
  }
}

const fetchDeepData = async () => {
  console.log('[SpeedDemon] Phase 2: Streaming deep data...');
  isDeepLoading.value = true
  try {
    // 1. Full Product Catalog
    const productsRes = await db.execute("SELECT * FROM products ORDER BY id DESC")
    const favoriteIds = (await db.execute({
      sql: "SELECT product_id FROM favorites WHERE user_id = ?",
      args: [userData.value.id]
    })).rows.map(f => f.product_id)

    allProducts.value = (productsRes.rows || []).map(p => ({ ...p, liked: favoriteIds.includes(p.id) }))
    favoriteItems.value = allProducts.value.filter(p => p.liked)
    setStored('all_products_cache', allProducts.value)

    // 2. Full Artisans
    const sellersRes = await db.execute(`
      SELECT u.*, 
             (SELECT COUNT(*) FROM products WHERE owner_id = u.id) as posts_count,
             (SELECT COUNT(*) FROM orders WHERE tailor_id = u.id) as clients_count,
             (SELECT SUM(likes_count) FROM products WHERE owner_id = u.id) as likes_count,
             (SELECT AVG(rating) FROM reviews WHERE product_id IN (SELECT id FROM products WHERE owner_id = u.id)) as avg_rating
      FROM users u 
      WHERE u.user_type = 'supplier'
      ORDER BY clients_count DESC, likes_count DESC
    `)
    trendingSellers.value = (sellersRes.rows || []).map(s => ({ 
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      username: s.username,
      avatar: s.avatar,
      bio: s.gives,
      whatsapp: s.whatsapp,
      isVerified: s.clients_count > 5,
      likesCount: s.likes_count || 0,
      clientsCount: s.clients_count || 0,
      rating: s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : '0.0'
    }))
    setStored('trending_sellers_cache', trendingSellers.value)

    // 3. Notifications & Stats
    const [notifRes, statsRes] = await Promise.all([
      db.execute({ sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", args: [userData.value.id] }),
      db.execute({ sql: "SELECT COUNT(*) as total FROM products WHERE owner_id = ?", args: [userData.value.id] })
    ])
    userNotifications.value = (notifRes.rows || []).map(n => ({ id: n.id, name: n.message, time: 'Just now', unread: !!n.is_unread }))
    userProductCount.value = statsRes.rows?.[0]?.total || 0

    console.log('[SpeedDemon] Phase 2 Complete. Background data synced.');
  } catch (e) {
    console.error("[SpeedDemon] Phase 2 Error:", e)
  } finally {
    isDeepLoading.value = false
  }
}

onMounted(() => {
  fetchInitialData()

  // Auto-redirect if already logged in
  if (userData.value.id !== 'guest') {
    if (['splash', 'login', 'signup'].includes(route.name)) {
      router.push({ name: 'home' })
    }
  }
})

// Auto-save watchers
watch(currentLanguage, (val) => setStored('language', val))
watch(theme, async (val) => {
  setStored('theme', val)
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

const navigateTo = async (screenName, extraState = {}) => {
  if (!screenName && !extraState.selectedProduct && !extraState.selectedSeller && !extraState.selectedCategory) {
    console.warn('[NavigateTo] Warning: screenName is missing and no specific entity navigation was requested.');
    return;
  }
  console.log(`[NavigateTo] Target: ${screenName}`, extraState);

  if (extraState.selectedProduct) {
    if (!extraState.selectedProduct.id) {
      console.error('NavigateTo ERROR: Product object is missing id property', extraState.selectedProduct);
      return;
    }
    selectedProduct.value = extraState.selectedProduct
    updatePreference(extraState.selectedProduct.category_id, 1) // Weight for views
    const id = extraState.selectedProduct.id.toString();
    console.log(`[NavigateTo] Going to product: ${id}`);
    router.push({ name: 'product-details', params: { id } })
    return
  }
  if (extraState.selectedSeller) {
    if (!extraState.selectedSeller.id) {
      console.error('NavigateTo ERROR: Seller object is missing id property', extraState.selectedSeller);
      return;
    }
    
    // Increment profile views
    try {
      db.execute({
        sql: "UPDATE users SET profile_views = profile_views + 1 WHERE id = ?",
        args: [extraState.selectedSeller.owner_id || extraState.selectedSeller.id]
      });
    } catch (e) {
      console.error('Failed to increment profile views:', e);
    }

    selectedSeller.value = extraState.selectedSeller
    const id = extraState.selectedSeller.id.toString();
    console.log(`[NavigateTo] Going to tailor: ${id}`);
    router.push({ name: 'tailor-details', params: { id } })
    return
  }
  if (extraState.selectedCategory) {
    selectedCategory.value = extraState.selectedCategory
    console.log(`[NavigateTo] Going to explore category: ${extraState.selectedCategory}`);
    router.push({ name: 'explore', params: { category: extraState.selectedCategory } })
    return
  }

  if (screenName === 'upload-work') {
    selectedEditProduct.value = extraState.product || null
  } else {
    selectedEditProduct.value = null
  }

  // Prevent navigation to routes requiring params without params
  if (['product-details', 'tailor-details', 'chat-detail'].includes(screenName)) {
    console.error(`NavigateTo ERROR: Route "${screenName}" requires params but none were provided in state.`);
    return;
  }

  console.log(`[NavigateTo] Pushing route name: ${screenName}`);
  router.push({ name: screenName }).catch(err => {
    console.error(`[Router] Push failed for ${screenName}:`, err);
  });
}

const toggleLike = async (product) => {
  product.liked = !product.liked
  const updateProduct = (list) => {
    const p = list.find(item => item.id === product.id)
    if (p) p.liked = product.liked
  }
  updateProduct(allProducts.value)
  updateProduct(trendingProducts.value)
  
  if (product.liked) {
    updatePreference(product.category_id, 2) // High weight for likes
  }

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

const currentScreen = computed(() => route.name || 'splash')

const showNavBar = computed(() => {
  return ['home', 'favorites', 'profile', 'category-list', 'chats', 'notifications', 'search', 'explore'].includes(currentScreen.value)
})


const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ==========================================
// 3. ACTION HANDLERS
// ==========================================
const handleLogin = async (data) => {
  console.log('[Auth] Login attempt for:', data.email);
  isGlobalLoading.value = true;
  loadingMessage.value = 'Authenticating with the Tribe...';
  try {
    const res = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [data.email]
    });
    console.log('[Auth] DB Response rows:', res.rows?.length);

    if (res.rows.length > 0) {
      const u = res.rows[0];
      // Try bcrypt compare, fallback to plain text for legacy users (first migration)
      let isMatch = false;
      try {
        console.log('[Auth] Comparing passwords with bcrypt...');
        isMatch = await bcrypt.compare(data.password, u.password);
        console.log('[Auth] Bcrypt match:', isMatch);
      } catch (e) {
        console.log('[Auth] Bcrypt compare failed, trying plain text fallback');
        isMatch = u.password === data.password;
      }

      if (isMatch) {
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
          theme: u.theme || 'light',
          profileViews: u.profile_views || 0
        };
        theme.value = u.theme || 'light';
        console.log('[Auth] Login success, fetching initial data');
        await fetchInitialData();
        navigateTo('home');
      } else {
        showToast('Invalid password. Please try again.', 'error')
      }
    } else {
      showToast('User not found. Please sign up.', 'error')
    }
  } catch (e) {
    console.error('[Auth] Login error:', e);
    showToast('Login failed. Please check your connection.', 'error')
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleSignUp = async (data) => {
  console.log('[Auth] SignUp attempt:', data.email);
  isGlobalLoading.value = true;
  loadingMessage.value = 'Joining the heritage...';
  
  try {
    // 1. Check if user already exists
    const checkRes = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? OR username = ?',
      args: [data.email, data.username]
    });

    if (checkRes.rows && checkRes.rows.length > 0) {
      showToast('Email or username already registered.', 'error');
      return;
    }

    // 2. Hash password
    console.log('[Auth] Hashing password...');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // 3. Create user
    const newId = 'u' + Date.now();
    const signupData = { ...data, id: newId, password: hashedPassword };
    
    console.log('[Auth] Executing DB insert...');
    await db.execute({
      sql: 'INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, needs, gives, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [signupData.id, signupData.username, signupData.firstName, signupData.lastName, signupData.email, signupData.password, signupData.whatsapp, signupData.avatar, signupData.userType, signupData.needs, signupData.gives, 'light']
    });
    
    console.log('[Auth] Signup successful');
    
    // 4. Update state (cleanly, without the password)
    const { password, ...userWithoutPassword } = signupData;
    userData.value = { ...userWithoutPassword, theme: 'light' };
    
    await fetchInitialData();
    navigateTo('home');
    showToast('Welcome to the heritage!', 'success');
  } catch (e) {
    console.error('[Auth] Signup error:', e);
    showToast('Error signing up. Please check your connection.', 'error');
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleUploadWork = async (data) => {
  isGlobalLoading.value = true;
  loadingMessage.value = data.id ? 'Updating your heritage piece...' : 'Weaving your work into the heritage...';
  try {
    if (data.id) {
      await db.execute({
        sql: `
          UPDATE products 
          SET name = ?, price = ?, description = ?, material = ?, image = ?, category_id = ?, status = ?, variants_json = ?, gallery_json = ? 
          WHERE id = ? AND owner_id = ?
        `,
        args: [data.name, data.price, data.description, data.material, data.image, data.category_id, data.status, data.variants_json, data.gallery_json, data.id, userData.value.id]
      });
      showToast('Work updated successfully!', 'success')
    } else {
      await db.execute({
        sql: 'INSERT INTO products (name, price, description, material, image, category_id, owner_id, status, variants_json, gallery_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [data.name, data.price, data.description, data.material, data.image, data.category_id, userData.value.id, data.status, data.variants_json, data.gallery_json]
      });
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
  try {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    await db.execute({
      sql: `
        INSERT INTO orders (id, item_name, customer_id, tailor_id, price, status, size, color, notes, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        orderId, 
        data.itemName, 
        userData.value.id, 
        data.tailorId, 
        data.price, 
        'Pending', 
        data.size, 
        data.color, 
        data.notes, 
        data.image
      ]
    });
    console.log('[Data] Order saved successfully');
    
    // Notify the user
    await createNotification(userData.value.id === data.tailorId ? data.customerId : data.tailorId, 
      `New order created for "${data.itemName}"! 📦✨`);
  } catch (e) {
    console.error('[Data] Failed to save order:', e);
  }
}

const handleNewNegotiation = async (data) => {
  console.log('[Data] Saving new negotiation:', data);
  try {
    const negId = 'NEG-' + Math.floor(100 + Math.random() * 900);
    await db.execute({
      sql: `
        INSERT INTO negotiations (id, item_name, customer_id, tailor_id, proposed_price, status, size, color, notes, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        negId, 
        data.itemName, 
        userData.value.id, 
        data.tailorId, 
        data.offer, 
        'Awaiting Reply', 
        data.size, 
        data.color, 
        data.notes, 
        data.image
      ]
    });
    console.log('[Data] Negotiation saved successfully');
  } catch (e) {
    console.error('[Data] Failed to save negotiation:', e);
  }
}

const createNotification = async (userId, message) => {
  try {
    await db.execute({
      sql: "INSERT INTO notifications (user_id, message, is_unread) VALUES (?, ?, 1)",
      args: [userId, message]
    })
    console.log(`[Notification] Created for ${userId}: ${message}`)
  } catch (e) {
    console.error('[Notification] Failed to create:', e)
  }
}

const handleUpdateOrderStatus = async (data) => {
  console.log('[Data] Updating order status:', data);
  try {
    await db.execute({
      sql: "UPDATE orders SET status = ? WHERE id = ?",
      args: [data.status, data.orderId]
    })
    
    showToast(`Order status updated to ${data.status}`, 'success')
    
    // Notify the customer
    let msg = `Your order for "${data.itemName}" has been updated to: ${data.status}!`
    if (data.status === 'Stitching') msg = `Great news! Your "${data.itemName}" is now being stitched. 🧵✨`
    if (data.status === 'Shipped') msg = `Your "${data.itemName}" has been shipped and is on its way! 🚚💨`
    if (data.status === 'Delivered') msg = `Your heritage piece "${data.itemName}" has been delivered. Enjoy! 📦🎊`
    
    await createNotification(data.customerId, msg)
    await fetchInitialData()
  } catch (e) {
    console.error('[Data] Failed to update order status:', e)
    showToast('Failed to update status', 'error')
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
    showToast('Heritage feedback received! Thank you.', 'success')
    navigateTo('settings');
  } catch (e) {
    console.error('Feedback error:', e);
  } finally {
    isGlobalLoading.value = false;
  }
}

const handleWriteReview = async (data) => {
  if (selectedProduct.value?.id === undefined) return
  isGlobalLoading.value = true
  loadingMessage.value = 'Publishing your heritage review...'
  try {
    await db.execute({
      sql: 'INSERT INTO reviews (product_id, user_id, rating, text) VALUES (?, ?, ?, ?)',
      args: [selectedProduct.value.id, userData.value.id, data.rating, data.text]
    })
    showToast('Review shared with the Tribe!', 'success')
    navigateTo('product-details', { selectedProduct: selectedProduct.value })
  } catch (e) {
    console.error('Review error:', e)
    showToast('Error sharing review. Please try again.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const handleProductDelete = async (productId) => {
  isGlobalLoading.value = true;
  loadingMessage.value = 'Removing heritage item...';
  try {
    await db.execute({
      sql: "DELETE FROM favorites WHERE product_id = ?",
      args: [productId]
    })
    await db.execute({
      sql: "DELETE FROM reviews WHERE product_id = ?",
      args: [productId]
    })
    await db.execute({
      sql: "DELETE FROM products WHERE id = ? AND owner_id = ?",
      args: [productId, userData.value.id]
    })
    showToast('Item removed successfully.', 'success')
    await fetchInitialData()
    navigateTo('home')
  } catch (e) {
    console.error('Delete product error:', e)
    showToast('Error deleting item. Please try again.', 'error')
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
    showToast(`Role successfully switched to ${newRole === 'supplier' ? 'Tailor' : 'Buyer'}!`, 'success')
  } catch (e) {
    console.error('Role update error:', e)
    showToast('Error switching roles. Please try again.', 'error')
  } finally {
    isGlobalLoading.value = false
  }
}

const handleLogout = () => {
  userData.value = { 
    id: 'guest', username: 'johnabram', firstName: 'John', lastName: 'Abram', email: 'johnabram@gmail.com', whatsapp: '+255700000000', avatar: 'https://i.pravatar.cc/150?u=johnabram', userType: 'buyer', needs: '', gives: '', theme: 'light', profileViews: 0 
  };
  setStored('user_data', userData.value);
  setStored('favorites', []);
  navigateTo('login');
}

const handleSearch = async (query, navigate = true) => {
  if (!query.trim()) {
    searchResults.value = { query: '', products: [], tailors: [] }
    return
  }
  
  if (navigate) {
    const history = [query, ...searchHistory.value.filter(h => h !== query)].slice(0, 5)
    searchHistory.value = history
    setStored('search_history', history)
    isGlobalLoading.value = true;
    loadingMessage.value = 'Searching the heritage...';
  }

  try {
    // Fuzzy logic: match parts of words and prioritize start-of-word matches
    const exact = `${query.toLowerCase()}%`;
    const fuzzy = `%${query.toLowerCase()}%`;
    
    // 1. Search Products (Enhanced Relevance)
    const prodRes = await db.execute({
      sql: `
        SELECT p.*, u.username as owner_username, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR p.material LIKE ?
           OR p.name LIKE ? OR c.name LIKE ?
        ORDER BY 
          CASE 
            WHEN p.name LIKE ? THEN 1 -- Exact start match
            WHEN c.name LIKE ? THEN 2 -- Category start match
            WHEN p.name LIKE ? THEN 3 -- Fuzzy match
            ELSE 4
          END ASC,
          p.likes_count DESC
        LIMIT ${navigate ? 50 : 8}
      `,
      args: [exact, fuzzy, exact, fuzzy, fuzzy, fuzzy, exact, exact, fuzzy]
    });

    // 2. Search Tailors (Fuzzy)
    const tailorRes = await db.execute({
      sql: `
        SELECT id, username, first_name, last_name, avatar, gives as bio
        FROM users
        WHERE user_type = 'supplier' AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR gives LIKE ?)
        ORDER BY 
          CASE WHEN username LIKE ? THEN 1 ELSE 2 END ASC
        LIMIT ${navigate ? 20 : 4}
      `,
      args: [fuzzy, fuzzy, fuzzy, fuzzy, exact]
    })

    let favoriteIds = [];
    if (userData.value.id !== 'guest') {
      const favRes = await db.execute({
        sql: "SELECT product_id FROM favorites WHERE user_id = ?",
        args: [userData.value.id]
      });
      favoriteIds = favRes.rows.map(f => f.product_id);
    }

    searchResults.value = {
      query,
      products: prodRes.rows.map(p => ({ ...p, liked: favoriteIds.includes(p.id) })),
      tailors: tailorRes.rows.map(t => ({
        ...t,
        name: `${t.first_name} ${t.last_name}`,
        isVerified: true 
      }))
    }
    
    if (navigate) {
      navigateTo('search-results');
    }
  } catch (e) {
    console.error('Search error:', e);
  } finally {
    if (navigate) isGlobalLoading.value = false;
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

// Router Event Handlers Mapping
const handleGoBack = () => router.back()
const handleGoChat = (userId) => {
  if (!userId) {
    console.error('handleGoChat ERROR: userId is missing');
    return;
  }
  router.push({ name: 'chat-detail', params: { userId } })
}
</script>

<template>
  <Analytics />
  <div class="app-wrapper">
    <WebHeader 
      v-if="showNavBar" 
      :active-tab="currentScreen"
      :theme="theme"
      :t="t"
      @navigate="navigateTo"
      @go-notifications="navigateTo('notifications')"
      @toggle-theme="() => theme = (theme === 'light' ? 'dark' : 'light')"
    />

    <main id="main-content" :class="{ 'with-nav': showNavBar }">
      <router-view v-slot="{ Component }">
        <keep-alive include="Home">
          <component :is="Component" 
            :language="currentLanguage"
          :t="t"
          :theme="theme"
          :user-data="userData"
          :categories="categories"
          :trending-products="trendingProducts"
          :trending-sellers="trendingSellers"
          :explore-items="filteredExploreItems"
          :favorite-items="favoriteItems"
          :product-count="userProductCount"
          :product-id="selectedProduct?.id"
          :current-user-id="userData.id"
          :category="selectedCategory"
          :seller="selectedSeller"
          :results="searchResults"
          :notifications="userNotifications"
          :editing-product="selectedEditProduct"
          :search-history="searchHistory"
          :is-loading="isDeepLoading"
          
          @select-language="(lang) => currentLanguage = lang"
          @loaded="userData.id !== 'guest' ? navigateTo('home') : navigateTo('login')"
          @go-signup="navigateTo('signup')"
          @go-login="navigateTo('login')"
          @go-forgot="navigateTo('forgot-password')"
          @go-back="handleGoBack"
          @login="handleLogin"
          @signup="handleSignUp"
          @go-write-review="navigateTo('write-review')"
          @go-edit="(product) => navigateTo('upload-work', { product })"
          @submit="async (data) => {
             if(currentScreen === 'forgot-password') {
               resetEmail.value = data;
               navigateTo('verify-code');
             }
             else if(currentScreen === 'verify-code') navigateTo('reset-password');
             else if(currentScreen === 'reset-password') {
               try {
                 await db.execute({
                   sql: 'UPDATE users SET password = ? WHERE email = ?',
                   args: [data, resetEmail.value]
                 });
                 showToast('Password reset successfully!', 'success');
                 navigateTo('login');
               } catch (e) {
                 console.error('Reset password error:', e);
                 showToast('Error resetting password.', 'error');
               }
             }
             else if(currentScreen === 'feedback') handleFeedback(data);
             else if(currentScreen === 'write-review') handleWriteReview(data);
          }"

          @go-details="(p) => navigateTo('product-details', { selectedProduct: p })"
          @go-notifications="navigateTo('notifications')"
          @go-search="navigateTo('search')"
          @search="handleSearch"
          @go-explore="(name) => navigateTo('explore', { selectedCategory: name || 'Explore more' })"
          @go-categories="navigateTo('category-list')"
          @go-trending="() => navigateTo('explore', { selectedCategory: 'Trending Trends' })"
          @go-tailor="(seller) => navigateTo('tailor-details', { selectedSeller: seller })"
          @toggle-like="toggleLike"
          @go-search-tailor="(tailor) => navigateTo('tailor-details', { selectedSeller: tailor })"
          @toggle-search-favorite="(p) => toggleLike(p)"
          @go-search-details="(p) => navigateTo('product-details', { selectedProduct: p })"
          @go-edit-profile="navigateTo('edit-profile')"
          @go-settings="navigateTo('settings')"
          @go-console="navigateTo('tailor-console')"
          @go-orders="navigateTo('orders')"
          @go-upload="navigateTo('upload-work')"
          @logout="handleLogout"
          @go-reviews="navigateTo('reviews')"
          @go-feedback="navigateTo('feedback')"
          @go-chats="navigateTo('chats')"
          @go-chat="handleGoChat"
          @toggle-favorite="(p) => toggleLike(p)"
          @delete="handleProductDelete"
          @select-category="(name) => navigateTo('explore', { selectedCategory: name })"
          @update:user-data="handleUpdateProfile"
          @update:theme="(val) => theme = val"
          @update:language="(val) => currentLanguage = val"
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
        />
      </keep-alive>
    </router-view>
    </main>

    <NavigationBar 
      v-if="showNavBar" 
      :active-tab="currentScreen"
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
