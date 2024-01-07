/* eslint-disable @typescript-eslint/no-explicit-any */
import postcss from 'postcss';
import { parse,ElementNode} from '@vue/compiler-dom';


export const getCssClassNameAST = (css: string) => {
  const res = postcss.parse(css);
  const csssNodes = res.nodes as any;
  return csssNodes.map((res: { nodes: any; selector: any; })=> {
    const {nodes, selector} = res;
    const realNodes = nodes.map((res: { prop: any; value: any; })=> {
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
  const res = postcss.parse(css) as any;
  const csssNodes = res.nodes[0].nodes;
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

function traverseTemplateNode(node: any, classNameList: any[]) {

  if (node.props && node.props.length && node.props.find((prop: any) => prop.name === 'class')
  ){
    const classNameStr = node.props.find((prop: any) => prop.name === 'class').value.content;
    const classNameArr = classNameStr.split(' ') as string[];
    classNameArr.forEach((className: string)=>{
      if(!classNameList.includes(className)) {
        classNameList.push(className)
      }
    })

  }
  if (node.children) {
    // 递归遍历子节点
    node.children.forEach((item: any)=>{
      traverseTemplateNode(item, classNameList);
    });
  }
  return classNameList;

}

export function parseVue(content: string): string[] {
const res = parse(content) as any;
const { children } = res;
const template = children.find((item: ElementNode) => item.tag === 'template');
const classNameList = traverseTemplateNode(template, []);
return classNameList
}
