<template>
  <div>
    <!-- 固定在左下角的倒计时文本和定时任务 -->
    <div class="fixed-text">
      <el-space direction="vertical">
        <el-text v-if="config.pray" type="primary" tag="b">
          许愿 {{ config.prayTime }} 执行
        </el-text>
        <el-text v-if="config.hotspring" type="primary" tag="b">
          温泉 {{ config.hotspringTime }} 执行
        </el-text>
        <el-text :type="countdown! > 10 ? 'success' : 'danger'" tag="b">
          {{
            countdown === null ? "脚本未运行" : "倒计时：" + countdown + "秒"
          }}
        </el-text>
      </el-space>
    </div>

    <el-dialog
      v-model="centerDialogVisible"
      title="公告"
      width="800"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-row>
        <el-text class="mx-1">{{ AppInfo.Announcement }} </el-text>
      </el-row>

      <el-row>
        <el-text class="mx-1" tag="b">{{ AppInfo.QQGroup }}</el-text>
      </el-row>
      <br />
      <el-row>
        <el-text class="mx-1" type="danger" tag="b">
          此脚本免费且开源😊如果您是从任意渠道购买的，请立即退款、差评并举报！
        </el-text>
      </el-row>
      <el-row justify="end">
        <el-text class="mx-1" type="danger" tag="b">——开发者：张瓜皮</el-text>
      </el-row>

      <el-divider />
      <el-row justify="center">
        <el-text size="large" tag="b" class="mx-1">自愿赞助</el-text>
      </el-row>
      <el-row justify="center">
        <el-image :src="imageUrl" fit="contain" style="width: 70%" />
      </el-row>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="centerDialogVisible = false">
            我知道啦！
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
// 获取赞助图片
const imageUrl = browser.runtime.getURL("/assets/QRCode.png");
// 控制Dialog是否可见
const centerDialogVisible = ref(true);
// 倒计时变量，不再使用useStorage存储
const countdown = ref<number | null>(null);
// 保存原始倒计时秒数，用于循环倒计时
const initialSeconds = ref<number | null>(null);
// 是否循环倒计时
const isRepeating = ref(false);
// 保存定时器引用，用于清除定时器
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// 配置对象，使用响应式
const config = ref({
  pray: false,
  prayTime: "08:00",
  hotspring: false,
  hotspringTime: "08:00",
});

// ========== 自动定时执行三条 window.postMessage 代码 ==========
onMounted(() => {
  // 加载配置
  loadConfig();
});

// 加载配置
const loadConfig = async () => {
  try {
    const result = await browser.storage.local.get("config");
    if (result.config) {
      config.value = { ...config.value, ...result.config };
    }
  } catch (error) {
    console.error("加载配置失败:", error);
  }
};

// 处理定时执行任务
const handleScheduledAction = async (alarmName: string) => {
  console.log(`执行定时任务: ${alarmName}`);

  try {
    // 获取配置
    const result = await browser.storage.local.get("config");
    const currentConfig = result.config;

    console.log("配置", currentConfig);

    if (!currentConfig) {
      console.log("未找到配置信息");
      return;
    }

    // 根据 alarmName 执行对应的操作
    if (alarmName.startsWith("pray_")) {
      console.log("执行许愿操作");
      // window.postMessage({ action: "pray" }, "*");
      window.postMessage(
        {
          action: "pray",
          params: [currentConfig.prayType === "金币"],
        },
        "*"
      );
    } else if (alarmName.startsWith("hotspring_")) {
      console.log("执行泡温泉操作");
      window.postMessage(
        {
          action: "hotspring",
          params: [currentConfig.tea, currentConfig.friendUID],
        },
        "*"
      );
    }
  } catch (error) {
    console.error("执行定时任务失败:", error);
  }
};

// 开始倒计时的方法
const startCountdown = (seconds: number, repeat = false) => {
  // 保存初始秒数用于循环
  initialSeconds.value = seconds;
  // 设置循环标志
  isRepeating.value = repeat;
  // 设置初始值
  countdown.value = seconds;
  // 第一次运行
  window.postMessage({ action: "runDrone" }, "*");
  // 获取设置数据
  loadConfig();

  // 先清除可能存在的定时器
  clearExistingTimer();

  // 开始倒计时
  startCountdownTimer();
};

// 启动倒计时定时器
const startCountdownTimer = () => {
  // 创建定时器
  countdownTimer = setInterval(() => {
    if (countdown.value !== null) {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        // 倒计时结束
        console.log("倒计时结束");

        // 发送倒计时结束消息
        window.postMessage({ type: "countdownEnded" }, "*");

        // 如果设置了循环，则重新开始倒计时
        if (isRepeating.value && initialSeconds.value !== null) {
          console.log("重新开始倒计时");
          window.postMessage({ action: "runDrone" }, "*");
          countdown.value = initialSeconds.value;
        } else {
          // 否则停止倒计时
          stopCountdown();
        }
      }
    }
  }, 1000);
};

// 清除现有定时器而不输出日志
const clearExistingTimer = () => {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

// 停止倒计时的方法
const stopCountdown = () => {
  // 清除定时器
  clearExistingTimer();

  // 清除倒计时状态
  countdown.value = null;
  initialSeconds.value = null;
  isRepeating.value = false;

  console.log("倒计时已停止");
};

// 检查倒计时状态的方法
const checkStatus = () => {
  return {
    isRunning: countdown.value !== null && countdown.value > 0,
  };
};

// 导出方法，以便在外部调用
defineExpose({
  startCountdown,
  stopCountdown,
  checkStatus,
  handleScheduledAction,
});
</script>

<style>
/* 组件特定样式 */
.dialog-footer {
  display: flex;
  justify-content: right;
  margin-top: 10px;
}

/* 固定在左下角的文本样式 */
.fixed-text {
  position: fixed;
  left: 10px;
  bottom: 10px;
  padding: 6px 10px;
  border-radius: 5px;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
}
</style>
