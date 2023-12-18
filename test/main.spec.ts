import {test, expect} from 'vitest';
import { getCSSAST } from '../src/parseCss'
const cssTest =  `
:root{
  

--text-main-color:var(--grey-10);


--feedback-hover: var(--opaclight-2);

--feedback-active: var(--opaclight-3);

--feedback-accent:rgba(65, 115, 243, 0.08);

--feedback-notice:rgba(55, 174, 241, 0.08);


--linear-geekblue : linear-gradient(135deg, #3274F4 0%, #2F54EB 45.75%, #1D39C4 92.71%);



--text-main:var(--grey-10);

--text-sub: var(--grey-8);

--text-assist:var(--grey-6);

--text-placeholder-disabled:var(--grey-4);

--text-white:var(--white);


--icon-main:var(--grey-10);

--icon-sub:var( --grey-8);

--icon-assist:var(--grey-6);

--icon-placeholder-disabled: var(--grey-4);

--icon-white: var(--white);


--border-ultrastrong: var(--grey-6);

--border-strong:var( --grey-4);

--border-normal:var( --grey-3);

--border-weak: var(--grey-2);


--divider-strong:var( --opaclight-4);

--divider-normal: var(--opaclight-3);

--divider-weak: var(--opaclight-2);



--filled-ultrastrong: var(--grey-4);

--filled-strong:var( --grey-3);

--filled-normal: var(--grey-2);

--filled-weak: var(--grey-1);

--filled-white: var(--base-white);

--tsp-filled-tootip:var( --opaclight-9);

--tsp-filled-cover: var(--opaclight-6);

--tsp-filled-ultrastrong:var(--opaclight-4);

--tsp-filled-strong:var(--opaclight-3);

--tsp-filled-medium:var(--opaclight-2);

--tsp-filled-weak: var(--opaclight-1);



--primary-color:var(--geekblue-6);
--info-color:var(--geekblue-6);
--success-color:var(--green-6);
--processing-color:var(--geekblue-6);
--error-color:var(--red-6);
--highlight-color:var(--red-6);
--warning-color:var(--gold-6);
--normal-color: #d9d9d9;
--white: #fff;
--black: #000;


--primary-1:var(--geekblue-1); 
--primary-2:var(--geekblue-2); 
--primary-3:var(--geekblue-3); 
--primary-4:var(--geekblue-4); 
--primary-5:var(--geekblue-5); 
--primary-6:var(--primary-color); 
--primary-7:var(--geekblue-7);
--primary-8:var(--geekblue-8); 
--primary-9:var(--geekblue-9); 
--primary-10:var(--geekblue-10); 
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