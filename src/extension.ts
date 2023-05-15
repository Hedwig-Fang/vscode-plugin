// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';



export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-plugin-demo" is now active!');


	let disposable = vscode.commands.registerCommand('vscode-plugin-demo.helloWorld', () => {

	const currentMainPath = vscode.workspace.workspaceFolders?.map( res =>res.uri.path
	)[0];
	const currentstylePath =  `${currentMainPath}/src/hw-design-vue/lib/style/hwThemesDefault`

	
		vscode.window
		.showOpenDialog({
			// 可选对象
			canSelectFiles: true, // 是否可选文件
			canSelectFolders: false, // 是否可选文件夹
			canSelectMany: false, // 是否可以选择多个
			defaultUri: vscode.Uri.file(currentstylePath), // 默认打开本地路径
			openLabel: "选择默认样式入口文件",
		})
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
