<script setup lang="ts">
import { OButton } from '@opensig/opendesign';

const props = withDefaults(
  defineProps<{
    modelValue: number[];
    multiple?: boolean;
  }>(),
  {
    modelValue: () => [],
    multiple: false,
  }
);
const emits = defineEmits(['update:modelValue']);
// 默认31天
const getList = () => {
  let res = [];
  for (let i = 1; i <= 31; i++) {
    res.push(i);
  }
  return res;
};

const list = computed(() => getList());
const checked = ref([]);
const temp = ref([]);
const selectorRef = ref(null);

const init = () => {
  checked.value = [...props.modelValue];
  temp.value = [...props.modelValue];
};

watchEffect(() => {
  init();
});

const confirm = () => {
  emits('update:modelValue', temp.value);
  selectorRef.value.expanded = false;
};

const cancel = () => {
  init();
  selectorRef.value.expanded = false;
};

const clickItem = (val: number) => {
  if (props.multiple) {
    const idx = temp.value.indexOf(val);
    if (idx === -1) {
      temp.value.push(val);
    } else {
      temp.value.splice(idx, 1);
    }
    temp.value.sort();
  } else {
    temp.value = [val];
    confirm();
  }
};

const removeTag = (val: number) => {
  if (props.multiple) {
    clickItem(val);
  } else {
    temp.value = [];
  }
  confirm();
};
</script>

<template>
  <div class="calendar-selector" :class="!multiple && 'is-single'">
    <ElSelect
      ref="selectorRef"
      popper-class="calendar-selector-popper"
      placeholder="请选择重复日期"
      size="large"
      multiple
      collapseTags
      maxCollapseTags="3"
      :modelValue="checked"
      @remove-tag="removeTag"
    >
      <ElOption v-for="t in list" :key="t" :label="t" :value="t" @click="clickItem(t)" :class="temp.includes(t) && 'is-checked'"></ElOption>
      <template #footer v-if="multiple">
        <OButton round="pill" color="primary" variant="outline" @click="confirm">确定</OButton>
        <OButton variant="text" @click="cancel">取消</OButton>
      </template>
    </ElSelect>
  </div>
</template>

<style scoped lang="scss">
.calendar-selector {
  width: 100%;
  :deep(.el-select) {
    .el-select__placeholder {
      @include text1;
    }
    .el-select__icon {
      height: 24px;
      font-size: 24px;
      margin-right: 2px;
      color: var(--o-color-info1);
      background-color: var(--o-color-info2);
      mask: url(~/assets/svg-icons/icon-calendar.svg) no-repeat center;
      background-size: 24px;
      background-repeat: no-repeat;
      background-position: center center;
      transform: rotateZ(0deg);
      svg {
        display: none;
      }
    }
  }
  &.is-single {
    :deep(.el-select) {
      .el-select__selection {
        margin-left: 0;
      }
      .el-tag {
        padding: 0;
        background-color: transparent;
        color: var(--o-color-info1);
        @include text1;
        .el-tag__close {
          display: none;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.calendar-selector-popper {
  padding: 0 24px;
  .el-select-dropdown__list {
    padding: 16px 0;
    display: flex;
    gap: 12px 8px;
    flex-wrap: wrap;
    width: 272px;

    .el-select-dropdown__item {
      padding: 0;
      width: 32px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--o-color-fill2);
      color: var(--o-color-info1);
      border-radius: var(--o-radius-s);
      &:hover,
      &.is-checked {
        background-color: var(--o-color-primary1);
        color: #fff;
        font-weight: inherit;
      }
      &.is-selected {
        font-weight: inherit;
        &::after {
          content: none;
        }
      }
    }
  }
  .el-select-dropdown__footer {
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .o-btn {
      min-width: fit-content;
      &:last-child {
        padding: 0;
      }
    }
  }
}
</style>
