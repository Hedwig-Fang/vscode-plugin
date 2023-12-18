import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');
import {getCSSAST} from './parseCss';
// import postcss = require('postcss');
interface IError {
  message: string
}
export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('vscode-plugin-demo.测试一下', async () => {
	const currentMainPath = vscode.workspace.workspaceFolders?.map( res =>res.uri.path
	)[0];
	const currentstylePath =  `${currentMainPath}/src/style`

	const folderPath = await	vscode.window
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

      // 读取文件夹中的所有文件
      try {
        const files = getFilesInDirectory(selectedFolder);
				// files.forEach((file: any) => {
				for (const file of files) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const fileContent = fs.readFileSync(file, 'utf-8');
          const list = getCSSAST(fileContent);
          const provider = vscode.languages.registerCompletionItemProvider(
            ['vue', 'css'],
            new CustomCompletionItemProvider(list),
            '--'
          );
        
          context.subscriptions.push(provider);
					
				}
				// });
      } catch (error: unknown) {
        
        vscode.window.showErrorMessage(`Error reading files: ${(error as IError).message}`);
      }
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
  private items: string[];
  constructor(items: string[]) {
    this.items = items;
  }
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    // 获取当前行的文本
    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    // 如果当前行以 '--' 开头，提供代码补全
    if (linePrefix.endsWith('-') || linePrefix.endsWith('hw')) {
      const items = this.items.map((item) => {
        const completionItem = new vscode.CompletionItem(item, vscode.CompletionItemKind.Value);
        return completionItem;
      });
      return items;
    }

    return [];
  }
}

// This method is called when your extension is deactivated


export function deactivate() {}
