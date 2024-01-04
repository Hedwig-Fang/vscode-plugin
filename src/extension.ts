import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import { getCSSAST, getCssValue, getNewCSSAST } from './parseCss';
import { getFullFilePath, findSettingsFile } from './utils';
// import vueParser = require('@vue/compiler-dom');
// import postcss = require('postcss');
interface IItem {
  prop: string;
  value: string;
}
interface GItem {
  selector: string;
  node: IItem[];
}
interface IMap {
  [key:string]: string
}
const cssMap:IMap = {};

function setGlobCss(path: string, context: vscode.ExtensionContext) {
  const fileContent = fs.readFileSync(path, 'utf-8');
  const list = getNewCSSAST(fileContent);
  const provider = vscode.languages.registerCompletionItemProvider(
    ['vue', 'css', 'less', 'scss'],
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

// function getConfiguration(uri?: vscode.Uri) {
//   // 如果传递了 URI，则使用该 URI，否则使用根路径
//   const folderUri = uri || vscode.workspace.workspaceFolders[0]?.uri;

//   if (folderUri) {
//       const folderPath = folderUri.fsPath;

//       // 查找配置文件路径
//       const configFilePath = path.join(folderPath, '.vscode', 'settings.json');

//       // 如果配置文件存在，返回配置，否则递归查找父文件夹的配置
//       if (fs.existsSync(configFilePath)) {
//           return vscode.workspace.getConfiguration('hwPlugin', folderUri);
//       } else {
//           const parentFolderUri = vscode.Uri.file(path.dirname(folderPath));
//           return getConfiguration(parentFolderUri);
//       }
//   }

//   return vscode.workspace.getConfiguration('hwPlugin');  // 返回全局配置
// }

export function activate(context: vscode.ExtensionContext) {
  // 获取当前工作区的配置

  //   const url = currentMainPath ? findSettingsFile(currentMainPath): undefined;

  // const config = getConfiguration();
  const currentFolder = vscode.workspace.workspaceFolders?.map(res => res.uri.path
    )[0] || ''
  const {
    foler, url
  } = findSettingsFile(currentFolder);
  let config;
  let settingsPath: string | undefined;
  if(foler !== currentFolder) {
    const jsonContent = fs.readFileSync(url, 'utf8');

    // Parse the JSON content
    const parsedData = JSON.parse(jsonContent.replace(/,(?=\s*})/, ''));
    config = {
      get: (key: string) => {
        const realKey =  `hwPlugin.${key}`
       return parsedData[realKey]
      },
    }
    settingsPath = foler;
    // config = new Map(Object.entries(parsedData)) as unknown as vscode.WorkspaceConfiguration;
  } else {
    const uri = vscode.Uri.parse(url as unknown as string)
    config = vscode.workspace.getConfiguration('hwPlugin', uri);
    settingsPath = currentFolder;
  }



  const localesPaths: string[] = config.get('localesPaths') || [];
  localesPaths.forEach((res) => {
    const path = getFullFilePath(res, settingsPath) || '';
    setCss(path, context)

  })
  const globCssList: string[] = config.get('globalsCss') || [];
  globCssList.forEach((res) => {
    const path = getFullFilePath(res, settingsPath) || '';
    setGlobCss(path, context)
  })
  const disposable = vscode.commands.registerCommand('vscode-plugin-demo.测试一下', async () => {
    const currentMainPath = vscode.workspace.workspaceFolders?.map(res => res.uri.path
      )[0];
  
    const currentstylePath = `${currentMainPath}/src/style`

    const folderPath = await vscode.window
      .showOpenDialog({
        // 可选对象
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false, // 是否可以选择多个
        defaultUri: vscode.Uri.file(currentstylePath), // 默认打开本地路径
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
    // const children = ast.children
    // console.log(children)
    // const linePrefix = document.lineAt(position).text.substr(0, position.character);
    // 如果当前行以 '--' -开头，提供代码补全ar
    // if (linePrefix.endsWith('.') || linePrefix.includes('class="')) {

        const items = this.items.map((item: GItem) => {
          const completionItem = new vscode.CompletionItem(item.selector, vscode.CompletionItemKind.Variable);
          completionItem.documentation = new vscode.MarkdownString(`${item.selector}: 
          ${item.node}`);
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
