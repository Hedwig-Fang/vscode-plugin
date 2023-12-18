import postcss = require("postcss");
import { PluginCreator } from 'postcss';

interface CssItem {
prop: string,
value: string,
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const myPlugin: PluginCreator<{ customOption: string }> = () => {
  const cssItems: CssItem[] = [];
  return {
    postcssPlugin: 'my-plugin',
    cssItems,
    Root(root) {
      // 在这里编写你的插件逻辑
      root.walkRules(rule => {
        // 输出规则的选择器
        // console.log('Selector:', rule.selector);
        const selector = rule.selector;
        // 遍历规则的每个声明
        rule.walkDecls(decl => {
          const property = decl.prop;
          const value = decl.value;
          // 输出声明的属性和值
          // console.log('Property:', decl.prop, 'Value:', decl.value);
          // if(selector) {
          //   cssItems.push({
          //     prop: selector,
          //     value: {
          //       [property]: 
          //     },
          //   });
          // }

          // 在属性值中执行一些自定义操作

          decl.value = decl.value.toUpperCase();
        });
      });
    },
  };
};

// 添加 TypeScript 插件声明
myPlugin.postcss = true;

export default {
  myPlugin
};
export const getNewCSSAST = (css: string) => {

  const res = postcss([myPlugin]).process(css).sync();
  const {lastPlugin: cssItems } = res;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const cssItems = (res as any).cssItems as CssItem[];
  
  return cssItems
}
// 先写死 因为结构都是一样的 后面再优化
export const getCSSAST = (css: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = postcss.parse(css) as any;
   const csssNodes = res.nodes[0].nodes;
  //  const propList = csssNodes.map((res: any)=> res.prop)
  return csssNodes;
}
