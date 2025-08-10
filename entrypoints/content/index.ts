import { createApp } from "vue";
import App from "./App.vue";
import { useConfigStorage, autoInjectionStorage } from "@/utils/configStorage";

export default defineContentScript({
  matches: ["https://gamer.qq.com/v2/game/96897"],
  cssInjectionMode: "ui",
  async main(ctx) {
    // 使用ref存储Vue应用实例
    const appRef = ref();

    // 创建shadow root UI
    const ui = await createShadowRootUi(ctx, {
      name: "vue-dialog",
      position: "overlay",
      anchor: "body",
      onMount: (container) => {
        // 挂载Vue应用到shadow root
        const app = createApp(App);

        // 获取组件实例
        const instance = app.mount(container);
        // 存储实例引用
        appRef.value = instance;

        return app;
      },
      onRemove: (app) => {
        // 卸载应用
        app?.unmount();
        appRef.value = null;
      },
    });

    // 展示UI给用户
    ui.mount();

    // 使用configStorage
    const configStorage = useConfigStorage();
    const { autoInjection } = configStorage;

    // 确保我们有最新的配置值
    try {
      const [autoInjectionVal] = await Promise.all([
        autoInjectionStorage.getValue(),
      ]);

      // 更新本地值
      autoInjection.value = autoInjectionVal;

      // 输出当前配置
      console.log("当前配置:", {
        autoInjection: autoInjection.value,
        loopSeconds: configStorage.loopSeconds.value,
      });
    } catch (error) {
      console.error("加载配置失败:", error);
    }

    // 注入main.js脚本
    console.log(`等待${autoInjection.value}秒后注入主要脚本...`);
    setTimeout(async () => {
      // 创建script元素
      const script = document.createElement("script");
      // 使用browser.runtime.getURL获取脚本路径
      script.src = browser.runtime.getURL("/assets/main.js");
      // 将脚本添加到页面
      document.body.appendChild(script);
      console.log("主要脚本已成功注入");
      // 注入工具脚本
      script.src = browser.runtime.getURL("/assets/tools.js");
      document.body.appendChild(script);
      console.log("工具脚本已成功注入");
    }, autoInjection.value * 1000);

    // 监听来自popup的消息
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // 处理配置更新消息
      if (message.action === "updateConfig") {
        console.log("收到配置更新消息:", message.config);
        if (message.config) {
          if (message.config.autoInjection !== undefined) {
            configStorage.setAutoInjection(message.config.autoInjection);
            console.log(`注入间隔已更新为: ${message.config.autoInjection}秒`);
          }
          if (message.config.loopSeconds !== undefined) {
            configStorage.setLoopSeconds(message.config.loopSeconds);
            console.log(`运行间隔已更新为: ${message.config.loopSeconds}秒`);
          }
        }
        sendResponse({ status: "success" });
        return true;
      }

      // 处理获取配置消息
      if (message.action === "getConfig") {
        sendResponse({
          status: "success",
          config: {
            autoInjection: autoInjection.value,
            loopSeconds: configStorage.loopSeconds.value,
            isRunning: configStorage.isRunning.value,
          },
        });
        return true;
      }

      // 处理开始倒计时消息
      if (message.action === "startCountdown" && message.seconds) {
        // 使用应用实例引用调用方法
        if (appRef.value && appRef.value.startCountdown) {
          console.log("开始运行");

          // 调用startCountdown方法，传递秒数和是否循环参数
          appRef.value.startCountdown(message.seconds, message.repeat === true);

          // 点击开始按钮时注入runDrone脚本
          // injectRunDroneScript();

          sendResponse({ status: "success" });
        } else {
          console.error("无法获取Vue应用实例或startCountdown方法");
          sendResponse({ status: "error", message: "无法获取App组件实例" });
        }
        return true;
      }

      // 处理停止倒计时消息
      if (message.action === "stopCountdown") {
        // 使用应用实例引用调用方法
        if (appRef.value && appRef.value.stopCountdown) {
          appRef.value.stopCountdown();
          sendResponse({ status: "success" });
        } else {
          console.error("无法获取Vue应用实例或stopCountdown方法");
          sendResponse({ status: "error", message: "无法获取App组件实例" });
        }
        return true;
      }

      // 处理检查倒计时状态的消息
      if (message.action === "checkCountdownStatus") {
        if (appRef.value && appRef.value.checkStatus) {
          const status = appRef.value.checkStatus();
          sendResponse({
            status: "success",
            isRunning: status.isRunning,
          });
        } else {
          console.error("无法获取Vue应用实例或checkStatus方法");
          sendResponse({
            status: "error",
            message: "无法获取App组件实例",
            isRunning: false,
          });
        }
        return true;
      }

      // 处理定时执行任务消息
      if (message.action === "executeScheduledAction") {
        console.log("收到定时执行任务消息:", message.alarmName);
        if (appRef.value && appRef.value.handleScheduledAction) {
          appRef.value.handleScheduledAction(message.alarmName);
          sendResponse({ status: "success" });
        } else {
          console.error("无法获取Vue应用实例或handleScheduledAction方法");
          sendResponse({ status: "error", message: "无法获取App组件实例" });
        }
        return true;
      }
    });

    // 监听倒计时结束事件
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "countdownEnded") {
        console.log("检测到倒计时结束，注入runDrone脚本");
        // injectRunDroneScript();
      }
    });
  },
});
