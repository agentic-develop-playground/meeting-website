import { OpenAnalytics, OpenEventKeys, getClientInfo } from '@opensig/open-analytics';
import type { Directive } from 'vue';

const COOKIE_KEY = 'agreed-cookiepolicy';
const isCookieAgreed = () => document.cookie.match(/\bagreed-cookiepolicy=(.+?);?/)?.[1] === '1';

export const oa = new OpenAnalytics({
  appKey: 'openUBMC',
  request: (data) => {
    if (!isCookieAgreed()) {
      disableOA();
      return;
    }
    fetch('/api-dsapi/query/track/openubmc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
});

let perfReported = false;
export const enableOA = () => {
  if (oa.enabled) return;
  oa.setHeader(getClientInfo());
  oa.enableReporting(true);
  if (!initiallyAgreed) {
    reportPV();
  }
  if (!perfReported) {
    perfReported = true;
    reportPerformance();
  }
};

export const disableOA = () => {
  oa.enableReporting(false);
  ['oa-openUBMC-client', 'oa-openUBMC-events', 'oa-openUBMC-session'].forEach((key) => {
    localStorage.removeItem(key);
  });
};

export const reportPV = ($referrer?: string) => {
  oaReport(OpenEventKeys.PV, $referrer && { $referrer });
};

export const reportPerformance = () => {
  oaReport(OpenEventKeys.LCP);
  oaReport(OpenEventKeys.INP);
  oaReport(OpenEventKeys.PageBasePerformance);
};

interface ReportOpt {
  immediate?: boolean;
  eventOptions?: any;
}

enum ReportServiceKey {
  PORTAL = 'portal',
}

const reportFnObj = {} as Record<ReportServiceKey, (event: string, data?: any, option?: any) => void | Promise<void>>;

type EventData = Record<string, any> | Promise<Record<string, any>>;

export const getReportFn = (service: ReportServiceKey = ReportServiceKey.PORTAL) => {
  return (reportFnObj[service] ??= (event: string, data?: EventData, options?: ReportOpt) => {
    if (!oa.enabled) {
      return;
    }
    return oa.report(
      event,
      async (...opt) => {
        return {
          $service: service,
          ...(typeof data === 'function' ? await data(...opt) : data),
        };
      },
      options
    );
  });
};

export const oaReport = getReportFn();

// ----------------cookie----------------
let initiallyAgreed = false;
if (isCookieAgreed()) {
  enableOA();
  initiallyAgreed = true;
} else {
  disableOA();
}
(() => {
  // 监听cookie set
  const origDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')!;
  Object.defineProperty(Document.prototype, '_cookie', origDesc);
  Object.defineProperty(Document.prototype, 'cookie', {
    ...origDesc,
    get() {
      return this['_cookie'];
    },
    set(val: string) {
      try {
        const detail = val
          .split(';')
          .map((v) => v.split('='))
          .reduce(
            (acc, [k, v], idx) => {
              if (idx === 0) {
                acc.key = decodeURIComponent(k.trim());
                acc.value = decodeURIComponent(v.trim());
              } else {
                acc.options[decodeURIComponent(k.trim())] = decodeURIComponent(v.trim());
              }
              return acc;
            },
            { key: '', value: '', options: {} as Record<string, string> }
          );
        this['_cookie'] = val;
        document.dispatchEvent(new CustomEvent('cookiechange', { detail }));
      } catch {
        this['_cookie'] = val;
      }
    },
  });
})();
document.addEventListener('cookiechange', (ev) => {
  const detail = (ev as CustomEvent).detail;
  if (detail?.key === COOKIE_KEY) {
    if (detail.value === '1') {
      enableOA();
    } else {
      disableOA();
    }
  }
});

// ----------------自动上报PV----------------
let referrer: string;
['replaceState', 'pushState'].forEach((method) => {
  const native = History.prototype[method as 'replaceState' | 'pushState'];
  History.prototype[method as 'replaceState' | 'pushState'] = function (data: any, unused: string, url?: string | URL | null) {
    try {
      if (oa.enabled) {
        const beforePath = location.pathname;
        native.call(this, data, unused, url);
        const afterPath = location.pathname;
        if (beforePath !== afterPath) {
          reportPV(referrer);
        }
      } else {
        native.call(this, data, unused, url);
      }
    } catch {
      native.call(this, data, unused, url);
    } finally {
      referrer = location.href;
    }
  };
});

window.addEventListener('popstate', () => {
  if (oa.enabled) {
    const prevPath = new URL(referrer).pathname;
    if (prevPath !== location.pathname) {
      reportPV(referrer);
    }
  }
  referrer = location.href;
});

// ----------------自定义指令----------------
interface AnalyzeData {
  event?: string;
  service?: ReportServiceKey;
  properties?: object;
}
const fromBubble = Symbol();
const isObj = (val: any): val is object => typeof val === 'object' && val !== null;
const isFromBubble = (ev: Event): ev is CustomEvent => ev instanceof CustomEvent && fromBubble === ev.detail?.fromBubble;
export const vAnalytics: Directive<HTMLElement, MaybeRef<AnalyzeData> | ((ev: Event) => AnalyzeData | undefined) | undefined> = {
  mounted(el, binding) {
    const event = binding.arg || 'click';
    el.addEventListener(event, (ev) => {
      if (binding.modifiers.bubble) {
        ev.stopPropagation();
      }
      let val: AnalyzeData | undefined;
      if (typeof binding.value === 'function') {
        val = binding.value(ev);
      } else {
        val = unref(binding.value);
      }
      if (isObj(val)) {
        if (binding.modifiers.bubble) {
          if (isFromBubble(ev) && isObj(ev.detail.data)) {
            val = { ...val, ...ev.detail.data };
          }
          (ev.currentTarget as HTMLElement).parentElement?.dispatchEvent(
            new CustomEvent(event, {
              detail: {
                data: val,
                fromBubble,
              },
              bubbles: true,
            })
          );
        } else if (binding.modifiers.catchBubble) {
          if (isFromBubble(ev) && isObj(ev.detail.data)) {
            val = {
              ...val,
              properties: { ...val.properties, ...ev.detail.data },
            };
            getReportFn(val.service)(val.event || event, { ...val.properties, $url: location.href });
          }
        } else {
          if (isFromBubble(ev)) return;
          getReportFn(val.service)(val.event || event, { ...val.properties, $url: location.href });
        }
      }
    });
  },
};
