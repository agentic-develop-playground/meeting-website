<script setup lang="ts">
import { onMounted, computed } from 'vue';
import {
  OButton,
  OForm,
  OFormItem,
  OIcon,
  OInput,
  OOption,
  OPopover,
  ORadio,
  ORadioGroup,
  OSelect,
  OSwitch,
  OTextarea,
  OIconTime,
  useMessage,
} from '@opensig/opendesign';
import CalendarSelector from '~/components/meeting/CalendarSelector.vue';

import IconHelp from '~icons/meeting/icon-help.svg';
import IconTip from '~icons/meeting/icon-tip.svg';
import type { MeetingItemT, MeetingPostT, OptionItemT, PlatformT } from '~/@types/type-meeting';
import { creatMeetingApi, editMeetingApi, getGroupInfosApi, getPlatformsApi, editSubMeetingApi } from '~/api/api-meeting';
import dayjs from 'dayjs';
import showMsg from '~/utils/showMsg';
import { findLabelFromOptions, formatDateNumber, getDateNumber } from '~/utils/common';
import { EMAIL_REGEX, INTERVAL_DAY, INTERVAL_MONTH, CYCLE_TYPE_OPTIONS, INTERVAL_WEEK, INTERVAL_WEEK_OPTIONS } from '~/config/meeting';

const message = useMessage();
const { isPhone, lePadV } = useScreen();

const props = withDefaults(defineProps<{ data?: MeetingItemT; isSub?: boolean; isEdit?: boolean; subId?: string }>(), {
  isSub: false,
  isEdit: false,
});

const cycleTypeOptions = ref(CYCLE_TYPE_OPTIONS);

const weekOptions = ref(INTERVAL_WEEK_OPTIONS);

const intervalTypeMax = computed(() => {
  return findLabelFromOptions(form.value.cycle_type, cycleTypeOptions.value, 'max');
});

const form = ref<MeetingPostT>({
  is_record: false,
  agenda: '',
  email_list: '',
  platform: '',
  topic: '',
  group_name: '',
  etherpad: '',
  date: '',
  date_range: [],
  start: '',
  end: '',
  time: '',
  is_cycle: false,
  cycle_interval: 1,
  cycle_type: INTERVAL_DAY,
  cycle_point: [],
  is_notify: true,
} as unknown as MeetingPostT); // 表单数据
const formRef = ref(); // 表单实例
const loading = ref(false); // 提交状态
// 表单校验规则
const rules = ref({
  topic: [
    { required: true, message: '请输入会议名称' },
    {
      validator: (value: string) => {
        if (value.length > 128) {
          return {
            type: 'danger',
            message: '会议名称不能超过128个字符',
          };
        }
      },
    },
  ],
  agenda: [
    {
      validator: (value: string) => {
        if (value.length > 4096) {
          return {
            type: 'danger',
            message: '会议名称不能超过4096个字符',
          };
        }
      },
    },
  ],
  group_name: [{ required: true, message: '请选择所属SIG' }],
  etherpad: [{ required: true, message: '请输入Etherpad' }],
  date: [{ required: true, message: '请选择日期' }],
  time: [
    { required: true, message: '请选择时间' },
    {
      validator: (value: string) => {
        const { is_cycle, cycle_type, cycle_interval, cycle_point, date, date_range } = form.value;
        if (is_cycle) {
          const msg = {
            type: 'danger',
            message: '请完善会议配置',
          };
          if (cycle_type === INTERVAL_DAY) {
            if (!cycle_interval) return msg;
          }
          if (cycle_type === INTERVAL_WEEK) {
            if (!cycle_interval || !cycle_point?.length) return msg;
          }
          if (cycle_type === INTERVAL_MONTH) {
            if (!cycle_interval || !cycle_point?.length) return msg;
          }
          if (!date_range?.length) {
            return {
              type: 'danger',
              message: '请选择会议日期',
            };
          }
          const NONE_MSG = '所选时间段内无时间可创建会议';
          let start = date_range[0];
          const end = date_range[1];
          if (cycle_type === INTERVAL_WEEK) {
            const weeks = new Set();
            while (dayjs(start).isSameOrBefore(dayjs(end))) {
              weeks.add(dayjs(start).day());
              start = dayjs(start).add(1, 'day');
            }
            if (cycle_point.every((point) => !weeks.has(point))) {
              return {
                type: 'danger',
                message: NONE_MSG,
              };
            }
          }
          if (cycle_type === INTERVAL_MONTH) {
            const days = new Set();
            while (dayjs(start).isSameOrBefore(dayjs(end))) {
              days.add(dayjs(start).date());
              start = dayjs(start).add(1, 'day');
            }
            if (cycle_point.every((point) => !days.has(point))) {
              return {
                type: 'danger',
                message: NONE_MSG,
              };
            }
          }
        } else {
          if (!date) {
            return {
              type: 'danger',
              message: '请选择会议日期',
            };
          }
        }
        if (!value?.trim()?.length) {
          return {
            type: 'danger',
            message: '请选择会议时间',
          };
        }
        const arr = value.split('-').map((v) => v.split(':').map(Number));
        if (arr[0][0] > arr[1][0] || (arr[0][0] === arr[1][0] && arr[0][1] >= arr[1][1])) {
          return {
            type: 'danger',
            message: '结束时间必须大于开始时间',
          };
        }
        if (!form.value.is_cycle && form.value.date && form.value.start) {
          const start = dayjs(`${form.value.date} ${form.value.start}`);
          if (new Date(start).getTime() < new Date().getTime()) {
            return {
              type: 'danger',
              message: '开始时间必须大于当前时间',
            };
          }
        }
      },
      triggers: ['blur', 'change'],
    },
  ],
  platform: [{ required: true, message: '请选择会议平台' }],
  email_list: [
    {
      validator: (value: string) => {
        const str = value.replaceAll(' ', '') || '';
        if (str.length) {
          const list = str.split(';') || [];
          if (list.some((v) => !EMAIL_REGEX.test(v))) {
            return {
              type: 'danger',
              message: '请输入正确的邮箱地址',
            };
          }
        }
      },
      triggers: ['blur', 'change'],
    },
  ],
});

