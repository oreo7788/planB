import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '票迹', keepAlive: true, public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
    meta: { title: '注册', public: true }
  },
  {
    path: '/forgot',
    name: 'Forgot',
    component: () => import('@/views/auth/forgot.vue'),
    meta: { title: '找回密码', public: true }
  },
  {
    path: '/add',
    name: 'Add',
    component: () => import('@/views/add/index.vue'),
    meta: { title: '添加票迹' }
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: () => import('@/views/add/index.vue'),
    meta: { title: '编辑票迹' }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/detail/index.vue'),
    meta: { title: '票迹详情' }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/index.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/tags/index.vue'),
    meta: { title: '标签管理' }
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/views/trash/index.vue'),
    meta: { title: '回收站' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about/index.vue'),
    meta: { title: '关于我们', public: true }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/about/privacy.vue'),
    meta: { title: '隐私政策', public: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/about/terms.vue'),
    meta: { title: '用户协议', public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // 检查登录状态
  const userStore = useUserStore()
  const isPublic = Boolean(to.meta.public)
  if (!userStore.token && !isPublic) {
    // 未登录且访问受限页面，跳转登录
    console.warn('[Router] 未登录，当前页面:', to.path)
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  next()
})

export default router
