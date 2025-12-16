<script setup lang="ts">
import {
  OCheckbox,
  OCheckboxGroup,
  ODivider,
  OIcon,
  OIconFilter,
  OIconSearch,
  OInput,
  OLink,
  OPopover,
  OPopup,
  ORadio,
  ORadioGroup,
  OScroller,
} from '@opensig/opendesign';
import { computed, ref, watch, type PropType } from 'vue';
import { onClickOutside, useDebounceFn, useVModel } from '@vueuse/core';

import IconLoading from '~icons/app/icon-loading.svg';
import { useCheckbox } from '@/composables/useCheckbox';
import useScrollBottom from '@/composables/useScrollBottom';

type ValueT = string | { label: string; value: string };

const props = defineProps({
  /** 多选值 */
  options: {
    type: Array as PropType<ValueT[]>,
    default: () => [],
  },
  modelValue: {
    type: [Array, String, Number] as PropType<(string | number)[] | string | number>,
    default: '',
  },
  /** 是否显示搜索 */
  searchable: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  /** 是否可多选 */
  multi: {
    type: Boolean,
    default: false,
  },
  /** 是否显示全部选项 */
  checkAll: {
    type: Boolean,
    default: true,
  },
  searchDebounceTimeout: {
    type: Number,
    default: 300,
  },
  filterValuesDisplayMapper: {
    type: Function as PropType<(val: any) => string>,
  },
  /** 是否显示操作按钮 */
  operation: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: (string | number)[] | string | number): void;
  (event: 'change', val: (string | number)[] | string | number): void;
  (event: 'optionsVisibilityChange', val: boolean): void;
}>();

const filterIconRef = ref();
const headerCellRef = ref();
const popupRef = ref();

const popupVisible = ref(false);

onClickOutside(popupRef, () => {
  if (!popupVisible.value) {
    return;
  }
  // 不点确定直接关闭下拉
  popupVisible.value = false;
  if (props.multi) {
    if (Array.isArray(modelVal.value)) {
      checkboxes.value = modelVal.value;
      return;
    } else if (typeof modelVal.value === 'string' && modelVal.value.indexOf(',') !== -1) {
      checkboxes.value = modelVal.value.split(',');
      return;
    } else {
      clearCheckboxes();
    }
  } else {
    radioVal.value = modelVal.value as string | number;
  }
});

const onClickFilterIcon = () => (popupVisible.value = true);
// ------------------------下拉选项------------------------
const rawOptions = computed(() =>
  props.options.map((val) => {
    if (typeof val === 'string') {
      return { label: val, value: val };
    }
    return val;
  })
);

const searchInput = ref();
const searchVal = ref();

const searchedOptions = computed(() => {
  if (!searchVal.value) {
    return rawOptions.value;
  }
  const search = searchVal.value.toLowerCase();
  return rawOptions.value.filter((val) => val.label.toLowerCase().includes(search));
});

const empty = computed(() => searchedOptions.value.length <= 0);

const displayCount = ref(30);
const displayOptions = computed(() => {
  return searchedOptions.value.slice(0, Math.min(searchedOptions.value.length, displayCount.value));
});

const scrollerRef = ref();

useScrollBottom(scrollerRef, () => (displayCount.value += 30));

const onFilterInput = useDebounceFn((search?: string) => {
  // 重置显示个数
  displayCount.value = 30;
  searchVal.value = search;
}, props.searchDebounceTimeout);

// ------------------------筛选值------------------------
const modelVal = useVModel(props, 'modelValue', emit);
const radioVal = ref<string | number>('');
const { checkboxes, parentCheckbox, indeterminate, isCheckedAll, clearCheckboxes } = useCheckbox(rawOptions, (item) => item.value);
const displayFilterValues = computed(() => {
  if (props.filterValuesDisplayMapper) {
    return props.filterValuesDisplayMapper(modelVal.value);
  }
  if (Array.isArray(modelVal.value)) {
    return modelVal.value.join(', ');
  }
  return modelVal.value;
});
const isFiltering = computed(() => {
  if (props.multi) {
    return checkboxes.value.length > 0;
  }
  return !!modelVal.value;
});

watch(modelVal, (val) => {
  if (props.multi) {
    if (Array.isArray(val)) {
      checkboxes.value = val;
    } else if (typeof val === 'string' && val.indexOf(',') !== -1) {
      checkboxes.value = val.split(',');
    }
  } else {
    radioVal.value = val as string | number;
  }
});

/** 确认筛选值 */
const filterConfirm = () => {
  if (props.multi) {
    modelVal.value = checkboxes.value;
    emit('change', isCheckedAll.value ? [] : checkboxes.value);
  } else {
    modelVal.value = radioVal.value;
    emit('change', radioVal.value);
  }
  popupVisible.value = false;
};

const reset = () => {
  if (props.multi) {
    clearCheckboxes();
    modelVal.value = [];
    emit('change', []);
  } else {
    modelVal.value = '';
    radioVal.value = '';
    emit('change', '');
  }
  searchInput.value = '';
  onFilterInput('');
  popupVisible.value = false;
};

// ------------------------ 无操作按钮，实时更新数据 ------------------------
watch(
  () => checkboxes.value,
  (val) => {
    if (!props.operation) {
      modelVal.value = val;
      emit('change', val);
    }
  }
);
watch(
  () => radioVal.value,
  (val) => {
    if (!props.operation) {
      modelVal.value = val;
      emit('change', val);
    }
  }
);
</script>

