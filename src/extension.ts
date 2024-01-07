import * as vscode from 'vscode';
import fs = require('fs');
import { getCSSAST, getCssValue, getCssClassNameAST, parseVue } from './parseCss';
import { getFullFilePath, findSettingsFile,getIconFontData, getIconFontDataDefine } from './utils';
import { getFilesInDirectory } from './utils';

interface IItem {
  prop: string;
  value: string;
}
interface GItem {
  selector: string;
  nodes: IItem[];
}

interface IMap {
  [key:string]: string;
}

type IIconArray  = ReturnType<typeof getIconFontDataDefine>
const cssMap:IMap = {};
const log = vscode.window.createOutputChannel("HwPlugin");
log.show();

function setCssClass(path: string, context: vscode.ExtensionContext) {
  const fileContent = fs.readFileSync(path, 'utf-8');
  const list = getCssClassNameAST(fileContent);
  const provider = vscode.languages.registerCompletionItemProvider(
    'vue',
    new GlobClassNameCompletionItemProvider(list),
		'.'
  );
	log.appendLine('setGlobCss注册成功');
  context.subscriptions.push(provider);
}

function setCssVar(selectedFolder: string, context: vscode.ExtensionContext) {
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
      new CssVarCompletionItemProvider(uniqueList),
      '--'
    );
	log.appendLine('setCss注册成功');

      context.subscriptions.push(provider);
}

 function setUserHtmlClassName(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    'vue',
    new UserClassCompletionItemProvider(),
		'.'
  );
	log.appendLine('setCurrentHtml注册成功');

	context.subscriptions.push(provider);

 }

 async function getCustomContent() {
	const list = await getIconFontData() as IIconArray

	// 返回自定义的 HTML 内容
	return `
			<html>
			<body>
					<h1>icon font快速查找</h1>
					${list.map(item => {
						return (`
						<li>
						<span>icon-${item.font_class}<span>
						${item.show_svg}
						</li>
						`)
					}) }
			</body>
			</html>
	`;
}
 async function setIconfont(context: vscode.ExtensionContext) {
	const list = await getIconFontData() as IIconArray
	log.appendLine(list+ '获取到icon列表')
	const provider = vscode.languages.registerCompletionItemProvider(
    'vue',
    new IconfontCompletionItemProvide(list),
		'.'
  );
	log.appendLine('setIconfont注册成功');

	context.subscriptions.push(provider);
 }
export function activate(context: vscode.ExtensionContext) {
	    // 注册命令
			const disposable2 = vscode.commands.registerCommand('vscode-plugin-demo.iconfont', () => {
        // 创建 WebviewPanel
        const panel = vscode.window.createWebviewPanel(
            'customContent', // 标识符，唯一标识 WebviewPanel 实例
            'Custom Content', // 面板标题
            vscode.ViewColumn.One, // 显示在编辑器的位置
            {}
        );

        // 获取 Webview 内容
        getCustomContent().then(res=> {
					const content = res;
					panel.webview.html = content;

				});

        // 设置 Webview 内容
    });

    context.subscriptions.push(disposable2);
	console.log('看看console.log好使吗')
  setUserHtmlClassName(context);
	setIconfont(context)
  // 获取当前工作区的配置
  const currentFolder = vscode.workspace.workspaceFolders?.map(res => res.uri.fsPath
    )[0] || ''
  const {
    folder, url
  } = findSettingsFile(currentFolder);

  let config;
  let settingsPath: string;
  if(folder && folder !== currentFolder) {
    const jsonContent = fs.readFileSync(url, 'utf8');
    let parsedData: Record<string, string[]>;
    try {
       parsedData = JSON.parse(jsonContent.replace(/,(?=\s*})/, ''));
    } catch (error) {
      // vscode.window.showErrorMessage('配置文件解析失败');
			log.appendLine(`配置文件解析失败,内容为${jsonContent}`);

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
    const path = getFullFilePath(res, settingsPath) || '';
		log.appendLine(`获取到localesPath:${path}`);
    setCssVar(path, context)

  })
  const globCssList: string[] = config.get('globalsCss') || [];
  globCssList.forEach((res) => {
    const path = getFullFilePath(res, settingsPath) || '';
		log.appendLine(`获取到globCssList:${path}`);

    setCssClass(path, context)
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
      setCssVar(selectedFolder, context);

    }
  });

  context.subscriptions.push(disposable);
}
class CssVarCompletionItemProvider implements vscode.CompletionItemProvider {
  // 在这里定义你的数组
  private items: IItem[];
  constructor(items: IItem[]) {
    this.items = items;
  }
	defineCompletionItemProvider(isVar?: boolean){
		const items = this.items.map((item: IItem) => {
			const completionItem = new vscode.CompletionItem(item.prop, vscode.CompletionItemKind.Variable);
			completionItem.documentation = new vscode.MarkdownString(`${item.prop}:
			${getCssValue(item.value, cssMap)}`);
			completionItem.detail = item.value;
			completionItem.filterText = item.prop;
			completionItem.insertText = isVar ? `var(${item.prop})` : item.prop;
      const propNumber = item.prop.match(/\d+/)?.[0];
      completionItem.sortText = propNumber;
			return completionItem;
		});
		return items
	}
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    // 获取当前行的文本

