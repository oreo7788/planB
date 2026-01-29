<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()

const activeTab = ref<'phone' | 'email'>('phone')
const loading = ref(false)

const form = ref({
  phone: '',
  code: '',
  email: '',
  password: ''
})

const canSubmit = computed(() => {
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
  if (!canSubmit.value) {
    showToast('请完善重置信息')
    return
  }
  loading.value = true
  try {
    // TODO: 接入真实重置密码接口
    showSuccessToast('密码已重置，请登录')
    router.replace('/login')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container auth-page">
    <header class="auth-header">
      <div class="brand">
        <span class="brand-dot"></span>
        <h1 class="brand-title">找回密码</h1>
      </div>
      <p class="brand-subtitle">RESET PASSWORD</p>
    </header>

    <section class="auth-card card">
      <h2 class="auth-title">重置登录凭证</h2>
      <p class="auth-desc">请选择手机号或邮箱方式</p>

      <div class="auth-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'phone' }"
          @click="activeTab = 'phone'"
        >
          手机号验证
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'email' }"
          @click="activeTab = 'email'"
        >
          邮箱验证
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
          label="新密码"
          placeholder="请输入新密码"
          clearable
        />
      </div>

      <van-button
        block
        type="primary"
        round
        :loading="loading"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        重置密码
      </van-button>
    </section>

    <div class="auth-footer">
      <button class="text-link" @click="router.replace('/login')">
        返回登录
      </button>
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
  font-size: 24px;
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
  font-size: 18px;
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
  margin-bottom: 16px;
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
}
</style>
