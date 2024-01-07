# hwPlugin README

## 介绍

 以前开发Angular的时候Angular Language Service对于模版和样式中的变量提示非常友好，但是Vue3中没有这个功能，所以开发了这个插件，用于在Vue3中实现类似的功能，
 目前支持.vue和.js文件中的变量提示，支持自定义颜色变量提示，支持自定义变量提示，支持自定义文件夹路径

## 功能

- 变量提示
  支持多种方式引入全局var变量和全局class文件提示，支持monorepo架构下子项目为工作区开发提示，支持解析嵌套的var变量的原始值
- snippet
  生成vue3模版
- 当前文件template中的class名称在当前文件style中输入提示
![avatar](/模版class提示.gif)

## 使用

### snippet
  
  输入vueTo，生成一个vue3的模版，仅在.vue和.js文件中生效

### 定义全局var变量/全局class文件路径

- 方式一
使用`Ctrl+Shift+P`/`⌘⇧P`，输入'测试一下',选择项目中的var变量文件夹所在目录，reload vscode即可使用

- 方式二
增加了.vscode配置，可以使用`.vscode\setting.json`

```
{
  "hwPlugin.localesPaths": [
    "hwxt_common/hw-xt-style/VariableCss"
  ],
  "hwPlugin.globalsCss": [
    "hwxt_common/hw-xt-style/VariableCss/globstyle.css"
  ],

}
```

避免每次启动都要手动指定文件夹位置
配置支持monorepo架构的子项目生效，因此建议在最外层文件夹下配置，适配团队成员每个人的开发习惯

## 后续规划
  
### CSS代码提示

   优化template中class=""输入提示

  增加对less和scss变量的支持
  
  scripte标签中重复css class诊断

  颜色值未使用颜色变量提示

### iconfont拉取

  使用`Ctrl+Shift+P`/`⌘⇧P` 在monorepo结构下为所有项目拉取iconfont，并自动提交到svn

### 翻译
  
  复制一段英文的时候右键菜单选择翻译，调腾讯接口