    const linePrefix = document.lineAt(position).text.substr(0, position.character);
		log.appendLine(`${linePrefix}${document.lineAt(position).text}${linePrefix.includes(':')}`)


    // 如果当前行以 '--' -开头，提供代码补全ar
    if (linePrefix.endsWith('-') || linePrefix.endsWith('var(')) {
      return this.defineCompletionItemProvider(false);
    } else {
			if(linePrefix.includes(':')) {
				return this.defineCompletionItemProvider(true);
			}
		}


    return [];
  }
}

class IconfontCompletionItemProvide implements vscode.CompletionItemProvider {
	private items;
  constructor(items: IIconArray) {
    this.items = items;
  }
	provideCompletionItems() {


		log.appendLine(this.items+ 'svg' )

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const items = this.items.map((i)=> {
			const {font_class, show_svg} = i;
			const completionItem = new vscode.CompletionItem(`icon-${font_class}`, vscode.CompletionItemKind.Variable);
			const imgSrc = `data:image/svg+xml;utf8,${encodeURIComponent(show_svg)}`;
			const imgElement = `<img src="${imgSrc}" alt="SVG Image" width="50" height="50"/>`;

			const markdownString = new vscode.MarkdownString(`${imgElement}`);

			markdownString.supportHtml = true
			completionItem.documentation =  markdownString;
			// completionItem.sortText = index + 'a';

			completionItem.insertText = `icon-${font_class}`.replace('.', '')

			return completionItem
		})
		log.appendLine(items+ '获取到icon列表')

		return items
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
		log.appendLine('获取到了classList' + items);

    return items
    }
  }
class GlobClassNameCompletionItemProvider implements vscode.CompletionItemProvider {
  // 在这里定义你的数组
  private items: GItem[];
  constructor(items: GItem[]) {
    this.items = items;
  }
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    // 获取当前行的文本
    // const content = document.getText();

    // const ast = vueParser.parse(content);
    // const children = ast.children;
    // console.log(children)
    // const linePrefix = document.lineAt(position).text.substr(0, position.character);
		const line = document.lineAt(position.line);
		const textBeforeCursor = line.text.substr(0, position.character);
    const prefix = textBeforeCursor.slice(0, -1);

    // 删除用户输入的触发字符之前的文本
		log.appendLine(line.text + '获取到了line'+ textBeforeCursor + '输入前的光标' + prefix+ '触发前缀');

        const items = this.items.map((item: GItem) => {
          const {nodes, selector} = item || {};
          const nodeContent = nodes.map((res: IItem)=> {
            const {prop, value} = res || {};
            return `${prop}: ${value}`
        }).join('\t')
					const tipSelector = selector.replace('.', '')
          const completionItem = new vscode.CompletionItem(tipSelector, vscode.CompletionItemKind.Variable);
          completionItem.documentation = new vscode.MarkdownString(`${tipSelector}:
          ${nodeContent}`);
				completionItem.insertText = new vscode.SnippetString('${1:' + tipSelector + '}');
				const rangeToRemove = new vscode.Range(position.line, position.character-1, position.line, position.character);
				completionItem.additionalTextEdits = [vscode.TextEdit.delete(rangeToRemove)];
          // completionItem.detail = item.node;
          return completionItem;
        });
			log.appendLine(`获取到了globalCss`);

      return items;

  }
}
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
// This method is called when your extension is deactivated
export function deactivate() { }
