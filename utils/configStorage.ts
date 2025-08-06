import { ref } from "vue";

export const AppInfo = {
  QQGroup: '交流QQ群：346787461'
} 

export const autoInjectionStorage = storage.defineItem("local:autoInjection", {
  fallback: 5,
});

export const loopSecondsStorage = storage.defineItem("local:loopSeconds", {
  fallback: 124,
});

export const isRunningStorage = storage.defineItem("local:isRunning", {
  fallback: false,
});

export const isPausedStorage = storage.defineItem("local:isPaused", {
  fallback: false,
});

export function useConfigStorage() {
  const autoInjection = ref(autoInjectionStorage.fallback);
  const loopSeconds = ref(loopSecondsStorage.fallback);
  const isRunning = ref(isRunningStorage.fallback);
  const isPaused = ref(isPausedStorage.fallback);

  // 立即加载存储的值
  const loadStoredValues = async () => {
    try {
      const [autoInjectionVal, loopSecondsVal, isRunningVal, isPausedVal] = await Promise.all([
        autoInjectionStorage.getValue(),
        loopSecondsStorage.getValue(),
        isRunningStorage.getValue(),
        isPausedStorage.getValue(),
      ]);
      
      autoInjection.value = autoInjectionVal;
      loopSeconds.value = loopSecondsVal;
      isRunning.value = isRunningVal;
      isPaused.value = isPausedVal;
      
      console.log('已加载存储的配置:', {
        autoInjection: autoInjectionVal,
        loopSeconds: loopSecondsVal,
        isRunning: isRunningVal,
        isPaused: isPausedVal
      });
    } catch (error) {
      console.error('加载存储的配置失败:', error);
    }
  };
  
  // 立即加载
  loadStoredValues();

  // 设置观察者
  const unwatchAutoInjection = autoInjectionStorage.watch((newValue) => {
    autoInjection.value = newValue;
  });

  const unwatchLoopSeconds = loopSecondsStorage.watch((newValue) => {
    loopSeconds.value = newValue;
  });

  const unwatchIsRunning = isRunningStorage.watch((newValue) => {
    isRunning.value = newValue;
  });

  const unwatchIsPaused = isPausedStorage.watch((newValue) => {
    isPaused.value = newValue;
  });

  // 设置方法
  const setAutoInjection = async (value: number) => {
    console.log(`设置注入间隔为: ${value}秒`);
    await autoInjectionStorage.setValue(value);
    // 立即更新本地值
    autoInjection.value = value;
  };

  const setLoopSeconds = async (value: number) => {
    console.log(`设置运行间隔为: ${value}秒`);
    await loopSecondsStorage.setValue(value);
    // 立即更新本地值
    loopSeconds.value = value;
  };

  const setIsRunning = async (value: boolean) => {
    await isRunningStorage.setValue(value);
    // 立即更新本地值
    isRunning.value = value;
  };

  const setIsPaused = async (value: boolean) => {
    await isPausedStorage.setValue(value);
    // 立即更新本地值
    isPaused.value = value;
  };

  // 清理函数，可以在组件卸载时手动调用
  const cleanup = () => {
    unwatchAutoInjection();
    unwatchLoopSeconds();
    unwatchIsRunning();
    unwatchIsPaused();
  };

  return {
    autoInjection,
    loopSeconds,
    isRunning,
    isPaused,
    setAutoInjection,
    setLoopSeconds,
    setIsRunning,
    setIsPaused,
    cleanup,
    loadStoredValues
  };
}