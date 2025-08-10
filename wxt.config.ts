import { defineConfig } from "wxt";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const date = new Date();
const version = `${date.getFullYear()}.${
  date.getMonth() + 1
}.${date.getDate()}`;

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  webExt: {
    startUrls: ["https://gamer.qq.com/v2/game/96897"],
    chromiumArgs: [
      "--window-size=1200,800", // 设置窗口宽度为800px，高度为600px
      "--auto-open-devtools-for-tabs", // 自动为每个新标签页打开开发者工具
    ],
  },
  manifest: {
    name: "星宝农场自动化",
    version,
    permissions: ["storage", "activeTab", "tabs", "scripting", "alarms"],
    host_permissions: ["https://gamer.qq.com/v2/game/96897"],
    web_accessible_resources: [
      {
        resources: ["assets/*"],
        matches: ["*://gamer.qq.com/*"],
      },
    ],
  },
  vite: () => ({
    plugins: [
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver(), IconsResolver()],
        dts: ".wxt/auto-imports.d.ts",
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            enabledCollections: ["ep"],
          }),
        ],
        dts: ".wxt/components.d.ts",
      }),
      Icons({
        autoInstall: true,
      }),
    ],
  }),
});