const sigOptions = ref<OptionItemT[]>([]); // sig组选项列表
const getSigOptions = async () => {
  const res = await getGroupInfosApi();
  sigOptions.value = res.map((v) => ({ label: v.group_name, value: v.group_name, ...v }));
  if (props.data) {
    changeSig(form.value.group_name);
  }
};
// 会议平台选项列表
const typeOptions = ref<OptionItemT[]>([]);
const getPlatformOptions = async () => {
  const res = await getPlatformsApi();
  typeOptions.value = res.map((v) => ({ label: v, value: v }));
  if (!props.data) {
    form.value.platform = typeOptions.value[0].value as PlatformT;
  }
};

// 发送会议通知
const notifyList = [
  {
    value: true,
    label: '是',
  },
  {
    value: false,
    label: '否',
  },
];

const emits = defineEmits(['confirm', 'close']);
watch(
  () => props.data,
  (data) => {
    if (data) {
      const sub = data?.cycle_sub?.find((v) => v.sub_id === props.subId) || {};
      const { mid, date, start, end, sub_id } = sub;
      Object.assign(
        form.value,
        data,
        props.isSub
          ? {
              is_cycle: false,
              mid,
              date,
              start,
              end,
              sub_id,
            }
          : {}
      );
    } else {
      const today = dayjs().format('YYYY-MM-DD');
      const now = dayjs().format('HH:mm');

      let start = '';
      let end = '';
      const nowNum = getDateNumber(now);
      if (nowNum <= getDateNumber('08:00')) {
        start = '08:00';
        end = '09:00';
      } else if (getDateNumber('22:15') <= nowNum) {
        start = '08:00';
        end = '09:00';
      } else {
        let [h, m] = now.split(':').map(Number);
        if (m >= 45) {
          h++;
          m = 0;
        } else {
          m = (Math.floor(m / 15) + 1) * 15;
        }
        start = formatDateNumber(h * 60 + m).slice(3);
        end = formatDateNumber(h * 60 + m + 60).slice(3);
      }
      const date_range = [dayjs().format('YYYY-MM-DD'), dayjs().add(1, 'month').format('YYYY-MM-DD')];

      Object.assign(form.value, {
        date: today,
        start,
        end,
        time: `${start}-${end}`,
        date_range,
      });
    }
  },
  { immediate: true, deep: true }
);
const close = () => {
  form.value = {} as MeetingPostT;
  emits('close');
};

