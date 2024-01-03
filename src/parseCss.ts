import postcss = require("postcss");

export const getNewCSSAST = (css: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = postcss.parse(css) as any;
  const csssNodes = res.nodes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return csssNodes.map((res: any)=> {
    const {nodes, selector} = res;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const realNodes = nodes.map((res: any)=> {
      const {prop, value} = res;

      return {
        prop,
        value
      }
    });
    return {
      nodes: realNodes,
      selector,
    }
  })

}
// 先写死 因为结构都是一样的 后面再优化
export const getCSSAST = (css: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = postcss.parse(css) as any;
  const csssNodes = res.nodes[0].nodes;
  //  const propList = csssNodes.map((res: any)=> res.prop)
  if(Array.isArray(csssNodes)){
    return csssNodes;
  }
  return []
}

const matchedValue = (value: string) => {
  const regexPattern = /var\(\s*--([a-zA-Z0-9-]+)\s*\)/;
  const [, matchedValue] = value.match(regexPattern) || [];
  return matchedValue
}
export function getCssValue(value: string, cssMap: Record<string, string>): string {
  const realValue = `${matchedValue(value) ? cssMap[`--${matchedValue(value)}`] : value}`;

  if(!matchedValue(realValue)) {
    return realValue
  } 
  return getCssValue(realValue, cssMap);
}