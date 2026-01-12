<script setup lang="ts">
</script>

<template>
  <div class="page-container policy-page">
    <!-- 导航栏 -->
    <van-nav-bar title="用户协议" left-arrow @click-left="$router.back()" />

    <div class="content">
      <h2>票迹用户服务协议</h2>
      <p class="update-time">更新日期：2024年1月1日</p>

      <section>
        <h3>一、服务说明</h3>
        <p>
          票迹是一款帮助用户收藏票据、记录人生轨迹的应用。
          用户可以通过本应用记录各类票据信息，包括但不限于电影票、演出票、火车票、机票等。
        </p>
      </section>

      <section>
        <h3>二、账号注册与使用</h3>
        <ul>
          <li>用户需通过微信授权登录使用本服务</li>
          <li>用户应妥善保管账号信息，对账号下的所有行为负责</li>
          <li>禁止将账号转让、出租或借用给他人</li>
        </ul>
      </section>

      <section>
        <h3>三、用户内容规范</h3>
        <p>用户上传的内容应符合以下规范：</p>
        <ul>
          <li>不得上传违反法律法规的内容</li>
          <li>不得上传侵犯他人权益的内容</li>
          <li>不得上传虚假、误导性信息</li>
          <li>不得上传含有恶意代码的文件</li>
        </ul>
      </section>

      <section>
        <h3>四、服务变更与中止</h3>
        <p>
          我们保留随时修改或中止服务的权利。对于服务的变更，我们会提前通知用户。
          因不可抗力导致的服务中断，我们不承担责任。
        </p>
      </section>

      <section>
        <h3>五、免责声明</h3>
        <ul>
          <li>用户上传的内容由用户自行负责</li>
          <li>因用户操作不当导致的数据丢失，我们不承担责任</li>
          <li>对于第三方链接或服务，我们不承担责任</li>
        </ul>
      </section>

      <section>
        <h3>六、知识产权</h3>
        <p>
          本应用的所有内容（除用户上传内容外），包括但不限于文字、图片、代码、界面设计等，
          均归我们所有。未经许可，不得复制、修改、传播。
        </p>
      </section>

      <section>
        <h3>七、协议修改</h3>
        <p>
          我们保留随时修改本协议的权利。修改后的协议将在应用内公布，
          继续使用本服务即视为同意修改后的协议。
        </p>
      </section>

      <section>
        <h3>八、联系方式</h3>
        <p>
          如您对本协议有任何疑问，请通过应用内的"意见反馈"功能联系我们。
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