const changeIntervalType = () => {
  form.value.cycle_point = [];
  form.value.cycle_interval = 1;
};

const changeIsCycle = () => {
  form.value.platform = typeOptions.value[0].value as PlatformT;
};

const confirm = async () => {
  let type = props.isEdit ? '修改' : '预定';
  try {
    loading.value = true;
    const valid = await formRef.value?.validate();
    if (valid.some((v) => !!v)) {
      return;
    }
    const {
      topic,
      etherpad,
      group_name,
      platform,
      date,
      start,
      end,
      agenda,
      is_record,
      is_cycle,
      date_range,
      cycle_type,
      cycle_interval,
      cycle_point,
      is_notify,
      email_list,
    } = form.value;
    let params = {
      topic,
      etherpad,
      agenda,
      is_record,
      group_name,
      platform,
      is_cycle,
      is_notify,
      email_list,
    } as MeetingPostT;
    if (is_cycle) {
      params = {
        ...params,
        cycle_interval,
        cycle_type,
        cycle_start_date: date_range?.[0] || '',
        cycle_end_date: date_range?.[1] || '',
        cycle_start: start,
        cycle_end: end,
      };
      if (cycle_type !== INTERVAL_DAY) {
        params = {
          ...params,
          cycle_point: cycle_point.join(','),
        };
      }
    } else {
      params = {
        ...params,
        date: date?.split(' ')[0] || '',
        start,
        end,
      };
    }
    if (props.isEdit) {
      if (props.isSub) {
        const { mid, sub_id } = form.value;
        const { date, start, end } = params;
        await editSubMeetingApi(sub_id, {
          mid,
          date,
          start,
          end,
        });
      } else {
        const { platform, group_name, etherpad, ...data } = params;
        await editMeetingApi(props.data.id, data);
      }
    } else {
      await creatMeetingApi({
        ...params,
        email_list: form.value.email_list.replaceAll(' ', ''),
      });
    }
    const msg = `“${form.value.topic}”会议${type}成功`;
    if (isPhone.value) {
      showMsg(msg);
    } else {
      message.success({
        content: msg,
      });
    }

    close();
    emits('confirm');
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  getSigOptions();
  getPlatformOptions();
});

const changeSig = (sig) => {
  const find = sigOptions.value.find((v) => v.value === sig);
  if (!props.data) {
    form.value.etherpad = find?.etherpad || '';
    form.value.email_list = find?.email_list || '';
  }
};
const disabledDate = (date) => {
  return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};
const changeTime = () => {
  if (form.value.start && form.value.end) {
    form.value.time = `${form.value.start}-${form.value.end}`;
  } else {
    form.value.time = '';
  }
};

defineExpose({
  confirm,
});
</script>

