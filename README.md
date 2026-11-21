<h1 align="center">QQ 通话麦克风排序</h1>

<p align="center">在 QQ 通话菜单里拖动麦克风。排好一次，下次接着用。</p>

<p align="center">
  <a href="https://github.com/RinTaigyoku/LiteLoaderQQNT-Mic-Order/releases/latest"><img alt="Download" src="https://img.shields.io/github/v/release/RinTaigyoku/LiteLoaderQQNT-Mic-Order?label=Download&color=c7dc8d&labelColor=18221c"></a>
  <a href="https://github.com/LiteLoaderQQNT/LiteLoaderQQNT"><img alt="LiteLoaderQQNT" src="https://img.shields.io/badge/插件-LiteLoaderQQNT-c7dc8d?labelColor=18221c"></a>
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/License-MIT-c7dc8d?labelColor=18221c"></a>
</p>

<p align="center"><a href="#下载">下载</a> · <a href="#怎么用">使用方法</a> · <a href="#几个常见问题">常见问题</a> · <a href="#实现原理">实现原理</a> · <a href="#english">English</a></p>

我平时用 Dubbing AI Microphone 打 QQ 电话。每次展开菜单都要在几支麦克风里找它，所以做了这个小插件。想把哪支放前面，直接在通话菜单里拖一下就行。

这是一个 Windows 上的第三方 [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) 插件，由 **RinTaigyoku** 维护。

## 下载

从 [Releases](https://github.com/RinTaigyoku/LiteLoaderQQNT-Mic-Order/releases/latest) 下载 `qq-call-mic-order.zip`。已经装了 LiteLoaderQQNT 的话，在 QQ 设置的 LiteLoaderQQNT 页面选择安装插件，选中 ZIP，然后彻底退出并重开 QQ。

也可以手动解压到 LiteLoaderQQNT 的 `plugins/qq-call-mic-order/` 目录。解压后确认 `manifest.json` 和两个 JS 文件都在这一层。

## 怎么用

1. 打开 QQ 通话里的设备菜单。
2. 按住麦克风右侧的六点把手，拖到想要的位置。松开就会保存。
3. 要切换麦克风，点设备的名字。扬声器仍在下面，按 QQ 原来的顺序显示。

首次使用时，如果菜单里有 Dubbing AI Microphone，插件会把它放在第一行。之后按你自己拖好的顺序来。

## 几个常见问题

**重启 QQ 要重新拖吗？** 不用。顺序存在 LiteLoaderQQNT 数据目录的 `data/qq-call-mic-order/config.json`，重新开 QQ 会读回来。

**排序后会选错设备吗？** 插件移动的是原来那一行的显示位置，点选还是交给 QQ 原来的回调。实测把 Dubbing AI Microphone 换到另一行后，点选仍命中同一个设备 ID。

**会改 Windows 的默认麦克风吗？** Windows 音频设置保持原样。插件只随 QQ 运行，顺序保存在本机，也不需要额外权限。

**看不到拖动把手怎么办？** 先确认是在 Windows 版 QQ 的通话设备菜单里。这次实测用的是 QQNT **9.9.31-49599** 和 LiteLoaderQQNT **1.4.1**。不同 QQ 版本可能改过菜单结构。如果设备列表里有重名条目，插件会保留该列表的原样，避免把保存的顺序套到同名设备上。遇到问题可以到 [Issues](https://github.com/RinTaigyoku/LiteLoaderQQNT-Mic-Order/issues)，写上两个版本号和复现步骤。

## 实现原理

QQ 展开设备菜单时，麦克风和扬声器已经是网页里两组现成的条目。插件通过 LiteLoaderQQNT 在通话窗口运行，只处理「麦克风」和「扬声器」两个标题之间的行。

拖动时，脚本先测出每一行原来的位置，再用 CSS `translate` 把整行挪到新的位置。设备名、点击区域和 QQ 原来的点击回调都还在同一个节点上，设备列表本身的顺序也保持原样。所以即使某个麦克风从第三行挪到了第一行，QQ 点击后仍会拿到它原来的设备 ID。把手单独接收拖动操作，松手时只保存顺序。

顺序用设备的显示名称保存。「系统默认」有一个单独的标记，Windows 默认设备变了，它也能留在原先的位置。菜单收起再打开、或者 QQ 重建菜单时，插件会重新读配置并应用顺序。后来接上的设备会按 QQ 原有顺序排在已保存的设备后面。

对应的代码在 [main.js](main.js) 和 [call-menu.js](call-menu.js)。

## 源码

| 文件 | 内容 |
| --- | --- |
| `main.js` | 找到 QQ 通话窗口，加载菜单排序脚本 |
| `call-menu.js` | 麦克风行排序、拖动和本地保存 |
| `manifest.json` | LiteLoaderQQNT 插件信息 |

三个文件可以直接装到 LiteLoaderQQNT 里，无需 npm 安装依赖或编译。源码采用 [MIT 许可](LICENSE)。

## English

A Windows [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) plugin for reordering microphones in QQ's call menu. Download `qq-call-mic-order.zip` from [Releases](https://github.com/RinTaigyoku/LiteLoaderQQNT-Mic-Order/releases/latest), install it in LiteLoaderQQNT, and restart QQ.

Drag the grip beside a microphone to reorder it. Click the name to select it. The order is saved locally, and the original QQ device selection remains in place. Tested with QQNT 9.9.31-49599 and LiteLoaderQQNT 1.4.1.
