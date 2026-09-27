# 西游杀桌面版

<p align="center">
  <img src="images/icon.png" width="160" alt="西游杀应用图标" />
</p>

<p align="center">
  一个正在开发中的《西游杀》单人桌面版。
</p>

<p align="center">
  基于 Tauri、React 与 TypeScript 构建。
</p>

## 开发预告

这是一个面向单人游玩的桌面卡牌游戏项目。目前正在完善规则、交互、角色技能与本地 AI；源码、安装包和可运行版本暂未公开。

项目采用棕金色的东方奇幻视觉风格，支持六人身份局：1 名真人玩家与 5 名本地规则 AI 同局游戏。

![对局中的六人牌桌](images/gameplay.png)

## 目前已完成

- 六席身份局、选人流程与本地 AI 回合推进
- 人物技能、攻防、武器与坐骑、判定、濒死救援和胜负结算
- 唐僧双层体力、白骨精变身等角色机制
- 对局记录、三槽存读档、设置持久化与东方风背景音乐
- 对局结果展示，以及开发中的 MP4 回放导出能力

![对局结算界面](images/result.png)

## 项目状态

项目仍在开发中，部分边界规则和游玩细节还会继续调整。当前仓库作为项目预告页使用，后续会在适合公开时补充源码、发布说明与安装方式。

## 参考与鸣谢

本项目参考了 [w159014462z/UnityDemo](https://github.com/w159014462z/UnityDemo) 的既有工程与玩法资料，并以 Tauri、React 和 TypeScript 重新实现桌面端逻辑与界面。

截图中出现的原有卡面、背景、字体及其他第三方资源，权利归各自权利人所有；本仓库当前不对这些资源作再授权。音乐、素材和许可信息将在正式公开内容前统一整理。

## 技术栈

- [Tauri 2](https://tauri.app/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Rust](https://www.rust-lang.org/)

---

> 本项目为个人开发中的非商业作品，尚未发布可下载版本。
