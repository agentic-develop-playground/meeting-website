import { isClient } from '@opensig/opendesign';
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

export enum Size {
  Phone = 'phone',
  PadV = 'pad_v',
  PadH = 'pad_h',
  Laptop = 'laptop',
  Pc = 'pc',
}

export type ScreenSizeT = typeof Size.Phone | Size.PadV | Size.PadH | Size.Laptop | Size.Pc;

export const ScreenConfig = {
  [Size.Phone]: 600,
  [Size.PadV]: 840,
  [Size.PadH]: 1200,
  [Size.Laptop]: 1440,
  [Size.Pc]: 1920,
};

/**
 * lt: less than, 小于 <
 * le: less than or equal to, 小于等于 <=
 * eq: equal to, 等于 =
 * ne: never equal to, 不等于 !=
 * ge: greater than or equal to, 大于等于 >=
 * gt: greater than, 大于 >
 */
export type CompareT = 'lt' | 'le' | 'eq' | 'ne' | 'ge' | 'gt';

const CompareHandler = {
  lt: (a: number, b: number) => a < b,
  le: (a: number, b: number) => a <= b,
  eq: (a: number, b: number) => a === b,
  ne: (a: number, b: number) => a !== b,
  ge: (a: number, b: number) => a >= b,
  gt: (a: number, b: number) => a > b,
};

export const useScreen = () => {
  const screenSize = reactive({
    width: isClient ? window.innerWidth : 0,
    height: isClient ? window.innerHeight : 0,
  });

  const current = ref<ScreenSizeT>(Size.Laptop);

  const getSize = (w?: number) => {
    const width = w ?? screenSize.width;
    if (width < ScreenConfig[Size.Phone]) {
      return Size.Phone;
    } else if (width < ScreenConfig[Size.PadV]) {
      return Size.PadV;
    } else if (width < ScreenConfig[Size.PadH]) {
      return Size.PadH;
    } else if (width < ScreenConfig[Size.Laptop]) {
      return Size.Laptop;
    } else {
      return Size.Pc;
    }
  };

  const compare = (type: CompareT = 'eq', size: ScreenSizeT) => {
    const w1 = screenSize.width;
    const w2 = ScreenConfig[size];
    const handler = CompareHandler[type];
    return handler(w1, w2);
  };

  /**
   * phone
   */
  const isPhone = computed(() => compare('le', Size.Phone)); // [0, 600]
  const gtPhone = computed(() => compare('gt', Size.Phone)); // [601, -]

  /**
   * pad
   */
  const lePad = computed(() => compare('le', Size.PadH)); // [0, 1200]
  const isPad = computed(() => compare('le', Size.PadH) && compare('gt', Size.Phone)); // [601, 1200]
  const gtPad = computed(() => compare('gt', Size.PadH)); // [1201, -]

  /**
   * pad_v
   */
  const isPadV = computed(() => compare('gt', Size.Phone) && compare('le', Size.PadV)); // [601, 840]
  const lePadV = computed(() => compare('le', Size.PadV)); // [0, 840]
  const gtPadV = computed(() => compare('gt', Size.PadV)); // [841, -]

  /**
   * laptop
   */
  const leLaptop = computed(() => compare('le', Size.Laptop)); // [0, 1440]
  const isLaptop = computed(() => compare('le', Size.Laptop) && compare('gt', Size.PadH)); // [1201, 1440]
  const gtLaptop = computed(() => compare('gt', Size.Laptop)); // [1441, -]

  const onWindowResize = () => {
    screenSize.width = window.innerWidth;
    screenSize.height = window.innerHeight;
    current.value = getSize();
  };

  onMounted(() => {
    if (isClient) {
      onWindowResize();
      window.addEventListener('resize', onWindowResize);
    }
  });

  onUnmounted(() => {
    if (isClient) {
      window.removeEventListener('resize', onWindowResize);
    }
  });

  return {
    // 获取屏幕宽度分级
    getSize,
    // 当前屏幕分级
    current,
    // 当前屏幕宽度
    size: screenSize,

    isPhone, // [0, 600]
    gtPhone, // [601, -]

    isPad, // [601, 1200]
    lePad, // [0, 1200]
    gtPad, // [1201, -]

    isPadV, // [601, 840]
    lePadV, // [0, 840]
    gtPadV, // [841, -]

    isLaptop, // [1201, 1440]
    leLaptop, // [0, 1440]
    gtLaptop, // [1441, -]
  };
};
