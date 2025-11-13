<script setup lang="ts">
import { onMounted } from 'vue';

import { getThirdPartyLoginCallback, bindThirdParty } from '@/api/api-setting';

const route = useRoute();

const loginSuccess = () => {
  const data = {
    type: 'authorization_response',
    response: 'success',
  };
  window.opener.postMessage(data, location.href);
};

const login = () => {
  if (route.params.id && route.query.code && route.query.client_id) {
    const param = {
      code: route.query.code as string,
      state: route.query.state as string,
      client_id: route.query.client_id,
    };
    getThirdPartyLoginCallback(route.params.id as string, param).then((res) => {
      const params = {
        bind_token: res.data,
        state: route.query.state as string,
      };
      bindThirdParty(params).then(() => {
        loginSuccess();
      });
    });
  }
};

onMounted(() => {
  login();
});
</script>

<template>
  <div></div>
</template>
