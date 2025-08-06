<template>
  <div style="width: 240px">
    <el-row class="flex-between-center">
      <el-text class="mx-1" tag="b">星宝农场自动化脚本</el-text>
      <el-button
        :icon="Setting"
        @click="browser.runtime.openOptionsPage()"
        circle
        text
      />
    </el-row>

    <el-row align="middle">
      <el-col :span="8">
        <el-text class="mx-1">注入间隔：</el-text>
      </el-col>
      <el-col :span="16" style="text-align: right">
        <el-input-number
          v-model="autoInjection"
          :min="1"
          :max="30"
          @change="handleChangeAutoInjection"
          :disabled="isRunning"
        >
          <template #suffix>
            <span>秒</span>
          </template>
        </el-input-number>
      </el-col>
    </el-row>

    <el-row align="middle">
      <el-col :span="8">
        <el-text class="mx-1">运行间隔：</el-text>
      </el-col>
      <el-col :span="16" style="text-align: right">
        <el-input-number
          v-model="loopSeconds"
          :min="1"
          :max="1800"
          @change="handleChangeLoopSeconds"
          :disabled="isRunning"
        >
          <template #suffix>
            <span>秒</span>
          </template>
        </el-input-number>
      </el-col>
    </el-row>

    <el-row v-if="!isRunning">
      <el-col :span="24">
        <el-button type="success" style="width: 100%" @click="handleRunning"
          >开始运行
        </el-button>
      </el-col>
    </el-row>
    <el-row :gutter="10" v-else>
      <el-col :span="12">
        <el-button :type="isPaused ? 'success' : 'warning'" style="width: 100%" @click="handlePausing">
          {{ isPaused ? "继续运行" : "暂停运行" }}
        </el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="danger" style="width: 100%" @click="handleStopping"
          >停止运行
        </el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24" style="text-align: center">
        <el-text class="mx-1" tag="b">{{ AppInfo.QQGroup }}</el-text>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import "element-plus/dist/index.css";
import { Setting } from "@element-plus/icons-vue";
import { AppInfo } from "@/utils/configStorage";
import { useConfigStorage } from "@/utils/configStorage"; // 导入组合式函数

const configStorage = useConfigStorage();
const { autoInjection, loopSeconds, isRunning, isPaused } = configStorage;

// 组件挂载时检查当前状态
onMounted(async () => {
  try {
    // 获取当前活动标签页
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length > 0) {
      const activeTab = tabs[0];

      // 发送消息给content script查询当前状态
      const response = await browser.tabs
        .sendMessage(activeTab.id!, {
          action: "checkCountdownStatus",
        })
        .catch(() => ({ status: "error", isRunning: false, isPaused: false }));

      // 更新运行状态
      if (response?.status === "success") {
        isRunning.value = response.isRunning;
        isPaused.value = response.isPaused;
        console.log("状态已同步:", isRunning.value ? "正在运行" : "已停止", isPaused.value ? "已暂停" : "未暂停");
      }
    }
  } catch (error) {
    console.error("检查状态出错:", error);
  }
});

const handleChangeAutoInjection = async (value: number) => {
  console.log(`修改注入间隔为: ${value}秒`);
  await configStorage.setAutoInjection(value);
  
  // 向content script发送配置更新消息
  try {
    const tabs = await browser.tabs.query({
      url: "https://gamer.qq.com/v2/game/96897"
    });
    
    if (tabs.length > 0) {
      for (const tab of tabs) {
        console.log(`向标签页 ${tab.id} 发送配置更新消息`);
        await browser.tabs.sendMessage(tab.id!, {
          action: "updateConfig",
          config: {
            autoInjection: value
          }
        }).catch(err => console.error(`向标签页 ${tab.id} 发送消息失败:`, err));
      }
    } else {
      console.log("没有找到匹配的标签页");
    }
  } catch (error) {
    console.error("发送配置更新消息出错:", error);
  }
};

const handleChangeLoopSeconds = async (value: number) => {
  console.log(`修改运行间隔为: ${value}秒`);
  await configStorage.setLoopSeconds(value);
  
  // 向content script发送配置更新消息
  try {
    const tabs = await browser.tabs.query({
      url: "https://gamer.qq.com/v2/game/96897"
    });
    
    if (tabs.length > 0) {
      for (const tab of tabs) {
        console.log(`向标签页 ${tab.id} 发送配置更新消息`);
        await browser.tabs.sendMessage(tab.id!, {
          action: "updateConfig",
          config: {
            loopSeconds: value
          }
        }).catch(err => console.error(`向标签页 ${tab.id} 发送消息失败:`, err));
      }
    } else {
      console.log("没有找到匹配的标签页");
    }
  } catch (error) {
    console.error("发送配置更新消息出错:", error);
  }
};

const handleRunning = async () => {
  // 开始运行
  const success = await startCountdown();
  if (success) {
    isRunning.value = true;
  }
};
const handlePausing = async () => {
  // 暂停运行
  const success = await pauseCountdown();
  if (success) {
    isPaused.value = !isPaused.value;
    console.log(isPaused.value ? "已暂停运行" : "已继续运行");
  }
};

const handleStopping = async () => {
  // 停止运行
  await stopCountdown();
  isRunning.value = false;
};

const startCountdown = async () => {
  console.log("开始运行");

  try {
    // 获取当前活动标签页
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length > 0) {
      const activeTab = tabs[0];

      // 发送消息到content script，使用loopSeconds的值作为倒计时秒数
      const response = await browser.tabs.sendMessage(activeTab.id!, {
        action: "startCountdown",
        seconds: loopSeconds.value,
        repeat: true, // 添加循环参数
      });

      if (response?.status === "success") {
        console.log("倒计时已启动");
        return true;
      } else {
        console.error("启动倒计时失败:", response?.message);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("获取标签页出错:", error);
    return false;
  }
};

const stopCountdown = async () => {
  console.log("停止运行");

  try {
    // 获取当前活动标签页
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length > 0) {
      const activeTab = tabs[0];

      // 发送停止命令到content script
      const response = await browser.tabs.sendMessage(activeTab.id!, {
        action: "stopCountdown",
      });

      if (response?.status === "success") {
        console.log("倒计时已停止");
        return true;
      } else {
        console.error("停止倒计时失败:", response?.message);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("获取标签页出错:", error);
    return false;
  }
};

const pauseCountdown = async () => {
  console.log("暂停运行");

  try {
    // 获取当前活动标签页
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length > 0) {
      const activeTab = tabs[0];

      // 发送暂停命令到content script
      const response = await browser.tabs.sendMessage(activeTab.id!, {
        action: "pauseCountdown",
      });

      if (response?.status === "success") {
        console.log("倒计时已暂停");
        return true;
      } else {
        console.error("暂停倒计时失败:", response?.message);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error("获取标签页出错:", error);
    return false;
  }
};
</script>

<style>
.el-row {
  margin-bottom: 10px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.el-divider {
  margin: 5px 0;
}
.flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
} 
</style>
