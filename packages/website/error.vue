<script lang="ts" setup>
import { OButton } from '@opensig/opendesign';
import { useBackgroundStore } from '~/stores/common';
import { storeToRefs } from 'pinia';
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
const backgroundStore = useBackgroundStore();
const { backgroundUrl } = storeToRefs(backgroundStore);
</script>

<template>
  <NuxtLayout>
    <ClientOnly>
      <img :src="backgroundUrl" class="docs-banner" />
      <div class="error">
        <AppEmpty>
          <template #description>
            <OButton href="/" color="primary" variant="outline" size="large">
              {{ $t('common.backHome') }}
            </OButton>
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
  background-color: var(--o-color-ubmc-bg);
  position: relative;
  .status-code {
    color: var(--o-color-info1);
    @include h1;
  }
  .empty-wrap {
    max-width: 320px;
  }
}
.docs-banner {
  position: absolute;
  height: 642px;
  width: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
  z-index: 0;
}
</style>
