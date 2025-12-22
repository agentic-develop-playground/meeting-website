<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { OForm, OFormItem, OInput, OSelect, OOption, OButton, useMessage } from '@opensig/opendesign';

import dayjs from 'dayjs';

import type { ParamsItemT } from '@/@types/type-activity';
import { creatActivity, editDraftActivity, getActivityAdmins } from '~/api/api-activity';

import { acticityTypeMap } from '@/config/activity';
import { WEBSITE_REGEXP } from '@/config/common';
import { useUserInfoStore } from '@/stores/user';
import { useActivityStore } from '@/stores/activity';

const emits = defineEmits(['confirm', 'close']);

const message = useMessage();
const { isPhone, lePadV } = useScreen();
const userInfoStore = useUserInfoStore();
const activityStore = useActivityStore();

interface TypeOptionT {
  label: string;
  value: number;
}

const props = withDefaults(defineProps<{ data?: ParamsItemT; isEdit?: boolean }>(), {
  isEdit: false,
});

const form = ref<ParamsItemT>({
  title: '',
  start_date: '',
  end_date: '',
  register_end_date: '',
  activity_type: '',
  synopsis: '',
  register_url: '',
  content_url: '',
  address: '',
  start: '',
  end: '',
  is_publish: 'true',
  approver: '',
});

const formRef = ref(); // 表单实例
const loading = ref(false); // 提交状态

// 表单校验规则
const rules = ref({
  title: [
    { required: true, message: '请输入活动名称' },
    {
      validator: (value: string) => {
        if (value.length > 50) {
          return {
            type: 'danger',
            message: '活动名称不能超过50个字符',
          };
        }
      },
    },
  ],
  activity_type: [{ required: true, message: '请选择活动类型' }],
  start_date: [
    { required: true, message: '请选择活动时间' },
    {
      validator: (value: string) => {
        const { start_date, end_date } = form.value;
        const startDate = start_date.split(' ');
        const endDate = end_date.split(' ');
        if (!start_date || !end_date) {
          return {
            type: 'danger',
            message: '请选择活动日期',
          };
        }

        const startArr = startDate[1].split(':').map(Number);
        const endArr = endDate[1].split(':').map(Number);
        if (startArr[0] < 8 || startArr[0] > 21 || endArr[0] < 8 || endArr[0] > 21) {
          return {
            type: 'danger',
            message: '开始和结束时间必须在8：00-22：00点之间',
          };
        }

        if (dayjs(start_date).valueOf() > dayjs(end_date).valueOf()) {
          return {
            type: 'danger',
            message: '结束日期必须大于起始日期',
          };
        }

        form.value.start_date = startDate[0];
        form.value.end_date = endDate[0];
        form.value.start = startDate[1];
        form.value.end = endDate[1];
      },
      triggers: ['blur', 'change'],
    },
  ],
  register_end_date: [
    { required: true, message: '请选择报名截止时间' },
    {
      validator: () => {
        const { register_end_date, end_date, end } = form.value;
        if (dayjs(`${end_date} ${end}`).valueOf() < dayjs(register_end_date).valueOf()) {
          return {
            type: 'danger',
            message: '报名截止日期必须小于结束日期',
          };
        }
      },
      triggers: ['blur', 'change'],
    },
  ],
  address: [
    { required: true, message: '请输入活动地址' },
    {
      validator: (value: string) => {
        if (value.length > 255) {
          return {
            type: 'danger',
            message: '活动名称不能超过255个字符',
          };
        }
      },
    },
  ],
  register_url: [
    { required: true, message: '请输入报名网址' },
    {
      validator: (value: string) => {
        const str = value.replaceAll(' ', '') || '';
        if (str.length) {
          const list = str.split(';') || [];
          if (list.some((v) => !WEBSITE_REGEXP.test(v))) {
            return {
              type: 'danger',
              message: '请输入正确的报名网址',
            };
          }
        }
      },
      triggers: ['blur', 'change'],
    },
  ],
  content_url: [
    { required: true, message: '请输入活动详情网址' },
    {
      validator: (value: string) => {
        const str = value.replaceAll(' ', '') || '';
        if (str.length) {
          const list = str.split(';') || [];
          if (list.some((v) => !WEBSITE_REGEXP.test(v))) {
            return {
              type: 'danger',
              message: '请输入正确的活动详情网址',
            };
          }
        }
      },
      triggers: ['blur', 'change'],
    },
  ],
  approver: [{ required: true, message: '请选择活动审批人' }],
});

