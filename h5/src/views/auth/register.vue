<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()

const activeTab = ref<'phone' | 'email'>('phone')
const agree = ref(true)
const loading = ref(false)

const form = ref({
  nickname: '',
  phone: '',
  code: '',
  email: '',
  password: ''
})

const canSubmit = computed(() => {
  if (!form.value.nickname.trim()) return false
  if (activeTab.value === 'phone') {
    return form.value.phone.trim().length > 0 && form.value.code.trim().length > 0
  }
  return form.value.email.trim().length > 0 && form.value.password.trim().length > 0
})

const onSendCode = () => {
  if (!form.value.phone.trim()) {
    showToast('请先输入手机号')
    return
  }
  showToast('验证码发送功能待接入')
}

const onSubmit = async () => {
  if (!agree.value) {
    showToast('请先同意用户协议与隐私政策')
    return
  }
  if (!canSubmit.value) {
    showToast('请完善注册信息')
    return
  }
  loading.value = true
  try {
    // TODO: 接入真实注册接口
    showSuccessToast('注册成功，请登录')
    router.replace('/login')
  } finally {
    loading.value = false
  }
}

const goLogin = () => router.replace('/login')
</script>

<template>
  <div class="page-container auth-page">
    <header class="auth-header">
      <div class="brand">
        <span class="brand-dot"></span>
        <h1 class="brand-title">票迹</h1>
      </div>
      <p class="brand-subtitle">CREATE YOUR TIMELINE</p>
    </header>

    <section class="auth-card card">
      <h2 class="auth-title">创建账号</h2>
      <p class="auth-desc">使用手机号或邮箱快速注册</p>

      <van-field
        v-model="form.nickname"
        label="昵称"
        placeholder="请填写昵称"
        clearable
      />

      <div class="auth-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'phone' }"
          @click="activeTab = 'phone'"
        >
          手机号注册
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'email' }"
          @click="activeTab = 'email'"
        >
          邮箱注册
        </button>
      </div>

      <div v-if="activeTab === 'phone'" class="auth-form">
        <van-field
          v-model="form.phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          clearable
        />
        <van-field
          v-model="form.code"
          label="验证码"
          placeholder="请输入验证码"
          clearable
        >
          <template #button>
            <van-button size="small" type="primary" plain @click="onSendCode">
              获取验证码
            </van-button>
          </template>
        </van-field>
      </div>

      <div v-else class="auth-form">
        <van-field
          v-model="form.email"
          type="email"
          label="邮箱"
          placeholder="请输入邮箱"
          clearable
        />
        <van-field
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="设置登录密码"
          clearable
        />
      </div>

      <div class="auth-actions">
        <van-checkbox v-model="agree" icon-size="16">
          我已阅读并同意
          <span class="link" @click.stop="router.push('/terms')">用户协议</span>
          和
          <span class="link" @click.stop="router.push('/privacy')">隐私政策</span>
        </van-checkbox>
      </div>

      <van-button
        block
        type="primary"
        round
        :loading="loading"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        注册
      </van-button>
    </section>

    <div class="auth-footer">
      <span>已有账号？</span>
      <button class="text-link" @click="goLogin">立即登录</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-page {
  padding: 24px 16px 40px;
}

.auth-header {
  margin: 12px 0 24px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.brand-subtitle {
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-secondary);
}

.auth-card {
  padding: 24px;
}

.auth-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.auth-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.auth-tabs {
  display: flex;
  gap: 8px;
  background: var(--bg-gray);
  border-radius: var(--radius-full);
  padding: 4px;
  margin: 16px 0;
}

.tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  padding: 8px 0;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);

  &.active {
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }
}

.auth-actions {
  margin: 12px 0 18px;
  font-size: 12px;

  .link {
    color: var(--primary-color);
    margin: 0 2px;
  }
}

.text-link {
  border: none;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 12px;
}

.auth-footer {
  text-align: center;
  margin-top: 18px;
  color: var(--text-secondary);
  font-size: 13px;
  display: flex;
  justify-content: center;
  gap: 6px;
}
</style>
