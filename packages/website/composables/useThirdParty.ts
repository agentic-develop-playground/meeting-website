import { onMounted, onUnmounted, ref } from 'vue';
import { getUrlByParams } from '@/utils/common';

import { useMessage } from '@opensig/opendesign';

import { requestUserInfo } from '@/utils/login';

export const useThirdParty = () => {
  const message = useMessage();

  const windowOpener = ref();
  const login = (data: any) => {
    const url = '/api-oneid/oneid-workbench/third-party/authorize';
    const params = {
      client_id: import.meta.env.VITE_CLIENT_ID,
      conn_id: data.connection_id,
      t: new Date().getTime(),
    };

    const width = 500;
    const height = 700;
    windowOpener.value = window.open(
      getUrlByParams(url, params),
      '_blank',
      `width=${width},height=${height},left=${(screen.width - width) / 2},top=${(screen.height - height) / 2}`
    );
  };

  const bind = (data: any) => {
    login(data);
  };

  const complete = (e: MessageEvent) => {
    const { type, response } = e.data;
    if (type !== 'authorization_response') {
      return;
    }
    if (response === 'success') {
      requestUserInfo();
      windowOpener.value?.close();

      // 绑定绑定
      message.success({
        content: '绑定成功',
      });
    }
  };

  // 监听三方登录结果
  onUnmounted(() => {
    // 移除监听
    window.removeEventListener('message', complete);
  });

  onMounted(() => {
    window.addEventListener('message', complete);
  });

  return {
    login,
    bind,
  };
};
