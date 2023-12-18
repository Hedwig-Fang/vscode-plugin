import postcss = require('postcss');

// 先写死 因为结构都是一样的 后面再优化
export const getCSSAST = (css: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = postcss.parse(css) as any;
   const csssNodes = res.nodes[0].nodes;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const propList = csssNodes.map((res: any)=> res.prop)
  return propList;
}
