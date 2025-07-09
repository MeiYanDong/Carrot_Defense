// 波次配置系统 - 可以轻松修改每波的怪物设置
class WaveConfig {
    constructor() {
        // 波次配置数据
        this.waves = [
            {
                // 第1波：新手波次
                waveNumber: 1,
                name: "新手入门",
                description: "简单的士兵怪物",
                spawnMode: "normal", // normal, fast, boss, burst
                spawnInterval: {
                    min: 1000,  // 最小间隔1秒
                    max: 2000   // 最大间隔2秒
                },
                monsters: [
                    { type: 'soldier', count: 6 }
                ],
                specialEffects: {
                    // 可以添加特殊效果
                }
            },
            {
                // 第2波：混合波次
                waveNumber: 2,
                name: "混合进攻",
                description: "士兵和坦克的组合",
                spawnMode: "normal",
                spawnInterval: {
                    min: 1000,
                    max: 2000
                },
                monsters: [
                    { type: 'soldier', count: 4 },
                    { type: 'tank', count: 3 }
                ]
            },
            {
                // 第3波：快速波次
                waveNumber: 3,
                name: "空袭警报",
                description: "快速生成的飞行怪物",
                spawnMode: "fast", // 快速模式
                spawnInterval: {
                    min: 500,   // 快速波次间隔更短
                    max: 1000
                },
                monsters: [
                    { type: 'soldier', count: 3 },
                    { type: 'flyer', count: 4 }
                ],
                specialEffects: {
                    fastSpawn: true,
                    description: "敌人快速涌入！"
                }
            },
            {
                // 第4波：集中爆发
                waveNumber: 4,
                name: "集中突击",
                description: "短时间内大量敌人",
                spawnMode: "burst", // 爆发模式
                spawnInterval: {
                    min: 800,
                    max: 1500
                },
                monsters: [
                    { type: 'tank', count: 3 },
                    { type: 'flyer', count: 3 },
                    { type: 'soldier', count: 2 }
                ],
                specialEffects: {
                    burstSpawn: true,
                    burstCount: 3, // 每次生成3个怪物
                    description: "敌人成群结队！"
                }
            },
            {
                waveNumber: 5,
                name: "小兵冲锋",
                description: "大量快速小兵",
                spawnMode: "burst",
                spawnInterval: {
                    min: 500,                     // 很快的间隔
                    max: 800
                },
                monsters: [
                    { type: 'soldier', count: 16 } // 只有小兵但数量很多
                ],
                specialEffects: {
                    burstSpawn: true,
                    burstCount: 4,                // 每次生成4个
                    strengthBonus: 1.5, // 怪物强度加成50%
                    description: "小兵大军来袭！"
                }
            },
            {
                // 第6波：Boss波次
                waveNumber: 6,
                name: "前夜序章",
                description: "强大的敌人混合军团",
                spawnMode: "burst", 
                spawnInterval: {
                    min: 1500,  
                    max: 2500
                },
                monsters: [
                    { type: 'soldier', count: 12 },
                    { type: 'tank', count: 8 },
                    { type: 'flyer', count: 6 }
                ],
                specialEffects: {
                    bossWave: true,
                    strengthBonus: 1.5, // 怪物强度加成50%
                    description: "前夜的序章，敌人开始集结"
                }
            },
            {
                // 第7波：BOSS挑战
                waveNumber: 7,
                name: "王者之怒",
                description: "终极BOSS降临，击败它赢得胜利！",
                spawnMode: "boss",
                spawnInterval: {
                    min: 500,  // BOSS波次间隔更长
                    max: 1000
                },
                monsters: [
                    { type: 'soldier', count: 12 },  // 大量护卫
                    { type: 'tank', count: 16 },     // 坦克支援
                    { type: 'flyer', count: 10 },
                    { type: 'boss', count: 1 }      // 关键：BOSS怪物
                ],
                specialEffects: {
                    bossWave: true,
                    strengthBonus: 1.5, // 所有怪物强度加成30%
                    finalWave: true,    // 标记为最终波次
                    description: "终极BOSS现身！击败它获得胜利！"
                }
            }
        ];
        
        // 生成模式的具体行为配置
        this.spawnModes = {
            normal: {
                name: "常规模式",
                description: "正常的单个生成",
                spawnCount: 1 // 每次生成1个
            },
            fast: {
                name: "快速模式", 
                description: "快速连续生成",
                spawnCount: 1,
                speedMultiplier: 1.5 // 生成速度加快
            },
            burst: {
                name: "爆发模式",
                description: "批量生成怪物",
                spawnCount: 2, // 每次生成2-3个
                maxBurstCount: 3
            },
            boss: {
                name: "Boss模式",
                description: "强化的Boss级敌人",
                spawnCount: 1,
                strengthMultiplier: 1.5, // 生命和伤害加成
                specialEffects: true
            }
        };
    }
    