// -------------------- 活动管理员 ---------------------
const approverList = ref([]);
const getActivityAdminsData = () => {
  getActivityAdmins().then((res) => {
    approverList.value = res.data?.filter((item) => !item.includes(userInfoStore.username));
  });
};

const typeValue = ref('');
const typeOptions = ref<TypeOptionT[]>([]); // 活动类型
acticityTypeMap.forEach((item) => {
  typeOptions.value.push(item);
});
const changeType = (val: string) => {
  const item = typeOptions.value.find((v) => v.label === val);
  form.value.activity_type = item?.value as number;
};

const disabledDate = (date) => {
  return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};

watch(
  () => props.data,
  (val) => {
    if (val) {
      const {
        title,
        start_date,
        end_date,
        register_end_date,
        activity_type,
        register_url,
        content_url,
        address,
        start,
        end,
        is_publish,
        approver,
        update_activity_id,
      } = val;
      let params = {
        title,
        start_date,
        end_date,
        register_end_date,
        activity_type,
        register_url,
        content_url,
        address,
        start,
        end,
        is_publish,
        approver,
        update_activity_id,
      } as ParamsItemT;
      form.value = { ...params };
      typeValue.value = acticityTypeMap.get(val.activity_type)?.label;
      form.value.start_date = `${form.value.start_date} ${form.value.start}`;
      form.value.end_date = `${form.value.end_date} ${form.value.end}`;
    }
  },
  { immediate: true, deep: true }
);

const confirm = async (val: boolean) => {
  let type = props.isEdit ? '修改' : val ? '创建' : '保存草稿';
  try {
    loading.value = true;
    const valid = await formRef.value?.validate();
    if (valid.some((v) => !!v)) {
      return;
    }
    form.value.is_publish = `${val}`;
    if (props.isEdit && activityStore.status === 3) {
      form.value.update_activity_id = props.data?.id;
      await creatActivity(form.value);
    } else if (props.isEdit) {
      await editDraftActivity(props.data.id, form.value);
    } else {
      await creatActivity(form.value);
    }
    const msg = `“${form.value.title}”活动${type}成功`;
    message.success({
      content: msg,
    });
    close();
    emits('confirm');
  } catch {
    loading.value = false;
    form.value.start_date = `${form.value.start_date} ${form.value.start}`;
    form.value.end_date = `${form.value.end_date} ${form.value.end}`;
    const msg = `“${form.value.title}”活动${type}失败`;
    message.danger({
      content: msg,
    });
  }
};
const close = () => {
  form.value = {} as ParamsItemT;
  emits('close');
};

onMounted(() => {
  getActivityAdminsData();
});

defineExpose({
  confirm,
});
</script>

