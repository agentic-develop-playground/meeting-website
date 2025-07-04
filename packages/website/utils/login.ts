const LOGIN_URL = import.meta.env.VITE_LOGIN_ORIGIN;

// 登录
export async function doLogin() {
  try {
    window.location.href = `${LOGIN_URL}/oneid/oidc/authorize?response_type=code&access_type=offline&client_id=114589635&redirect_uri=${encodeURIComponent(window.location.href)}&scope=openid+profile`;
  } catch {
    return null;
  }
}
