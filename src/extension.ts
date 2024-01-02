import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import { getCSSAST } from './parseCss';
import { getFullFilePath } from './utils'
// import postcss = require('postcss');
interface IError {
  message: string
}
interface IItem {
  prop: string;
  value: string;
}

function setCss(selectedFolder: string, context: vscode.ExtensionContext) {
  // 读取文件夹中的所有文件
  const files = getFilesInDirectory(selectedFolder);
  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fileContent = fs.readFileSync(file, 'utf-8');
    try {

      const list = getCSSAST(fileContent);
      const provider = vscode.languages.registerCompletionItemProvider(
        ['vue', 'css', 'less', 'scss'],
        new CustomCompletionItemProvider(list),
        '--'
      );

      context.subscriptions.push(provider);
    } catch (error: unknown) {

      vscode.window.showErrorMessage(`Error reading files: ${(error as IError).message}`);
    }

  }
}

export function activate(context: vscode.ExtensionContext) {
  // 获取当前工作区的配置
  const config = vscode.workspace.getConfiguration('hwPlugin');
  const localesPaths: string[] = config.
  get('localesPaths') || [];
  localesPaths.forEach((res) => {
    const path = getFullFilePath(res) || '';
    setCss(path, context)

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
    console.log(linePrefix, 'line')


    // 如果当前行以 '--' -开头，提供代码补全ar
    if (linePrefix.endsWith('-') || linePrefix.endsWith('var(')) {
      const items = this.items.map((item: IItem) => {
        const completionItem = new vscode.CompletionItem(item.prop, vscode.CompletionItemKind.Variable);
        completionItem.documentation = new vscode.MarkdownString(`${item.prop}: ${item.value}`);
        completionItem.detail = item.value;
        return completionItem;
      });
      return items;
    }

    return [];
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
