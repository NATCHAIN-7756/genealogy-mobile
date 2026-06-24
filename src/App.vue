<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f7f8fa;
  min-height: 100vh;
}

/* Vant Toast 提示框样式修复 */
.van-toast {
  background: rgba(0, 0, 0, 0.7) !important;
  color: #fff !important;
}
.van-toast__text {
  color: #fff !important;
}
.van-toast--fail {
  background: rgba(255, 0, 0, 0.8) !important;
}
.van-toast--success {
  background: rgba(7, 193, 96, 0.9) !important;
}
.van-toast--loading {
  background: rgba(0, 0, 0, 0.7) !important;
}

/* Vant Notify 通知样式修复 */
.van-notify {
  padding: 12px 16px !important;
}
.van-notify__content {
  color: #fff !important;
}

/* 弹窗表单标签颜色修复 */
.van-popup .van-cell__title,
.van-popup .van-field__label,
.van-popup .van-radio__label,
.van-popup .van-checkbox__label {
  color: #323233 !important;
}

/* 通用文字颜色修复 */
.van-cell__value,
.van-cell__label {
  color: #646566 !important;
}
</style>
