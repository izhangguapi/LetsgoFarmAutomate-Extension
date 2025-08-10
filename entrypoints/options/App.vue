<template>
  <el-tabs v-model="activeName" @tab-click="handleClick" stretch>
    <el-tab-pane label="有月卡" name="Vip">
      <Vip />
    </el-tab-pane>
    <el-tab-pane label="无月卡" name="NoVip">
      <NoVip />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import "element-plus/dist/index.css";
import type { TabsPaneContext } from "element-plus";
import Vip from "@/components/IsVip.vue";
import NoVip from "@/components/NotVip.vue";

const activeName = ref("Vip");

const configStr = localStorage.getItem("config");
if (configStr) {
  const config = JSON.parse(configStr);
  if (config && typeof config.vip === "boolean") {
    activeName.value = config.vip ? "Vip" : "NoVip";
  }
}

const handleClick = (tab: TabsPaneContext, event: Event) => {
  // console.log(tab, event.target.name)
  console.log(activeName.value);
};
</script>

<style>
.el-tabs__content {
  margin: 0 auto;
  overflow: visible;
}
</style>
