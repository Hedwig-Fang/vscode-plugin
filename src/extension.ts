import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import { getCSSAST, getCssValue, getNewCSSAST, parseVue } from './parseCss';
import { getFullFilePath, findSettingsFile } from './utils';
// import postcss = require('postcss');
interface IItem {
  prop: string;
  value: string;
}
interface GItem {
  selector: string;
  nodes: IItem[];
}

interface IMap {
  [key:string]: string
}
const cssMap:IMap = {};

function setGlobCss(path: string, context: vscode.ExtensionContext) {
  const fileContent = fs.readFileSync(path, 'utf-8');
  const list = getNewCSSAST(fileContent);
  const provider = vscode.languages.registerCompletionItemProvider(
    'vue',
    new GlobCompletionItemProvider(list),
    '.'
  );
  context.subscriptions.push(provider);
}

function setCss(selectedFolder: string, context: vscode.ExtensionContext) {
  // 读取文件夹中的所有文件
  const files = getFilesInDirectory(selectedFolder);
  let list: IItem[] = [];
  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fileContent = fs.readFileSync(file, 'utf-8');
    try {
      getCSSAST(fileContent).forEach((item: IItem)=> {
      Reflect.set(cssMap, item.prop, item.value);
    })

    list = [...list, ...getCSSAST(fileContent)];
    // eslint-disable-next-line no-empty
    } catch (error) {
      
    }

    }
    const uniqueList = [...new Set(list.map(item => item.prop))].map(prop => list.find(item => item.prop === prop)) as IItem[];
    const provider = vscode.languages.registerCompletionItemProvider(
      'vue',
      new CustomCompletionItemProvider(uniqueList),
      '--'
    );
      context.subscriptions.push(provider);
}

 function setCurrentHtml(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    'vue',
    new UserClassCompletionItemProvider(),
    '--'
  );
    context.subscriptions.push(provider);

 }
export function activate(context: vscode.ExtensionContext) {
  setCurrentHtml(context)
  // 获取当前工作区的配置
  const currentFolder = vscode.workspace.workspaceFolders?.map(res => res.uri.fsPath
    )[0] || ''
  const {
    folder, url
  } = findSettingsFile(currentFolder);

  let config;
  let settingsPath: string | undefined;
  if(folder && folder !== currentFolder) {
    const jsonContent = fs.readFileSync(url, 'utf8');
    let parsedData: any;
    try {
       parsedData = JSON.parse(jsonContent.replace(/,(?=\s*})/, ''));
    } catch (error) {
      vscode.window.showErrorMessage('配置文件解析失败');
    }
    config = {
      get: (key: string) => {
        const realKey =  `hwPlugin.${key}`
       return parsedData[realKey]
      },
    }
    settingsPath = folder;
  } else if(url) {
    const uri =  vscode.Uri.parse(url as unknown as string);
    config = vscode.workspace.getConfiguration('hwPlugin', uri);
    settingsPath = currentFolder;
  } else {
    vscode.window.showInformationMessage('当前工作区没有配置文件,请使用 测试一下入口选择手动路径');
    return
  }

  const localesPaths: string[] = config.get('localesPaths') || [];

  localesPaths.forEach((res) => {
  vscode.window.showInformationMessage(`settingsPath:${settingsPath}`);
    const path = getFullFilePath(res, settingsPath) || '';
  vscode.window.showInformationMessage(`获取到localesPath:${path}`);

    setCss(path, context)

  })
  const globCssList: string[] = config.get('globalsCss') || [];
  globCssList.forEach((res) => {
    const path = getFullFilePath(res, settingsPath) || '';
    setGlobCss(path, context)
  })
  const disposable = vscode.commands.registerCommand('vscode-plugin-demo.测试一下', async () => {
  
    const folderPath = await vscode.window
      .showOpenDialog({
        // 可选对象
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false, // 是否可以选择多个
        defaultUri: vscode.Uri.file(currentFolder), // 默认打开本地路径
        openLabel: "选择默认样式入口文件",
      })
    if (folderPath && folderPath.length > 0) {
      const selectedFolder = folderPath[0].fsPath;
      setCss(selectedFolder, context);

    }
  });

  context.subscriptions.push(disposable);
}
// 获取文件夹中的所有文件
function getFilesInDirectory(directoryPath: string): string[] {
  const files = [];
  const entries = fs.readdirSync(directoryPath);

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry);
    const stat = fs.statSync(entryPath);

    if (stat.isDirectory()) {
      // 如果是子文件夹，则递归调用
      files.push(...getFilesInDirectory(entryPath));
    } else {
      // 如果是文件，则添加到文件列表
      files.push(entryPath);
    }
  }

  return files;
}

