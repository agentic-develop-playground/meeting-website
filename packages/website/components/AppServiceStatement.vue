<script setup lang="ts">
import { ref, watch } from 'vue';
import { ODialog, OLink, OButton } from '@opensig/opendesign';

import { doLogout, tryLogin } from '@/utils/login';
import { useLoginStore, useUserInfoStore } from '@/stores/user';
import { baseInfo, getPrivacyVersion } from '@/api/api-user';

const route = useRoute();

const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();

const dialogVisible = ref(false);
const cancelVisible = ref(false);
const updateVisible = ref(false);

// -------------------- 更新签署 --------------------
const version = ref('');
const getVersion = () => {
  getPrivacyVersion().then((res) => {
    version.value = res.data.oneidPrivacyAccepted;
  });
};
getVersion();

const accept = () => {
  agree();
};
const reject = () => {
  disagree();
};

// -------------------- 签署隐私 --------------------
const params = ref({
  oneidPrivacyAccepted: '',
});
const agree = () => {
  params.value.oneidPrivacyAccepted = version.value;
  baseInfo(params.value)
    .then(() => {
      dialogVisible.value = false;
      tryLogin();
    })
    .catch(() => {
      disagree();
    });
};
const disagree = () => {
  dialogVisible.value = false;
  cancelVisible.value = false;
  updateVisible.value = false;
  doLogout();
};
watch(
  () => [userInfoStore.oneidPrivacyAccepted, version.value, route.path],
  (val) => {
    if (
      val[0] &&
      !val[2].includes('privacy') &&
      !val[2].includes('legal') &&
      !val[2].includes('cookies') &&
      !val[2].includes('personal-data-collection-overview')
    ) {
      dialogVisible.value = false;
      updateVisible.value = false;
      if (val[0] && val[0] === 'revoked' && loginStore.isLoggingIn) {
        dialogVisible.value = true;
      }
      if (val[0] && val[0] !== 'revoked' && val[1] && val[0] !== val[1]) {
        updateVisible.value = true;
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <ODialog v-model:visible="dialogVisible" :hide-close="true" :style="{ '--dlg-width': '728px', '--dlg-inner-gap': '16px' }" class="service-statement-dialog">
    <template #header>openSource-Ascend 社区服务声明</template>
    <div class="body-content">
      <span
        >尊敬的 openSource-Ascend
        社区用户，为了给您提供更好的服务，需要您同意本社区收集您在openSource-Ascend社区的个人信息，并让您更清楚了解我们如何处理和保护您的个人信息。请阅读并同意</span
      >
      <OLink color="primary" href="/legal" target="_blank" class="legal-link hover-underline">《法律声明》</OLink>、
      <OLink color="primary" href="/privacy" target="_blank" class="privacy-link hover-underline">《隐私政策》</OLink>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" variant="outline" size="large" @click="agree">我已阅读并同意</OButton>
        <OButton color="primary" variant="outline" size="large" @click="disagree">不同意</OButton>
      </div>
    </template>
  </ODialog>
  <ODialog v-model:visible="updateVisible" :hide-close="true" :style="{ '--dlg-width': '728px', '--dlg-inner-gap': '16px' }" class="change-dialog">
    <template #header>openSource-Ascend 社区隐私政策变更声明</template>
    <div class="body-content">
      <span>尊敬的 openSource-Ascend 社区用户，为了给您提供更好的服务，并让您更清楚了解我们如何处理和保护您的个人信息，我们更新了</span>
      <OLink color="primary" href="/privacy" target="_blank" class="privacy-link hover-underline">《隐私政策》</OLink>
      请您详细阅读并同意政策声明。
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" variant="outline" size="large" @click="accept">全部接受</OButton>
        <OButton color="primary" variant="outline" size="large" @click="reject">全部拒绝</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.o-link {
  display: inline;
}
.dialog-footer {
  text-align: center;
  margin-top: 8px;
}
.o-btn + .o-btn {
  margin-left: 16px;
}
</style>
