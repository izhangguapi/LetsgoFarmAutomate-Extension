<template>
  <el-card style="max-width: 1000px; width: 300px" shadow="hover">
    <!-- 头部 -->
    <template #header>
      <div class="card-header flex-between-center">
        <!-- <el-image style="width: 100px; height: 100px" :src="require('@/assets/vip.png')" :fit="fit" /> -->
        <el-text class="mx-1" size="large" tag="b" style="color: #ff6464"
          >有月卡设置</el-text
        >
        <el-button type="primary" @click="saveConfig">保存设置</el-button>
      </div>
    </template>
    <!-- 自动许愿和开关 -->
    <el-row>
      <el-col :span="24" class="flex-between-center">
        <el-text class="mx-1" tag="b">自动许愿</el-text>
        <el-switch
          v-model="config.pray"
          inline-prompt
          active-text="开启"
          inactive-text="关闭"
        />
      </el-col>
    </el-row>
    <!-- 许愿类型 -->
    <el-row>
      <el-col :span="24">
        <el-segmented
          v-model="config.prayType"
          :options="prayOptions"
          block
          :disabled="!config.pray"
        />
      </el-col>
    </el-row>
    <!-- 许愿时间 -->
    <el-row>
      <el-col :span="24" class="flex-between-center">
        <el-text class="mx-1">设置许愿时间：</el-text>
        <el-time-picker
          :disabled="!config.pray"
          v-model="config.prayTime"
          placeholder="许愿时间"
          value-format="HH:mm"
          format="HH:mm"
          style="width: 120px"
        />
      </el-col>
    </el-row>
    <!-- 分割线 -->
    <el-divider />
    <!-- 自动泡温泉 -->
    <el-row>
      <el-col :span="24" class="flex-between-center">
        <el-text class="mx-1" tag="b">自动泡温泉</el-text>
        <el-switch
          v-model="config.hotspring"
          inline-prompt
          active-text="开启"
          inactive-text="关闭"
        />
      </el-col>
    </el-row>
    <!-- 自动泡温泉开关、许愿时间 -->
    <el-row>
      <el-col :span="24" class="flex-between-center">
        <el-text class="mx-1">设置泡温泉时间：</el-text>
        <el-time-picker
          :disabled="!config.hotspring"
          v-model="config.hotspringTime"
          placeholder="许愿时间"
          value-format="HH:mm"
          format="HH:mm"
          style="width: 120px"
        />
      </el-col>
    </el-row>
    <!-- 自动泡喝茶、好友uid -->
    <el-row>
      <el-col :span="10">
        <el-switch
          :disabled="!config.hotspring"
          v-model="config.tea"
          inline-prompt
          active-text="启用喝茶"
          inactive-text="关闭喝茶"
        />
      </el-col>
      <el-col :span="14" style="text-align: right">
        <el-input
          :disabled="!config.hotspring"
          v-model="config.friendUID"
          style="width: 100%"
          maxlength="10"
          placeholder="好友uid"
          show-word-limit
          type="text"
        />
      </el-col>
    </el-row>
    <!-- 底部 -->
    <template #footer>
      <el-text class="mx-1" tag="b">{{ AppInfo.QQGroup }}</el-text>
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { AppInfo } from "@/utils/configStorage";
import { ElMessageBox } from "element-plus";

const prayOptions = ["金币", "经验"];
const config = reactive({
  vip: true,
  loopSeconds: 124,
  pray: false,
  prayTime: "08:00",
  prayType: "金币",
  hotspring: false,
  hotspringTime: "08:05",
  friendUID: "",
  tea: false,
});
const handleChange = (value: number | undefined) => {
  console.log(value);
};
const saveConfig = () => {
  // 保存配置到本地
  localStorage.setItem("config", JSON.stringify(config));
  console.log(
    "许愿开关：" + config.pray,
    "\n许愿时间：" + config.prayTime,
    "\n自动类型：" + config.prayType,
    "\n自动温泉：" + config.hotspring,
    "\n温泉时间：" + config.hotspringTime,
    "\n好友id：" + config.friendUID,
    "\n喝茶开关：" + config.tea
  );
  // 提示
  ElMessageBox.alert("设置保存成功", "提示", {
    confirmButtonText: "确定",
    type: "success",
  });
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
.el-card__footer {
  text-align: center;
}
.flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
} 
</style>