<template>
  <div class="edit-form blue-theme">
    <OForm :model="form" ref="formRef" has-required :layout="lePadV ? 'v' : 'h'" class="form-wrapper">
      <OFormItem :rules="rules.topic" label="会议名称" field="topic">
        <OInput :disabled="isSub" size="large" placeholder="请输入会议名称" style="width: 100%" v-model="form.topic"></OInput>
      </OFormItem>
      <OFormItem :rules="rules.group_name" label="所属SIG" field="group_name">
        <OSelect :disabled="isEdit" placeholder="请选择所属SIG" size="large" style="width: 100%" v-model="form.group_name" @change="changeSig">
          <OOption v-for="t in sigOptions" :key="t.value" :value="t.value">{{ t.label }}</OOption>
        </OSelect>
      </OFormItem>
      <OFormItem :rules="rules.etherpad" label="Etherpad" field="etherpad" v-if="form.group_name">
        <template #label>
          <div class="label-wrapper">
            <span>Etherpad&nbsp;</span>
            <OPopover>
              <div class="popover-content etherpad">会议辅助工具，可以在线记录会议纪要和讨论。</div>
              <template #target>
                <OIcon>
                  <IconHelp />
                </OIcon>
              </template>
            </OPopover>
          </div>
        </template>
        <OInput size="large" :disabled="isEdit" placeholder="请输入Etherpad" style="width: 100%" v-model="form.etherpad"></OInput>
      </OFormItem>
      <OFormItem label="会议时间" field="time" :rules="rules.time" class="repeat-row center-label" required>
        <div class="repeat-config-wrapper">
          <OFormItem field="repeat" class="repeat-item" v-if="!isSub">
            <ORadioGroup v-model="form.is_cycle" @change="changeIsCycle" :disabled="isEdit">
              <ORadio :value="false">不重复</ORadio>
              <ORadio :value="true">重复</ORadio>
            </ORadioGroup>
          </OFormItem>
          <div class="repeat-config">
            <template v-if="form.is_cycle">
              <OFormItem label="每" class="full-width-item">
                <div class="repeat-config-item">
                  <OFormItem v-if="form.cycle_type !== INTERVAL_MONTH">
                    <ElInputNumber size="large" v-model="form.cycle_interval" :min="1" :max="intervalTypeMax"></ElInputNumber>
                  </OFormItem>
                  <OFormItem>
                    <OSelect
                      size="large"
                      v-model="form.cycle_type"
                      class="interval-select"
                      optionWrapClass="interval-select-options"
                      @change="changeIntervalType"
                    >
                      <OOption v-for="o in cycleTypeOptions" :key="o.value" :value="o.value" :label="o.label"></OOption>
                    </OSelect>
                  </OFormItem>
                </div>
              </OFormItem>
              <OFormItem label="在" field="cycle_point" class="point-item" v-if="form.cycle_type !== INTERVAL_DAY">
                <OSelect
                  v-if="form.cycle_type === INTERVAL_WEEK"
                  size="large"
                  multiple
                  v-model="form.cycle_point"
                  placeholder="请选择重复日期"
                  :max-tag-count="2"
                >
                  <OOption v-for="o in weekOptions" :key="o.value" :value="o.value" :label="o.label"></OOption>
                </OSelect>
                <CalendarSelector v-if="form.cycle_type === INTERVAL_MONTH" v-model="form.cycle_point"></CalendarSelector>
              </OFormItem>
              <OFormItem label="时间段" field="date_range">
                <ElDatePicker
                  size="large"
                  v-model="form.date_range"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                  :clearable="false"
                  type="daterange"
                >
                </ElDatePicker>
              </OFormItem>
            </template>
            <template v-else>
              <OFormItem label="会议日期" field="date">
                <ElDatePicker
                  size="large"
                  v-model="form.date"
                  placeholder="请选择日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                  :clearable="false"
                >
                </ElDatePicker>
              </OFormItem>
            </template>

            <OFormItem label="会议时间">
              <div class="time-select-wrapper">
                <OFormItem field="start">
                  <ElTimeSelect
                    step="00:15"
                    start="08:00"
                    end="22:45"
                    placeholder="开始时间"
                    v-model="form.start"
                    size="large"
                    :clearable="false"
                    @change="changeTime"
                  ></ElTimeSelect>
                </OFormItem>
                <span>-</span>
                <OFormItem field="end">
                  <ElTimeSelect
                    step="00:15"
                    start="08:00"
                    end="22:45"
                    placeholder="结束时间"
                    v-model="form.end"
                    size="large"
                    :clearable="false"
                    @change="changeTime"
                  ></ElTimeSelect>
                </OFormItem>
                <OIconTime></OIconTime>
              </div>
            </OFormItem>
          </div>
        </div>
      </OFormItem>
      <OFormItem label="会议平台" field="platform" :rules="rules.platform" class="center-label">
        <ORadioGroup v-model="form.platform" v-if="!isEdit" :disabled="form.is_cycle">
          <ORadio v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}</ORadio>
        </ORadioGroup>
        <span v-else>{{ form.platform }}</span>
      </OFormItem>
      <OFormItem field="agenda" label="会议内容" :rules="rules.agenda">
        <OTextarea
          size="large"
          placeholder="请输入会议内容"
          style="width: 100%"
          :rows="4"
          resize="none"
          :max-length="100"
          :input-on-outlimit="false"
          :disabled="isSub"
          v-model="form.agenda"
        ></OTextarea>
      </OFormItem>
      <OFormItem label="会议录制" field="is_record" class="record-item full-width-item center-label">
        <div class="switch-wrapper">
          <OSwitch v-model="form.is_record" :disabled="isSub"></OSwitch>
          <div class="switch-text">
            <OIcon>
              <IconTip />
            </OIcon>
            <span>开启后将自动录屏，本服务由{{ form.platform }}会议提供。并将在1个工作日内自动上传会议AI版本的链接回放。</span>
          </div>
        </div>
      </OFormItem>
      <OFormItem v-if="isEdit" label="立即发送通知" class="center-label">
        <ORadioGroup v-model="form.is_notify">
          <ORadio v-for="item in notifyList" :key="item.label" :value="item.value">{{ item.label }}</ORadio>
        </ORadioGroup>
      </OFormItem>
      <OFormItem field="email_list" label="邮件地址" :rules="rules.email_list">
        <OTextarea
          size="large"
          :disabled="isSub"
          placeholder="请输入电子邮件地址，多个邮件地址以“;”间隔"
          style="width: 100%"
          :rows="4"
          resize="none"
          :input-on-outlimit="false"
          v-model="form.email_list"
        ></OTextarea>
      </OFormItem>
    </OForm>
    <div class="form-btns">
      <OButton color="primary" variant="solid" size="large" @click="confirm" :loading="loading">
        {{ isEdit ? '保存' : '预定' }}
      </OButton>
      <OButton color="primary" variant="outline" size="large" @click="close">取消</OButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-form {
  :deep(.form-wrapper) {
    & > .o-form-item {
      max-width: 592px;
    }
    .repeat-row,
    .full-width-item {
      width: 100%;
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
    .o-textarea {
      --_box-radius: 16px;
    }

    input,
    textarea {
      color: var(--o-input-color);
      @include text1;

      &::placeholder {
        color: var(--o-placeholder-color);
      }
    }

    .o-form-item {
      --form-item-align: baseline;
    }

    .center-label {
      --form-item-align: flex-start;
      .o-form-item-label {
        padding: 1px 0;
      }
    }

    .o-form-item-label {
      flex: 0 0 110px;
    }

    .o-form-item-main {
      margin-left: var(--o-gap-3);
    }
    .record-item {
      .o-form-item-label {
        margin: 0;
      }
    }

    .switch-wrapper {
      display: flex;
      align-items: flex-start;
      column-gap: var(--o-gap-4);
      row-gap: var(--o-gap-2);

      @include respond-to('phone') {
        flex-direction: column;
        align-items: flex-start;
      }

      .switch-text {
        display: flex;
        align-items: flex-start;
        column-gap: var(--o-gap-1);
        color: var(--o-color-info3);
        @include tip1;

        .o-icon {
          font-size: 16px;
          position: relative;
          top: 2px;
        }
      }
    }

    input::placeholder {
      @include text1;
    }

    .label-wrapper {
      display: flex;
      align-items: center;

      .o-svg-icon {
        font-size: 1.5em;
      }
    }

    .el-input__prefix {
      order: 1;
      font-size: 16px;
    }

    .el-date-editor--daterange {
      padding: 0 13px 0 15px;
    }
    .el-date-editor {
      --el-input-border-radius: 100px;
      input {
        text-align: left;
        @include text1;
      }
      .el-select__wrapper {
        gap: 0;
      }
      .el-input__icon {
        height: 100%;
        order: 1;
        font-size: 24px;
        margin-right: 2px;
        color: var(--o-color-info1);
        background-color: var(--o-color-info2);
        mask: url('@/assets/svg-icons/icon-calendar.svg') no-repeat center;
        background-size: 24px;
        background-repeat: no-repeat;
        background-position: center center;
        svg {
          display: none;
        }
      }
    }

    .calendar-selector {
      --el-border-radius-base: 100px;
    }

    .el-date-editor--timerange {
      padding: 0 16px;
    }
  }

  .form-btns {
    margin-top: var(--o-gap-5);
    display: flex;
    align-items: center;
    column-gap: var(--o-gap-4);
    .o-btn {
      height: 40px !important;
      font-size: 16px !important;
      line-height: 24px !important;
      border-radius: 20px !important;
    }
  }

  .time-select-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    border: 1px solid var(--o-color-control1);
    border-radius: 100px;
    padding: 0 15px;
    background-color: var(--o-color-fill2);
    & > span {
      padding: 0 var(--o-gap-2);
    }

    &:hover {
      border-color: var(--o-color-control2);
    }

    @include respond-to('phone') {
      background-color: var(--o-color-fill2);
    }

    :deep(.o-form-item) {
      margin-bottom: 0;
      flex-grow: 1;
      --o-input-color: var(--o-color-info1);

      .o-form-item-label {
        display: none;
      }

      .el-select__wrapper {
        box-shadow: none;
        padding: calc((var(--o-control_size-l) - 24px) / 2) 0;
        min-height: var(--o-control_size-l);
        gap: 0;
      }
      .el-select__placeholder {
        @include text1;
      }

      .el-select__caret,
      .el-input__prefix-icon {
        display: none;
      }
      div.o-form-item-main {
        margin-left: 0;
        @include respond-to('phone') {
          margin-top: 0;
        }
      }
    }

    :deep(.o-svg-icon) {
      flex-shrink: 0;
      font-size: 24px;
      color: var(--o-color-info2);
    }
  }

  @include respond-to('phone') {
    width: auto;
    :deep(.o-form) {
      .o-form-item-main {
        margin-left: 0;
      }
    }
  }
  :deep(.repeat-config-wrapper) {
    width: 100%;
    .repeat-item {
      .o-form-item-label {
        display: none;
      }
      .o-form-item-main {
        margin-left: 0;
      }
      @include respond-to('<=pad_v') {
        margin-bottom: var(--o-gap-section-4);
      }
    }
    .repeat-config {
      background-color: rgba(var(--o-ubmc-color), 0.05);
      padding: var(--o-gap-section-5) var(--o-gap-section-7) var(--o-gap-section-5);
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
      .o-form-item-main {
        margin-left: var(--o-gap-section-6);
        @include respond-to('<=pad_v') {
          margin-left: 0;
        }
        @include respond-to('phone') {
          max-width: 100%;
        }
      }
      .full-width-item {
        .o-form-item-main {
          max-width: 100%;
        }
      }

      .repeat-config-item {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: var(--o-gap-4);
        .o-form-item {
          margin-bottom: 0;
          width: calc(50% - var(--o-gap-4) / 2);
          .o-form-item-label {
            display: none;
          }
          .o-form-item-main {
            margin-left: 0;
          }
        }
      }
      .point-item {
        .o-select {
          width: 100%;
        }
      }
      .el-input-number {
        --el-border-radius-base: 100px;
      }
    }
  }
}
</style>

<style lang="scss">
.o-message-list-top {
  --app-header-height: 80px;
  top: calc(var(--app-header-height) + 32px);

  @include respond-to('<=pad_v') {
    --app-header-height: 48px;
    top: calc(var(--app-header-height) + 12px);
  }
}

.popover-content {
  @include tip1;
  max-width: 256px;
  text-align: left;

  &.etherpad {
    width: 191px;
  }

  .link-text {
    color: var(--o-color-primary1);
    cursor: pointer;
  }
}

.interval-select-options {
  .o-option-item {
    justify-content: center;
  }
}

@include respond-to('phone') {
  .el-picker-panel__sidebar {
    width: 100%;
  }
  .el-picker-panel {
    width: 400px!important;
  }
  .el-picker-panel__content {
    width: 100%;
  }
  .el-picker-panel__body{
    margin-left: 0!important;
    display: flex;
    flex-direction: column;
    min-width: auto!important;
  }
  .el-picker-panel__sidebar {
    position: relative;
  }
  .el-picker-panel__body-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
