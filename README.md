# hwVueSnippet README

0.0.1: vue3模版
使用方式 输入 vueTo，生成一个vue3的模版，仅在.vue和.js文件中生效

0.0.2: 自定义颜色变量提示
ctrl+shift+p 输入'测试一下',打开颜色变量文件，选择颜色变量，即可提示颜色变量
变更了git地址

0.0.3: 增加了.vscode配置，可以使用.vscode中配置setting.json
  "hwPlugin.localesPaths": [
    "src/styles/VariableCss"
  ]
来实现指定css全局变量地址，避免每次启动都要手动指定文件夹位置

0.0.4: 优化的var变量使用体验，直接聚焦即可，文案优化。嵌套的var变量解析原始值。