<template>
  <div class="edit-activity-form">
    <OForm :model="form" ref="formRef" has-required label-width="108px" :layout="lePadV ? 'v' : 'h'" class="form-wrapper">
      <OFormItem :rules="rules.title" label="活动名称" field="title">
        <OInput size="large" placeholder="请输入活动名称" style="width: 100%" v-model="form.title"></OInput>
      </OFormItem>
      <OFormItem :rules="rules.activity_type" label="活动类型" field="activity_type">
        <OSelect placeholder="请选择活动类型" size="large" style="width: 100%" v-model="typeValue" @change="changeType">
          <OOption v-for="t in typeOptions" :key="t.value" :value="t.label">{{ t.label }}</OOption>
        </OSelect>
      </OFormItem>
      <OFormItem v-if="form.activity_type === 1 || form.activity_type === 3" :rules="rules.address" label="活动地址" field="address">
        <OInput size="large" placeholder="请输入活动地址" style="width: 100%" v-model="form.address"></OInput>
      </OFormItem>
      <OFormItem :rules="rules.start_date" label="活动时间" field="start_date" required>
        <div class="time-config">
          <OFormItem label="起始日期" field="start_date">
            <el-date-picker
              size="large"
              v-model="form.start_date"
              type="datetime"
              placeholder="请选择日期"
              style="width: 100%"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              :disabled-date="disabledDate"
              :clearable="false"
              class="date-activity"
            />
          </OFormItem>
          <OFormItem label="结束日期" field="end_date">
            <el-date-picker
              size="large"
              v-model="form.end_date"
              type="datetime"
              placeholder="请选择日期"
              style="width: 100%"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              :disabled-date="disabledDate"
              :clearable="false"
              class="date-activity"
            />
          </OFormItem>
        </div>
      </OFormItem>
      <OFormItem :rules="rules.register_end_date" label="报名截止时间" field="register_end_date">
        <el-date-picker
          size="large"
          v-model="form.register_end_date"
          type="datetime"
          placeholder="请选择报名截止时间"
          style="width: 100%"
          format="YYYY/MM/DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          :clearable="false"
          class="date-activity"
        />
      </OFormItem>
      <OFormItem :rules="rules.register_url" label="报名网址" field="register_url">
        <OInput size="large" placeholder="请输入报名网址" style="width: 100%" v-model="form.register_url"></OInput>
      </OFormItem>
      <OFormItem :rules="rules.content_url" label="活动详情网址" field="content_url">
        <OInput size="large" placeholder="请输入活动详情网址" style="width: 100%" v-model="form.content_url"></OInput>
      </OFormItem>
      <OFormItem :rules="rules.approver" label="活动审批人" field="approver">
        <OSelect placeholder="请选择活动审批人" size="large" style="width: 100%" v-model="form.approver">
          <OOption v-for="t in approverList" :key="t" :value="t">{{ t }}</OOption>
        </OSelect>
      </OFormItem>
    </OForm>
    <div class="form-btns">
      <OButton color="primary" variant="solid" size="large" @click="confirm(true)" :loading="loading">
        {{ isEdit ? '保存' : '创建' }}
      </OButton>
      <OButton v-if="!isEdit" color="primary" variant="outline" size="large" @click="confirm(false)" :loading="loading">保存草稿</OButton>
      <OButton color="primary" variant="outline" size="large" @click="close">取消</OButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.edit-activity-form {
  :deep(.form-wrapper) {
    & > .o-form-item {
      max-width: 620px;
    }
  }
  :deep(.o-form) {
    --o-input-color: var(--o-color-info2);
    --o-placeholder-color: var(--o-color-info4);

    &.o-form-layout-v {
      .o-form-item-label {
        margin-bottom: var(--o-gap-2);
      }
      .o-form-item-main {
        margin-left: 0;
      }
    }

    .o-input {
      --_box-radius: 100px;
    }
    .o-select {
      --select-radius: 100px;
    }

    .el-input__wrapper {
      border-radius: 100px;
    }

    .time-config {
      width: 100%;
      background-color: rgba(var(--o-ubmc-color), 0.05);
      padding: var(--o-gap-section-5);
      border-radius: var(--o-radius-s);
      @include respond-to('<=pad_v') {
        padding: var(--o-gap-section-4);
      }
      .o-form-item {
        align-items: center;
      }
      .o-form-item-label {
        flex: 0 0 80px;
      }
    }
  }
}

.form-btns {
  margin-top: var(--o-gap-5);
  display: flex;
  align-items: center;
  .o-btn + .o-btn {
    margin-left: 16px;
  }
  @include respond-to('<=pad_v') {
    .o-btn {
      --btn-min-width: 74px;
    }
  }
}
</style>
<style lang="scss">
.date-activity {
  .el-input__inner {
    @include text1;
  }
  .el-input__inner::placeholder {
    color: var(--o-color-info4);
  }
}
</style>
