import { COOKIE_KEY, disableOA, enableOA, isCookieAgreed } from './index';

// 监听cookie set
export default function startListenCookieSet() {
  if (isCookieAgreed()) {
    enableOA();
  }
  const origDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
  Object.defineProperty(Document.prototype, '_cookie', origDesc);
  Object.defineProperty(Document.prototype, 'cookie', {
    ...origDesc,
    get() {
      return this['_cookie'];
    },
    set(val: string) {
      try {
        const detail = val.split(';')[0].split('=');
        if (detail[0] === COOKIE_KEY) {
          if (detail[1] === '1') {
            enableOA();
          } else {
            disableOA();
          }
        }
      } finally {
        this['_cookie'] = val;
      }
    },
  });
}
