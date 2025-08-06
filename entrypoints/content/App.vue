<template>
  <div>
    <!-- 固定在左下角的倒计时文本 -->
    <div class="fixed-text">
      <el-text :type="countdown! > 10 ? 'success' : 'danger'" tag="b">
        {{ countdown === null ? "脚本未运行" : "倒计时：" + countdown + "秒" }}
      </el-text>
    </div>

    <el-dialog
      v-model="centerDialogVisible"
      title="脚本公告"
      width="500"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-row>
        <el-text class="mx-1">
          脚本目前只有月卡功能可使用，无月卡功能正在努力开发中...
        </el-text>
      </el-row>
      <br />
      <el-row>
        <el-text class="mx-1" type="danger" tag="b">
          此脚本免费且开源😊，如果您是购买的，请立即退款、差评并举报！
        </el-text>
      </el-row>
      <el-row justify="end">
        <el-text class="mx-1" type="danger" tag="b">——开发者：张瓜皮</el-text>
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
import { useStorage } from "@vueuse/core";

const centerDialogVisible = ref(true);
// 倒计时变量，使用useStorage保证在content script生命周期中保持状态
const countdown = useStorage<number | null>("countdown", null);
// 保存原始倒计时秒数，用于循环倒计时
const initialSeconds = useStorage<number | null>("initialSeconds", null);
// 是否循环倒计时
const isRepeating = useStorage<boolean>("isRepeating", false);
// 是否暂停
const isPaused = useStorage<boolean>("isPaused", false);
// 结束时间戳，用于在刷新页面后恢复倒计时
const endTimeStamp = useStorage<number | null>("endTimeStamp", null);
// 保存定时器引用，用于清除定时器
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// 在组件挂载时检查是否有未完成的倒计时
onMounted(() => {
  checkAndRestoreCountdown();
});


// 检查并恢复倒计时
const checkAndRestoreCountdown = () => {
  // 检查是否有未完成的倒计时
  if (endTimeStamp.value && initialSeconds.value) {
    // 计算剩余时间
    const now = Date.now();
    const remainingMs = endTimeStamp.value - now;

    if (remainingMs > 0) {
      // 还有剩余时间，计算剩余秒数（向上取整，确保不会少倒计时）
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      console.log(`恢复倒计时，剩余${remainingSeconds}秒`);

      // 设置剩余时间
      countdown.value = remainingSeconds;

      // 开始倒计时
      startCountdownTimer();
    } else if (isRepeating.value) {
      // 倒计时已结束但需要循环，重新开始
      console.log("恢复循环倒计时，重新开始");
      countdown.value = initialSeconds.value;
      updateEndTimeStamp();
      startCountdownTimer();
    } else {
      // 倒计时已结束，清除状态
      clearStoredCountdown();
    }
  }
};

// 更新结束时间戳
const updateEndTimeStamp = () => {
  if (countdown.value !== null) {
    // 设置结束时间戳为当前时间加上倒计时秒数
    endTimeStamp.value = Date.now() + countdown.value * 1000;
  } else {
    endTimeStamp.value = null;
  }
};

// 清除存储的倒计时状态
const clearStoredCountdown = () => {
  countdown.value = null;
  endTimeStamp.value = null;
};

// 开始倒计时的方法
const startCountdown = (seconds: number, repeat = false) => {
  // 保存初始秒数用于循环
  initialSeconds.value = seconds;
  // 设置循环标志
  isRepeating.value = repeat;
  // 设置初始值
  countdown.value = seconds;

  window.postMessage({ action: 'runDrone' }, '*');

  // 更新结束时间戳
  updateEndTimeStamp();

  // 先清除可能存在的定时器
  clearExistingTimer();

  // 开始倒计时
  startCountdownTimer();
  
};

// 启动倒计时定时器
const startCountdownTimer = () => {
  // 创建定时器
  countdownTimer = setInterval(() => {
    if (countdown.value !== null && !isPaused.value) {
      if (countdown.value > 0) {
        countdown.value--;
        // 每次更新倒计时也更新结束时间戳，减少计时误差
        if (countdown.value % 10 === 0) {
          // 每10秒更新一次，减少写入次数
          updateEndTimeStamp();
        }
      } else {
        // 倒计时结束
        console.log("倒计时结束");
        
        // 发送倒计时结束消息
        window.postMessage({ type: "countdownEnded" }, "*");

        // 如果设置了循环，则重新开始倒计时
        if (isRepeating.value && initialSeconds.value !== null) {
          console.log("重新开始倒计时");
          window.postMessage({ action: 'runDrone' }, '*');
          countdown.value = initialSeconds.value;
          updateEndTimeStamp();
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

  // 清除存储的倒计时状态
  clearStoredCountdown();

  console.log("倒计时已停止");
};

// 暂停倒计时的方法
const pauseCountdown = () => {
  isPaused.value = !isPaused.value;
  console.log(isPaused.value ? "倒计时已暂停" : "倒计时已恢复");
  return { status: "success" };
};

// 检查倒计时状态的方法
const checkStatus = () => {
  return {
    isRunning: countdown.value !== null && countdown.value > 0,
    isPaused: isPaused.value
  };
};

// 导出方法，以便在外部调用
defineExpose({ startCountdown, stopCountdown, pauseCountdown, checkStatus });
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
