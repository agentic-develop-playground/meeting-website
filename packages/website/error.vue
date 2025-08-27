<script lang="ts" setup>
const props = defineProps({
  error: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

useHead(() => ({
  title: 'error',
}));
if (props.error?.statusCode !== 404) {
  clearError({ redirect: props.error?.url });
}
</script>

<template>
  <NuxtLayout>
    <ClientOnly>
      <div class="error">
        <AppEmpty>
          <template #description>
            <p>找不到页面</p>
          </template>
        </AppEmpty>
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>
<style scoped lang="scss">
.error {
  flex-direction: column;
  align-items: center;
  min-height: 642px;
  display: flex;
  justify-content: center;
  position: relative;
  .status-code {
    color: var(--o-color-info1);
    @include h1;
  }
  .empty-wrap {
    max-width: 320px;
  }
}
</style>
