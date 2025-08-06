<template>
  <el-card style="width: 660px">
    <!-- 头部 -->
    <template #header>
      <div class="card-header flex-between-center">
        <!-- <el-image style="width: 100px; height: 100px" :src="require('@/assets/vip.png')" :fit="fit" /> -->
        <el-text class="mx-1" size="large" tag="b">无月卡设置</el-text>
        <el-button type="primary" @click="save">保存设置</el-button>
      </div>
    </template>
    <!-- 第一排 -->
    <div class="card-row" style="display: flex; justify-content: space-between">
      <!-- 左侧 -->
      <el-card style="width: 300px" shadow="hover">
        <!-- 农场设置 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1" tag="b">农场设置</el-text>
            <el-switch
              v-model="config.farm"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            />
          </el-col>
        </el-row>
        <!-- 设置地块数量 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">设置地块数量：</el-text>
            <el-input-number
              :disabled="!config.farm"
              v-model="config.farmPlot"
              :min="1"
              :max="30"
              style="width: 140px"
            >
              <template #suffix>
                <span>块地</span>
              </template>
            </el-input-number>
          </el-col>
        </el-row>
      </el-card>
      <!-- 右侧 -->
      <el-card style="width: 300px" shadow="hover">
        <!-- 第1行：牧场设置 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1" tag="b">牧场设置</el-text>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="20级开启牧场"
              placement="top"
            >
              <el-switch
                v-model="config.pasture"
                inline-prompt
                active-text="开启"
                inactive-text="关闭"
              />
            </el-tooltip>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">设置地块数量：</el-text>
            <el-input-number
              :disabled="!config.pasture"
              v-model="config.pasturePlot"
              :min="1"
              :max="15"
              style="width: 140px"
            >
              <template #suffix>
                <span>块地</span>
              </template>
            </el-input-number>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <!-- 第二排 -->
    <div class="card-row" style="display: flex; justify-content: space-between">
      <!-- 左侧 -->
      <el-card style="width: 300px" shadow="hover">
        <!-- 鱼塘设置 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1" tag="b">鱼塘设置</el-text>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="40级开启鱼塘"
              placement="top"
            >
            <el-switch
              v-model="config.fishpond"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            />
          </el-tooltip>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">设置钓鱼竿数：</el-text>
            <el-tooltip placement="top">
              <template #content>
                神农：1小时2竿、8小时16竿、16小时24竿、32小时32竿
                <br />
                神农以下
                ：1小时2竿、6小时10竿、12小时14竿、16小时16竿、32小时24竿
              </template>
              <el-select-v2
                :disabled="!config.fishpond"
                v-model="config.fishpondRod"
                :options="options"
                label="label"
                style="width: 140px"
              />
            </el-tooltip>
          </el-col>
        </el-row>
      </el-card>
      <!-- 右侧 -->
      <el-card style="width: 300px" shadow="hover">
        <!-- 加工器设置 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1" tag="b">加工器设置</el-text>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="10级开启小屋"
              placement="top"
            >
            <el-switch
              v-model="config.processors"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            /></el-tooltip>
          </el-col>
        </el-row>
        <!-- 自动升级 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">自动升级：</el-text>
            <el-switch
              :disabled="!config.processors"
              v-model="config.processorsUpgrade"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            />
          </el-col>
        </el-row>
      </el-card>
    </div>
    <!-- 第三排 -->
    <div class="card-row" style="display: flex; justify-content: space-between">
      <!-- 左侧 -->
      <el-card style="width: 300px" shadow="hover">
        <!-- 自动收水族箱 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1" tag="b">自动收水族箱</el-text>
            <el-switch
              v-model="config.aquarium"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            />
          </el-col>
        </el-row>
        <!-- 收水族箱时间1 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">设置第1个时间：</el-text>
            <el-time-picker
              :disabled="!config.aquarium"
              v-model="config.aquariumTime1"
              placeholder="收取时间1"
              value-format="HH:mm"
              format="HH:mm"
              style="width: 140px"
            />
          </el-col>
        </el-row>
        <!-- 收水族箱时间2 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">设置第2个时间：</el-text>
            <el-time-picker
              :disabled="!config.aquarium"
              v-model="config.aquariumTime2"
              placeholder="收取时间2"
              value-format="HH:mm"
              format="HH:mm"
              style="width: 140px"
            />
          </el-col>
        </el-row>
        <!-- 收水族箱时间3 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1">设置第3个时间：</el-text>
            <el-time-picker
              :disabled="!config.aquarium"
              v-model="config.aquariumTime3"
              placeholder="收取时间2"
              value-format="HH:mm"
              format="HH:mm"
              style="width: 140px"
            />
          </el-col>
        </el-row>
      </el-card>
      <!-- 右侧 -->
      <el-card style="width: 300px" shadow="hover">
        <!-- 加工器设置 -->
        <el-row>
          <el-col :span="24" class="flex-between-center">
            <el-text class="mx-1" tag="b">餐厅设置</el-text>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="20级开启餐厅"
              placement="top"
            >
            <el-switch
              v-model="config.restaurant"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
            /></el-tooltip>
          </el-col>
        </el-row>
        <!-- 待定 -->
        <el-row>
          <el-col :span="24" class="flex-between-center"> 待定 </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 底部 -->
    <template #footer>
      <el-text class="mx-1" tag="b">{{ AppInfo.QQGroup }}</el-text>
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { AppInfo } from "@/utils/configStorage";
import { ElMessageBox } from "element-plus";

const num = ["2", "10", "14", "16", "24", "32"];
const options = num.map((value) => ({
  value: value,
  label: `${value}竿`,
}));

const config = reactive({
  vip: false,
  farm: false,
  farmPlot: 30,
  pasture: false,
  pasturePlot: 15,
  fishpond: false,
  fishpondRod: options[3].value,
  processors: false,
  processorsUpgrade: false,
  aquarium: false,
  aquariumTime1: "00:00",
  aquariumTime2: "08:00",
  aquariumTime3: "16:00",
  restaurant: false,
});

const save = () => {
  // 保存配置到本地
  localStorage.setItem("config", JSON.stringify(config));
  // 提示
  ElMessageBox.alert("保存无效，无月卡功能正在努力开发中...", "提示", {
    confirmButtonText: "确定",
    type: "error",
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
.card-row {
  margin-bottom: 16px;
}
.flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
} 
</style>
