// 波次模板示例 - 可以直接复制到waveConfig.js中使用

// 🔥 超级困难波次模板
const superHardWaveTemplate = {
    waveNumber: 7,
    name: "地狱难度",
    description: "超级强化的混合军团",
    spawnMode: "boss",
    spawnInterval: {
        min: 600,
        max: 1000
    },
    monsters: [
        { type: 'soldier', count: 10 },
        { type: 'tank', count: 8 },
        { type: 'flyer', count: 6 }
    ],
    specialEffects: {
        strengthBonus: 2.5,
        description: "超级Boss降临！"
    }
};

// ⚡ 快速冲锋波次模板
const fastRushWaveTemplate = {
    waveNumber: 8,
    name: "闪电战",
    description: "极速怪物冲击",
    spawnMode: "fast",
    spawnInterval: {
        min: 300,
        max: 500
    },
    monsters: [
        { type: 'soldier', count: 15 },
        { type: 'flyer', count: 8 }
    ],
    specialEffects: {
        fastSpawn: true,
        strengthBonus: 1.3,
        description: "敌人闪电突击！"
    }
};

// 💥 超级爆发波次模板
const megaBurstWaveTemplate = {
    waveNumber: 9,
    name: "万军来袭",
    description: "史上最大规模进攻",
    spawnMode: "burst",
    spawnInterval: {
        min: 800,
        max: 1200
    },
    monsters: [
        { type: 'soldier', count: 20 },
        { type: 'tank', count: 10 },
        { type: 'flyer', count: 12 }
    ],
    specialEffects: {
        burstSpawn: true,
        burstCount: 6,
        strengthBonus: 1.8,
        description: "敌军总攻开始！"
    }
};

// 🛡️ 坦克专场波次模板
const tankOnlyWaveTemplate = {
    waveNumber: 10,
    name: "钢铁洪流",
    description: "全部都是重装坦克",
    spawnMode: "normal",
    spawnInterval: {
        min: 1500,
        max: 2000
    },
    monsters: [
        { type: 'tank', count: 15 }
    ],
    specialEffects: {
        strengthBonus: 2.0,
        description: "钢铁军团来袭！"
    }
};

// 🦅 飞行专场波次模板
const flyerOnlyWaveTemplate = {
    waveNumber: 11,
    name: "天空霸主",
    description: "密集的空中打击",
    spawnMode: "fast",
    spawnInterval: {
        min: 400,
        max: 700
    },
    monsters: [
        { type: 'flyer', count: 25 }
    ],
    specialEffects: {
        fastSpawn: true,
        strengthBonus: 1.6,
        description: "空中军团来袭！"
    }
};

// 🎯 精英小队波次模板
const eliteWaveTemplate = {
    waveNumber: 12,
    name: "精英突击队",
    description: "少而精的强化军团",
    spawnMode: "boss",
    spawnInterval: {
        min: 2000,
        max: 3000
    },
    monsters: [
        { type: 'soldier', count: 3 },
        { type: 'tank', count: 3 },
        { type: 'flyer', count: 3 }
    ],
    specialEffects: {
        strengthBonus: 3.0, // 三倍强化！
        description: "精英部队出击！"
    }
};

// 🌊 海量小兵波次模板
const swarmWaveTemplate = {
    waveNumber: 13,
    name: "虫海战术",
    description: "数量压倒一切",
    spawnMode: "burst",
    spawnInterval: {
        min: 200,
        max: 400
    },
    monsters: [
        { type: 'soldier', count: 50 } // 海量小兵
    ],
    specialEffects: {
        burstSpawn: true,
        burstCount: 8, // 每次生成8个
        description: "虫海来袭！"
    }
};

// 🎲 随机混乱波次模板
const chaosWaveTemplate = {
    waveNumber: 14,
    name: "混沌之战",
    description: "完全不可预测的攻击",
    spawnMode: "burst",
    spawnInterval: {
        min: 300,
        max: 2000 // 超大间隔范围
    },
    monsters: [
        { type: 'soldier', count: 8 },
        { type: 'tank', count: 8 },
        { type: 'flyer', count: 8 }
    ],
    specialEffects: {
        burstSpawn: true,
        burstCount: 3, // 随机性强
        strengthBonus: 1.7,
        description: "混沌军团来袭！"
    }
};

// 👑 终极Boss波次模板
const finalBossWaveTemplate = {
    waveNumber: 15,
    name: "终极决战",
    description: "最后的Boss级挑战",
    spawnMode: "boss",
    spawnInterval: {
        min: 1000,
        max: 1500
    },
    monsters: [
        { type: 'soldier', count: 12 },
        { type: 'tank', count: 12 },
        { type: 'flyer', count: 12 }
    ],
    specialEffects: {
        bossWave: true,
        strengthBonus: 4.0, // 四倍强化！
        description: "终极Boss降临！准备决战！"
    }
};

// 📋 使用方法：
// 1. 复制你喜欢的模板到 waveConfig.js 的 waves 数组中
// 2. 修改 waveNumber 为合适的波次编号
// 3. 根据需要调整参数
// 4. 保存并刷新游戏

// 💡 设计建议：
// - 早期波次(1-3)：使用 normal 模式，适中的怪物数量
// - 中期波次(4-8)：混合使用 fast 和 burst 模式
// - 后期波次(9+)：使用 boss 模式，高强度挑战
// - 最终波次：超高强度，作为最终挑战

// 🎮 平衡性提示：
// - strengthBonus 建议范围：1.0 - 4.0
// - 怪物总数建议：早期 5-10，中期 10-20，后期 20+
// - 间隔时间：快节奏 300-800ms，正常 800-2000ms，慢节奏 2000+ms 