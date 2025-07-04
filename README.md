# 🥕 保卫萝卜 - 萌系塔防游戏

一个基于Web技术开发的萌系塔防游戏，采用Canvas绘制，支持多种炮台、怪物类型和波次配置。

## 🎮 游戏特色

### 核心玩法
- **多种炮台**：单体攻击、群体攻击、减速、金币生产
- **丰富怪物**：小兵、坦克、飞行单位、强力BOSS
- **动态路径**：支持地面和飞行路径系统
- **波次挑战**：可配置的波次系统，支持多种生成模式

### 游戏系统
- **完整音效系统**：背景音乐、音效、音量控制
- **怪物图鉴**：记录遇到的怪物信息
- **路径编辑器**：可视化路径设计工具
- **炮台管理**：建造、升级、出售炮台

## 📁 项目结构

```
保卫萝卜/
├── 📄 game.html              # 主游戏页面
├── 📄 monster-codex-test.html # 怪物图鉴测试页面
├── 📄 README.md              # 项目说明文档
│
├── 📁 js/                    # JavaScript代码目录
│   ├── 📁 core/              # 核心系统
│   │   └── engine.js         # 游戏引擎 - 主循环、渲染、状态管理
│   │
│   ├── 📁 systems/           # 游戏系统
│   │   ├── spawner.js        # 怪物生成器 - 对象池、波次管理
│   │   ├── monster.js        # 怪物系统 - 怪物类定义和渲染
│   │   ├── turrets.js        # 炮台系统 - 炮台、子弹、攻击逻辑
│   │   ├── path.js           # 路径系统 - 路径计算和管理
│   │   ├── path-templates.js # 路径模板 - 预设路径配置
│   │   ├── audio-manager.js  # 音频管理器 - 音效和音乐控制
│   │   └── monster-codex.js  # 怪物图鉴 - 怪物信息记录
│   │
│   ├── 📁 ui/                # 用户界面
│   │   ├── tower-ui.js       # 炮台UI - 建造、升级界面
│   │   ├── path-ui.js        # 路径UI - 路径编辑界面
│   │   └── monster-codex-ui.js # 怪物图鉴UI
│   │
│   ├── 📁 config/            # 配置文件
│   │   ├── waveConfig.js     # 波次配置 - 波次定义和生成模式
│   │   ├── path-examples.js  # 路径示例配置
│   │   └── 波次模板示例.js   # 波次模板示例
│   │
│   └── 📁 utils/             # 工具类
│       └── audio-generator.js # 音频生成器 - 程序化音效生成
│
├── 📁 assets/                # 资源文件
│   ├── 📁 audio/             # 音频资源
│   │   └── 📁 sounds/        # 音效文件
│   │       ├── 🎵 L.S.传送带.mp3     # 普通背景音乐
│   │       ├── 🎵 Brainiac.mp3       # BOSS背景音乐
│   │       ├── 🔊 turret_*.mp3       # 炮台音效
│   │       ├── 🔊 monster_*.mp3      # 怪物音效
│   │       ├── 🔊 boss_*.mp3         # BOSS音效
│   │       └── 🔊 ui_*.mp3           # UI音效
│   └── 📁 images/            # 图片资源 (预留)
│
└── 📁 docs/                  # 文档目录
    ├── 背景音乐说明.md       # 背景音乐使用说明
    ├── 波次配置说明.md       # 波次配置详细文档
    └── 需求文档RPD.md        # 项目需求文档
```

## 🚀 快速开始

### 环境要求
- 现代浏览器（支持Canvas、Web Audio API）
- 本地Web服务器（推荐使用Python HTTP Server或Live Server）

### 运行游戏
1. **启动本地服务器**：
   ```bash
   # 使用Python（推荐）
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve .
   ```

2. **打开游戏**：
   - 浏览器访问 `http://localhost:8000/game.html`
   - 点击"开始游戏"开始体验

3. **怪物图鉴**：
   - 访问 `http://localhost:8000/monster-codex-test.html`
   - 查看详细的怪物信息

## 🎯 游戏玩法

### 基础操作
1. **建造炮台**：点击"炮台管理"按钮选择炮台类型
2. **升级炮台**：选中炮台后点击升级按钮
3. **管理资源**：合理分配金币建造和升级
4. **应对波次**：不同波次有不同的怪物组合

### 炮台类型
- **🔴 单体炮台**：高伤害精准射击，适合对付血厚怪物
- **🟢 群体炮台**：范围毒气攻击，适合清理小兵
- **🔵 减速炮台**：冰冻减速效果，控制怪物移动
- **🟡 金币萝卜**：定期生产金币，提供经济支持

### 怪物类型
- **👤 小兵**：移动速度快，血量中等，基础威胁
- **🛡️ 坦克**：血量厚，移动缓慢，需要集火
- **🦋 飞行单位**：走直线路径，血量低但速度快
- **👑 BOSS**：血量极高，具有攻击能力，会摧毁炮台

### 生命系统
- **普通怪物**：到达终点扣除1条生命
- **BOSS怪物**：到达终点扣除4条生命（极度危险！）

## 🔧 开发说明

### 核心架构
- **模块化设计**：按功能划分的清晰目录结构
- **面向对象**：使用ES6 Class语法
- **事件驱动**：基于游戏循环和事件系统
- **数据驱动**：可配置的波次和路径系统

### 主要技术
- **Canvas 2D**：游戏渲染引擎
- **Web Audio API**：音效和音乐播放
- **ES6+**：现代JavaScript特性
- **CSS3**：界面样式和动画

### 扩展开发
1. **添加新怪物类型**：在`monster.js`中扩展`setAttributes`方法
2. **创建新炮台**：在`turrets.js`中添加新的炮台配置
3. **设计新波次**：在`waveConfig.js`中配置波次数据
4. **自定义路径**：使用路径编辑器或直接编辑路径模板

## 📋 功能清单

### ✅ 已完成功能
- [x] 基础游戏引擎和渲染系统
- [x] 多种炮台类型和攻击机制
- [x] 丰富的怪物类型和AI
- [x] 完整的音效和音乐系统
- [x] 波次配置和生成系统
- [x] 路径系统和编辑器
- [x] 怪物图鉴系统
- [x] BOSS特殊机制（攻击炮台、多倍生命伤害）
- [x] 音效自动生成备用方案
- [x] 强化怪物系统

### 🚧 待完善功能
- [ ] 更多特殊效果和动画
- [ ] 成就系统
- [ ] 存档和进度系统
- [ ] 更多路径模板
- [ ] 怪物动画优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎮 游戏截图

*// TODO: 添加游戏截图*

---

**�� 保卫萝卜，守护你的萌萌世界！** 