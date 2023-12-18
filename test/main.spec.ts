import {test, expect} from 'vitest';
import { getCSSAST, getNewCSSAST } from '../src/parseCss'
const cssTest =  `
.hw-font-12-ch-reg{
  font-size: var(--font-base-size-12);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
  line-height: var(--font-base-height-20);
 }
 .hw-font-14-ch-reg{
  font-size: var(--font-base-size-14);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
   line-height: var(--font-base-height-22);
 }
 hw
 .hw-font-16-ch-reg{
  font-size: var(--font-base-size-16);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
   line-height: var(--font-base-size-16);
 }
 .hw-font-20-ch-reg{
  font-size: var(--font-base-size-20);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
   line-height: var(--font-base-size-20);
 }
 .hw-font-24-ch-reg{
  font-size: var(--font-base-size-24);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
    line-height: var(--font-base-size-24);
 }
 .hw-font-36-ch-reg{
  font-size: var(--font-base-size-36);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
     line-height: var(--font-base-size-36);
 }
 .hw-font-48-ch-reg{
  font-size: var(--font-base-size-48);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
      line-height: var(--font-base-size-48);
 }
 .hw-font-56-ch-reg{
  font-size: var(--font-base-size-56);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-400);
       line-height: var(--font-base-size-56);
 }
 
 .hw-font-14-ch-bold{
  font-size: var(--font-base-size-14);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-600);
   line-height: var(--font-base-height-22);
 }
 
 .hw-font-12-ch-bold{
  font-size: var(--font-base-size-12);
  color: var(--text-main-color);
  font-weight: var(--font-base-weight-600);
   line-height: var(--font-base-height-20);
 }
 .hw-hideText{
   overflow: hidden;
   white-space: nowrap;
   text-overflow: ellipsis;
 }`;

const mockRes =[
  '--text-main-color',
  '--feedback-hover',
  '--feedback-active',
  '--feedback-accent',
  '--feedback-notice',
  '--linear-geekblue',
  '--text-main',
  '--text-sub',
  '--text-assist',
  '--text-placeholder-disabled',
  '--text-white',
  '--icon-main',
  '--icon-sub',
  '--icon-assist',
  '--icon-placeholder-disabled',
  '--icon-white',
  '--border-ultrastrong',
  '--border-strong',
  '--border-normal',
  '--border-weak',
  '--divider-strong',
  '--divider-normal',
  '--divider-weak',
  '--filled-ultrastrong',
  '--filled-strong',
  '--filled-normal',
  '--filled-weak',
  '--filled-white',
  '--tsp-filled-tootip',
  '--tsp-filled-cover',
  '--tsp-filled-ultrastrong',
  '--tsp-filled-strong',
  '--tsp-filled-medium',
  '--tsp-filled-weak',
  '--primary-color',
  '--info-color',
  '--success-color',
  '--processing-color',
  '--error-color',
  '--highlight-color',
  '--warning-color',
  '--normal-color',
  '--white',
  '--black',
  '--primary-1',
  '--primary-2',
  '--primary-3',
  '--primary-4',
  '--primary-5',
  '--primary-6',
  '--primary-7',
  '--primary-8',
  '--primary-9',
  '--primary-10'
]
test('init', ()=> {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const res =  getCSSAST(cssTest) as any;
 const csssNodes = res.nodes[0].nodes;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const propList = csssNodes.map((res: any)=> res.prop)
 
//  console.log(propList, '2222');
  expect(propList).toStrictEqual(mockRes);
})
test.only('第二次', ()=>{
  const res = getNewCSSAST(cssTest) as any;
  console.log(res)
})