<script setup lang="ts">
import { OIconTime, useMessage } from '@opensig/opendesign';
import { onMounted } from 'vue';
import { OButton, OForm, OFormItem, OIcon, OInput, OOption, OPopover, ORadio, ORadioGroup, OSelect, OSwitch, OTextarea } from '@opensig/opendesign';
import IconHelp from '~icons/meeting/icon-help.svg';
import IconTip from '~icons/meeting/icon-tip.svg';
import type { MeetingItemT, MeetingPostT, OptionItemT } from '~/@types/type-meeting';
import { creatMeetingApi, editMeetingApi, getGroupInfosApi, getPlatformsApi } from '~/api/api-meeting';
import dayjs from 'dayjs';
import { openWindow } from '~/utils/common';
import showMsg from '~/utils/showMsg';

const props = defineProps<{ data?: MeetingItemT }>();
const message = useMessage();
const form = ref<MeetingPostT>({
  is_record: false,
  agenda: '',
  email_list: '',
  platform: '',
  topic: '',
  group_name: '',
  etherpad: '',
  date: '',
  start: '',
  end: '',
  time: '',
} as unknown as MeetingPostT); // 表单数据
const formRef = ref(null); // 表单实例
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
        const arr = value.split('-').map((v) => v.split(':').map(Number));
        if (arr[0][0] > arr[1][0] || (arr[0][0] === arr[1][0] && arr[0][1] >= arr[1][1])) {
          return {
            type: 'danger',
            message: '结束时间必须大于开始时间',
          };
        }
        if (form.value.date && form.value.start) {
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
        if (props.data) {
          return {};
        }
        const str = value.replaceAll(' ', '') || '';
        if (str.length) {
          if (str.length > 1020) {
            return {
              type: 'danger',
              message: '邮箱地址不能超过1020个字符',
            };
          }
          const list = str.split(';') || [];
          if (list.some((v) => !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(v))) {
            return {
              type: 'danger',
              message: '请输入正确的邮箱地址',
            };
          }
          if (list.some((v) => v.length > 50)) {
            return {
              type: 'danger',
              message: '每个邮箱地址不能超过50个字符',
            };
          }
          if (list.length > 20) {
            return {
              type: 'danger',
              message: '最多添加20个邮箱地址',
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
    form.value.platform = typeOptions.value[0].value;
  }
};

const emits = defineEmits(['confirm', 'close']);
watch(
  () => props.data,
  (data) => {
    if (data) {
      Object.assign(form.value, data);
    }
  },
  { immediate: true }
);
const close = () => {
  form.value = {};
  emits('close');
};
const { isPhone } = useScreen();
const confirm = async () => {
  let type = props.data ? '编辑' : '创建';
  try {
    loading.value = true;
    const valid = await formRef.value.validate();
    if (valid.some((v) => !!v)) {
      return;
    }
    if (props.data) {
      const { id, topic, etherpad, date, start, end, agenda, is_record } = {
        ...props.data,
        ...form.value,
      };
      await editMeetingApi(id, {
        topic,
        etherpad,
        date: date.split(' ')[0],
        start,
        end,
        agenda,
        is_record,
      });
    } else {
      await creatMeetingApi({
        ...form.value,
        email_list: form.value.email_list.replaceAll(' ', ''),
      });
    }
    const msg = `“${form.value.topic}”会议${type}成功`;
    if (isPhone.value) {
      showMsg(msg);
    } else {
      message.success(msg);
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
const router = useRouter();
const toSigEmail = () => {
  const routerData = router.resolve({ path: '/sig' });
  openWindow(routerData.fullPath);
};

defineExpose({
  confirm,
});
</script>

<template>
  <div class="edit-form blue-theme">
    <OForm :model="form" ref="formRef" has-required :layout="isPhone ? 'v' : 'h'">
      <OFormItem :rules="rules.topic" label="会议名称" field="topic">
        <OInput size="large" placeholder="请输入会议名称" style="width: 100%" v-model="form.topic"></OInput>
      </OFormItem>
      <OFormItem :rules="rules.group_name" label="所属SIG" field="group_name">
        <OSelect :disabled="!!data" placeholder="请选择所属SIG" size="large" style="width: 100%" v-model="form.group_name" @change="changeSig">
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
        <OInput size="large" placeholder="请输入Etherpad" style="width: 100%" v-model="form.etherpad"></OInput>
      </OFormItem>
      <OFormItem label="会议日期" field="date" :rules="rules.date">
        <ElDatePicker
          size="large"
          v-model="form.date"
          placeholder="请选择日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          :clearable="false"
        >
          <template #prev-month></template>
        </ElDatePicker>
      </OFormItem>
      <OFormItem label="会议时间" field="time" :rules="rules.time">
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
      <OFormItem label="会议平台" field="platform" :rules="rules.platform">
        <ORadioGroup v-model="form.platform" v-if="!data">
          <ORadio v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}</ORadio>
        </ORadioGroup>
        <span v-else>{{ form.platform }}</span>
      </OFormItem>
      <OFormItem field="agenda" label="会议内容" :rules="rules.genda">
        <OTextarea size="large" placeholder="请输入会议内容" style="width: 100%" :rows="4" v-model="form.agenda"></OTextarea>
      </OFormItem>
      <OFormItem label="会议录制" field="is_record">
        <div class="switch-wrapper">
          <OSwitch v-model="form.is_record"></OSwitch>
          <div class="switch-text">
            <OIcon>
              <IconTip />
            </OIcon>
            <span>开启后将自动录屏，本服务由{{ form.platform }}会议提供</span>
          </div>
        </div>
      </OFormItem>
      <OFormItem field="email_list" :rules="rules.email_list">
        <template #label>
          <div class="label-wrapper">
            <span>邮件地址&nbsp;</span>
            <OPopover wrap-class="blue-theme">
              <div class="popover-content">
                默认会向已订阅SIG组成员发送会议通知也可添加其他SIG组邮件地址或个人邮件地址。<span class="link-text" @click="toSigEmail">SIG组邮件列表</span>
              </div>
              <template #target>
                <OIcon>
                  <IconHelp />
                </OIcon>
              </template>
            </OPopover>
          </div>
        </template>
        <OTextarea
          :disabled="!!data"
          size="large"
          placeholder="请输入邮件地址，多个邮件地址以“;”间隔"
          style="width: 100%"
          :rows="4"
          v-model="form.email_list"
        ></OTextarea>
      </OFormItem>
    </OForm>
    <div class="form-btns">
      <OButton color="primary" variant="solid" size="large" @click="confirm" :loading="loading">
        {{ data ? '修改' : '创建' }}
      </OButton>
      <OButton color="primary" variant="outline" size="large" @click="close">取消</OButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-form {
  width: 590px;

  @include respond-to('pad_v') {
    width: 490px;
  }

  :deep(.o-form) {
    --o-input-color: var(--o-color-info2);
    --o-placeholder-color: var(--o-color-info4);

    input,
    textarea {
      color: var(--o-input-color);

      &::placeholder {
        color: var(--o-placeholder-color);
      }
    }

    .o-form-item-label {
      flex: 0 0 100px;
    }

    .o-form-item-main {
      margin-left: var(--o-gap-3);
    }

    .switch-wrapper {
      display: flex;
      align-items: center;
      column-gap: var(--o-gap-4);

      .switch-text {
        display: flex;
        align-items: center;
        column-gap: var(--o-gap-1);
        @include tip1;
        color: var(--o-color-info3);

        .o-icon {
          font-size: 24px;
        }
      }
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

      .el-input__icon {
        margin-right: 2px;
        font-size: 20px;
        color: var(--o-color-info2);
      }
    }

    .el-range__icon {
      order: 1;
      font-size: 16px;
      margin-right: 2px;
    }

    .el-date-editor--timerange {
      padding: 0 16px;
    }
  }

  .form-btns {
    margin-top: var(--o-gap-5);
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: var(--o-gap-4);
  }

  .time-select-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    border: 1px solid var(--o-color-control1);
    border-radius: var(--o-radius_control-s);
    padding: 0 15px;

    &:hover {
      border-color: var(--o-color-control2);
    }

    @include respond-to('phone') {
      background-color: var(--o-color-fill2);
      padding-left: 0;
    }

    :deep(.o-form-item) {
      margin-bottom: 0;
      flex-grow: 1;

      .o-form-item-label {
        display: none;
      }

      .el-select__wrapper {
        box-shadow: none;
      }

      .el-select__caret,
      .el-input__prefix-icon {
        display: none;
      }
      .o-form-item-main {
        @include respond-to('phone') {
          margin-top: 0;
        }
      }
    }

    :deep(.o-svg-icon) {
      font-size: 24px;
      color: var(--o-color-info2);
    }
  }

  @include respond-to('phone') {
    width: auto;
    .form-btns {
      display: none;
    }
    :deep(.o-form) {
      .o-form-item-main {
        margin-left: 0;
        margin-top: 8px;
      }
    }
  }
}
</style>

<style lang="scss">
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
</style>
