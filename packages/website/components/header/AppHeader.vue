<script setup lang="ts"></script>

<template>
  <div class="app-header">
    <div class="app-header-wrap">
      <div class="header-content content-width">
        <div class="header-left">
          <!-- LOGO -->
          <HeaderLogo />
        </div>

        <div class="header-right">
          <!-- 用户 -->
          <HeaderUser />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  color: var(--o-color-info1);
  background-color: var(--o-color-fill2);
  &::before {
    top: 0;
    bottom: 0;
    right: 0;
    box-shadow: 0 3px 8px rgba(var(--o-mixedgray-14), 0.05);
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
  }
}
.app-header-wrap {
  position: relative;
  height: 100%;
  width: var(--grid-layout-width);
  padding-left: var(--grid--layout-padding);
  padding-right: var(--grid--layout-padding);
  margin: 0 auto;
}
.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}
.header-left,
.header-right {
  height: 100%;
  display: flex;
  align-items: center;
  animation: anim-header-trans-in var(--o-duration-xl);
}
@keyframes anim-header-trans-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.header-logo {
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
}

@include respond-to('<=pad_v') {
  .app-header {
    display: none;
  }
}
</style>
