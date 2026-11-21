<h1 align="center">QQ 通话麦克风排序</h1>

<p align="center">在 QQ 通话菜单里拖动麦克风。排好一次，下次接着用。</p>

<p align="center">
  <a href="https://github.com/RinTaigyoku/LiteLoaderQQNT-Mic-Order/releases/latest"><img alt="Download" src="https://img.shields.io/github/v/release/RinTaigyoku/LiteLoaderQQNT-Mic-Order?label=Download&color=c7dc8d&labelColor=18221c"></a>
  <a href="https://github.com/LiteLoaderQQNT/LiteLoaderQQNT"><img alt="LiteLoaderQQNT" src="https://img.shields.io/badge/插件-LiteLoaderQQNT-c7dc8d?labelColor=18221c"></a>
  <a href="LICENSE"><img alt="MIT" src="https://img.shields.io/badge/License-MIT-c7dc8d?labelColor=18221c"></a>
</p>

<p align="center"><a href="#下载">下载</a> · <a href="#怎么用">使用方法</a> · <a href="#几个常见问题">常见问题</a> · <a href="#english">English</a></p>

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
