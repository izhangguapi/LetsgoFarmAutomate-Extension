export default defineBackground(() => {
  console.log("Background script running", { id: browser.runtime.id });

  // 监听 alarms 事件
  browser.alarms.onAlarm.addListener(async (alarm) => {
    console.log("Alarm triggered:", alarm.name);
    
    try {
      // 获取所有匹配的标签页
      const tabs = await browser.tabs.query({
        url: "https://gamer.qq.com/v2/game/96897"
      });

      if (tabs.length > 0) {
        // 向所有匹配的标签页发送消息
        for (const tab of tabs) {
          try {
            await browser.tabs.sendMessage(tab.id!, {
              action: "executeScheduledAction",
              alarmName: alarm.name
            });
            console.log(`已向标签页 ${tab.id} 发送定时执行消息: ${alarm.name}`);
          } catch (error) {
            console.error(`向标签页 ${tab.id} 发送消息失败:`, error);
          }
        }
      } else {
        console.log("没有找到匹配的标签页");
      }
      
      // 重新设置第二天的 alarm
      await rescheduleAlarm(alarm.name);
    } catch (error) {
      console.error("处理 alarm 事件失败:", error);
    }
  });

  // 重新设置 alarm 的函数
  async function rescheduleAlarm(alarmName: string) {
    try {
      // 获取配置
      const result = await browser.storage.local.get("config");
      const config = result.config;
      
      if (!config) {
        console.log("未找到配置信息，无法重新设置 alarm");
        return;
      }
      
      // 根据 alarmName 重新设置对应的 alarm
      if (alarmName.startsWith('pray_') && config.pray && config.prayTime) {
        const nextTime = getNextAlarmTime(config.prayTime);
        await browser.alarms.create(alarmName, { when: nextTime });
        console.log(`已重新设置许愿 alarm: ${alarmName} at ${new Date(nextTime).toLocaleString()}`);
      } else if (alarmName.startsWith('hotspring_') && config.hotspring && config.hotspringTime) {
        const nextTime = getNextAlarmTime(config.hotspringTime);
        await browser.alarms.create(alarmName, { when: nextTime });
        console.log(`已重新设置泡温泉 alarm: ${alarmName} at ${new Date(nextTime).toLocaleString()}`);
      }
    } catch (error) {
      console.error("重新设置 alarm 失败:", error);
    }
  }

  // 计算下一个指定时间的毫秒数
  function getNextAlarmTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    
    // 如果时间已经过了，设置为明天
    if (now >= next) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.getTime();
  }
});
