<script setup lang="ts">
</script>

<template>
  <div class="page-container policy-page">
    <!-- 导航栏 -->
    <van-nav-bar title="隐私政策" left-arrow @click-left="$router.back()" />

    <div class="content">
      <h2>票迹隐私政策</h2>
      <p class="update-time">更新日期：2024年1月1日</p>

      <section>
        <h3>引言</h3>
        <p>
          欢迎使用票迹（以下简称"我们"或"本应用"）。我们非常重视用户的隐私保护，
          本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
        </p>
      </section>

      <section>
        <h3>一、我们收集的信息</h3>
        <h4>1. 您主动提供的信息</h4>
        <ul>
          <li>微信账号信息（头像、昵称）</li>
          <li>手机号码（可选，用于账号找回）</li>
          <li>您上传的票据照片和相关信息</li>
        </ul>
        
        <h4>2. 自动收集的信息</h4>
        <ul>
          <li>设备信息（设备型号、操作系统版本）</li>
          <li>日志信息（访问时间、使用时长）</li>
        </ul>
      </section>

      <section>
        <h3>二、信息的使用</h3>
        <p>我们收集的信息将用于：</p>
        <ul>
          <li>提供、维护和改进我们的服务</li>
          <li>创建和管理您的账户</li>
          <li>响应您的请求和问题</li>
          <li>发送服务相关通知</li>
        </ul>
      </section>

      <section>
        <h3>三、信息的存储和保护</h3>
        <p>
          我们采用业界标准的安全措施来保护您的个人信息，包括但不限于：
        </p>
        <ul>
          <li>数据加密传输（HTTPS）</li>
          <li>数据加密存储</li>
          <li>访问权限控制</li>
          <li>定期安全审计</li>
        </ul>
      </section>

      <section>
        <h3>四、信息的共享</h3>
        <p>
          除以下情况外，我们不会与任何第三方共享您的个人信息：
        </p>
        <ul>
          <li>获得您的明确同意</li>
          <li>法律法规要求</li>
          <li>保护我们或用户的合法权益</li>
        </ul>
      </section>

      <section>
        <h3>五、您的权利</h3>
        <p>您有权：</p>
        <ul>
          <li>访问和更新您的个人信息</li>
          <li>删除您的账户和相关数据</li>
          <li>撤回您的授权同意</li>
        </ul>
      </section>

      <section>
        <h3>六、联系我们</h3>
        <p>
          如您对本隐私政策有任何疑问，请通过应用内的"意见反馈"功能联系我们。
        </p>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.policy-page {
  background: var(--bg-card);
  min-height: 100vh;
}

.content {
  padding: 20px 16px;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
    text-align: center;
  }
  
  .update-time {
    font-size: 13px;
    color: var(--text-placeholder);
    text-align: center;
    margin: 0 0 24px;
  }
  
  section {
    margin-bottom: 24px;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 12px;
  }
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 12px 0 8px;
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.8;
    margin: 0 0 12px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 2;
    }
  }
}
</style>