class CustomCompletionItemProvider implements vscode.CompletionItemProvider {
  // 在这里定义你的数组
  private items: IItem[];
  
  constructor(items: IItem[]) {
    this.items = items;
  }
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    // 获取当前行的文本
    const linePrefix = document.lineAt(position).text.substr(0, position.character);
    // 如果当前行以 '--' -开头，提供代码补全ar
    if (linePrefix.endsWith('-') || linePrefix.endsWith('var(')) {
      const items = this.items.map((item: IItem) => {
        const completionItem = new vscode.CompletionItem(item.prop, vscode.CompletionItemKind.Variable);
        completionItem.documentation = new vscode.MarkdownString(`${item.prop}: 
        ${getCssValue(item.value, cssMap)}`);
        completionItem.detail = item.value;
        return completionItem;
      });
      return items;
    }

    return [];
  }
}

class UserClassCompletionItemProvider implements vscode.CompletionItemProvider {
  // 在这里定义你的数组
  // private items: string[];
  
  // constructor(items: string[]) {
  //   this.items = items;
  // }
  provideCompletionItems(
    document: vscode.TextDocument,
    ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    const content = document.getText();
    const classList = parseVue(content) as string[];
    const items =  classList.map((item: string) => {
      const completionItem = new vscode.CompletionItem(item, vscode.CompletionItemKind.Class);
      return completionItem;
    });
    return items
    }
  }
class GlobCompletionItemProvider implements vscode.CompletionItemProvider {
  // 在这里定义你的数组
  private items: GItem[];
  
  constructor(items: GItem[]) {
    this.items = items;
  }
  provideCompletionItems(
    // document: vscode.TextDocument,
    // position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    // 获取当前行的文本
    // const content = document.getText();

    // const ast = vueParser.parse(content);
    // const children = ast.children;
    // console.log(children)
    // const linePrefix = document.lineAt(position).text.substr(0, position.character);
    // 如果当前行以 '--' -开头，提供代码补全ar

        const items = this.items.map((item: GItem) => {
          const {nodes, selector} = item || {};
          const nodeContent = nodes.map((res: IItem)=> {
            const {prop, value} = res || {};
            return `${prop}: ${value}`
        }).join('\t')
          const completionItem = new vscode.CompletionItem(selector.replace('.', ''), vscode.CompletionItemKind.Variable);
          completionItem.documentation = new vscode.MarkdownString(`${selector.replace('.', '')}: 
          ${nodeContent}`);
          // completionItem.detail = item.node;
          return completionItem;
        });
      return items;

  }
}
// This method is called when your extension is deactivated

// export class CodelensProvider implements vscode.CodeLensProvider {
//   private codeLenses: vscode.CodeLens[] = [];
//   private regex: RegExp;
//   onDidChangeCodeLenses?: vscode.Event<void> | undefined;
//   provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
//     const text = document.getText();
//     let matches;
//     while ((matches = regex.exec(text)) !== null ) {

//     }
//   }
//   resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
//     throw new Error('Method not implemented.');
//   }

// }
export function deactivate() { }