<template>
  <div class="header-cell" ref="headerCellRef">
    <slot></slot>
    <OIcon ref="filterIconRef" class="filter-icon" :style="isFiltering || popupVisible ? { color: 'var(--o-color-primary1)' } : {}" @click="onClickFilterIcon">
      <OIconFilter />
    </OIcon>
    <OPopover v-if="isFiltering" :target="filterIconRef" trigger="hover">
      <p class="bubble-content">
        <span class="title"><slot></slot>: </span>
        {{ displayFilterValues }}
      </p>
    </OPopover>
    <!-- 下拉选项 -->
    <OPopup
      trigger="none"
      @change="$emit('optionsVisibilityChange', $event)"
      style="--popup-radius: 4px"
      :visible="popupVisible"
      :unmount-on-hide="false"
      position="bl"
      :target="headerCellRef"
    >
      <div ref="popupRef" class="filterable-checkboxes-wrap" :style="searchable ? {} : { paddingTop: '0' }">
        <div v-if="searchable" class="input-wrap">
          <OInput
            v-model="searchInput"
            clearable
            @clear="onFilterInput('')"
            @input="(e) => onFilterInput(e?.target?.value || '')"
            class="filter-input"
            placeholder="搜索"
          >
            <template #prefix>
              <OIcon class="search-icon">
                <OIconSearch />
              </OIcon>
            </template>
          </OInput>
        </div>
        <OScroller class="content" showType="always" ref="scrollerRef">
          <div class="mask" v-if="loading">
            <OIcon><IconLoading class="o-rotating" /></OIcon>
          </div>
          <div class="mask" v-else-if="empty">
            <p class="info">没有匹配的数据</p>
          </div>
          <template v-if="multi">
            <div v-if="checkAll" class="check-all-wrap">
              <OCheckbox v-model="parentCheckbox" :indeterminate="indeterminate" :value="1">全选</OCheckbox>
            </div>
            <OCheckboxGroup v-model="checkboxes" direction="v">
              <OCheckbox v-for="item in displayOptions" :key="item.value" :value="item.value">{{ item.label }}</OCheckbox>
            </OCheckboxGroup>
          </template>
          <template v-else>
            <div v-if="checkAll" class="check-all-wrap">
              <ORadio v-model="radioVal" :value="''">全选</ORadio>
            </div>
            <ORadioGroup v-model="radioVal" direction="v">
              <ORadio v-for="item in displayOptions" :key="item.value" :value="item.value">{{ item.label }}</ORadio>
            </ORadioGroup>
          </template>
        </OScroller>
        <ODivider direction="h"></ODivider>
        <div v-if="operation" class="btn-wrap">
          <OLink color="primary" @click="reset">重置</OLink>
          <OLink class="confirm-link" color="primary" @click="filterConfirm">确定</OLink>
        </div>
      </div>
    </OPopup>
  </div>
</template>

<style lang="scss" scoped>
.repo-status {
  :deep(.o-tag) {
    --tag-color: var(--o-color-white);
    --tag-bd-color: transparent;
    min-width: 72px;

    &.type0 {
      --tag-bg-color: var(--o-color-success1);
    }
    &.type1 {
      --tag-bg-color: #03b5a5;
    }
    &.type2 {
      --tag-bg-color: #f5cd05;
    }
    &.type3 {
      --tag-bg-color: var(--o-color-warning1);
    }
    &.type4 {
      --tag-bg-color: var(--o-color-danger1);
    }
  }
}
.indicators {
  .repo-status {
    :deep(.o-tag) {
      min-width: 56px;
      border-radius: 2px;
    }
  }
}

.apply-status {
  :deep(.o-tag) {
    min-width: 72px;
    color: var(--o-color-white);
    &.open {
      --tag-bg-color: var(--o-color-warning1);
      --tag-bd-color: var(--o-color-warning1);
    }
    &.approved {
      --tag-bg-color: var(--o-color-success1);
      --tag-bd-color: var(--o-color-success1);
    }
    &.revoked {
      --tag-bg-color: var(--o-color-control1);
      --tag-bd-color: transparent;
    }

    &.rejected {
      --tag-bg-color: var(--o-color-danger1);
      --tag-bd-color: var(--o-color-danger1);
    }
  }
}

.bubble-content {
  color: var(--o-color-info1);
  max-width: 300px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;

  .title {
    font-weight: bold;
  }
}

.header-cell {
  position: relative;
  display: flex;
  align-items: center;

  .filter-icon {
    width: 16px;
    cursor: pointer;
    margin-left: 8px;
  }
}

:deep(.o-divider-line) {
  position: absolute;
  left: 0;
}

.input-wrap {
  width: 100%;
  padding: 8px;
}

.btn-wrap {
  display: flex;
  justify-content: center;
  padding: 0 16px;

  .confirm-link {
    margin-left: 24px;
  }
}

.mask {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--o-color-fill2);
  z-index: 2;
  left: 0;
  top: 0;

  .info {
    @include tip1;
    color: var(--o-color-info1);
  }
}

.search-icon {
  color: var(--o-color-info1);
}

.filterable-checkboxes-wrap {
  background-color: var(--o-color-fill2);
  box-shadow: var(--o-shadow-2);
  padding-top: 0px;
  padding-bottom: 12px;
  border-radius: 4px;

  .filter-input {
    --input-radius: 4px;
    width: 100%;
  }

  .content {
    padding: 12px;
    padding-bottom: 0;
    max-height: 200px;
  }

  .check-all-wrap {
    padding: 16px 0;
    padding-top: 0;
  }
}
</style>