    // 获取指定波次的配置
    getWaveConfig(waveNumber) {
        // waveNumber 从1开始
        if (waveNumber < 1 || waveNumber > this.waves.length) {
            return null;
        }
        return this.waves[waveNumber - 1];
    }
    
    // 获取总波次数
    getTotalWaves() {
        return this.waves.length;
    }
    
    // 获取生成模式配置
    getSpawnModeConfig(modeName) {
        return this.spawnModes[modeName] || this.spawnModes.normal;
    }
    
    // 生成随机间隔时间
    getRandomInterval(waveNumber) {
        const config = this.getWaveConfig(waveNumber);
        if (!config) return 1500; // 默认间隔
        
        const min = config.spawnInterval.min;
        const max = config.spawnInterval.max;
        
        return Math.random() * (max - min) + min;
    }
    
    // 检查是否有特殊效果
    hasSpecialEffect(waveNumber, effectName) {
        const config = this.getWaveConfig(waveNumber);
        return config && config.specialEffects && config.specialEffects[effectName];
    }
    
    // 获取波次的显示信息
    getWaveDisplayInfo(waveNumber) {
        const config = this.getWaveConfig(waveNumber);
        if (!config) return null;
        
        let totalMonsters = 0;
        const monsterTypes = {};
        
        for (let group of config.monsters) {
            totalMonsters += group.count;
            monsterTypes[group.type] = (monsterTypes[group.type] || 0) + group.count;
        }
        
        return {
            waveNumber: config.waveNumber,
            name: config.name,
            description: config.description,
            spawnMode: config.spawnMode,
            totalMonsters,
            monsterTypes,
            specialEffects: config.specialEffects || {}
        };
    }
    
    // 验证配置完整性
    validateConfig() {
        const errors = [];
        
        for (let i = 0; i < this.waves.length; i++) {
            const wave = this.waves[i];
            
            // 检查必需字段
            if (!wave.waveNumber || !wave.monsters || !wave.spawnMode) {
                errors.push(`第${i+1}波配置不完整`);
            }
            
            // 检查怪物配置
            if (wave.monsters) {
                for (let monster of wave.monsters) {
                    if (!monster.type || !monster.count || monster.count <= 0) {
                        errors.push(`第${i+1}波怪物配置有误`);
                    }
                }
            }
            
            // 检查间隔配置
            if (wave.spawnInterval && wave.spawnInterval.min >= wave.spawnInterval.max) {
                errors.push(`第${i+1}波时间间隔配置有误`);
            }
        }
        
        return errors;
    }
}

// 创建全局配置实例
const waveConfig = new WaveConfig();

// 验证配置
const configErrors = waveConfig.validateConfig();
if (configErrors.length > 0) {
    console.error('波次配置错误:', configErrors);
} else {
    console.log('波次配置加载成功！共', waveConfig.getTotalWaves(), '波');
} 