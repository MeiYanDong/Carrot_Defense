// 怪物生成器 - 对象池和波次管理
class MonsterSpawner {
    constructor() {
        // 对象池
        this.monsterPool = [];
        this.activeMonsters = [];
        this.poolSize = 50; // 对象池大小
        
        // 生成状态
        this.currentWave = 0;
        this.currentWaveConfig = null; // 当前波次的配置
        this.spawningQueue = [];
        this.spawnTimer = 0;
        this.currentSpawnInterval = 1500; // 当前的随机间隔
        this.waveDelay = 10000; // 波次间隔10秒
        this.isSpawning = false;
        this.waveCompleted = false;
        this.allWavesCompleted = false;
        
        // 特殊模式状态
        this.burstSpawnCount = 0; // 爆发模式下一次生成的数量
        this.specialEffectMessage = ""; // 特殊效果提示信息
        this.showSpecialMessage = false;
        this.specialMessageTimer = 0;
        
        this.initializePool();
    }
    
    // 初始化对象池
    initializePool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.monsterPool.push(new Monster('soldier', i));
        }
        console.log(`对象池初始化完成，创建了 ${this.poolSize} 个怪物对象`);
    }
    
    // 从对象池获取怪物
    getMonsterFromPool() {
        for (let monster of this.monsterPool) {
            if (!monster.isActive) {
                return monster;
            }
        }
        
        // 如果池中没有可用对象，创建新的
        const newMonster = new Monster('soldier', this.monsterPool.length);
        this.monsterPool.push(newMonster);
        return newMonster;
    }
    
    // 归还怪物到对象池
    returnMonsterToPool(monster) {
        monster.deactivate();
        
        // 从活动列表中移除
        const index = this.activeMonsters.indexOf(monster);
        if (index > -1) {
            this.activeMonsters.splice(index, 1);
        }
    }
    
    // 开始生成波次
    startWave(waveNumber) {
        // 使用新的配置系统
        this.currentWaveConfig = waveConfig.getWaveConfig(waveNumber + 1); // +1 因为waveConfig使用1-based
        
        if (!this.currentWaveConfig) {
            this.allWavesCompleted = true;
            return;
        }
        
        this.currentWave = waveNumber;
        this.waveCompleted = false;
        this.spawningQueue = this.createSpawningQueue();
        this.isSpawning = true;
        this.spawnTimer = 0;
        
        // 设置初始随机间隔
        this.generateNextSpawnInterval();
        
        // 播放波次开始音效
        if (window.audioManager) {
            audioManager.playUISound('wave_start');
            
            // 🎵 根据波次类型切换背景音乐
            const isBossWave = this.isBossWave();
            if (isBossWave) {
                console.log(`🎵 检测到BOSS波次，切换到BOSS背景音乐`);
                audioManager.playBossBackgroundMusic();
            } else {
                console.log(`🎵 普通波次，切换到普通背景音乐`);
                audioManager.playBackgroundMusic();
            }
        }
        
        // 显示特殊效果信息
        if (this.currentWaveConfig.specialEffects && this.currentWaveConfig.specialEffects.description) {
            this.showSpecialEffectMessage(this.currentWaveConfig.specialEffects.description);
        }
        
        console.log(`开始第 ${waveNumber + 1} 波：${this.currentWaveConfig.name}，共 ${this.spawningQueue.length} 个怪物`);
        console.log(`生成模式：${this.currentWaveConfig.spawnMode}`);
    }
    
    // 判断当前波次是否为BOSS波次
    isBossWave() {
        if (!this.currentWaveConfig) return false;
        
        // 方法1：检查生成模式是否为boss
        if (this.currentWaveConfig.spawnMode === 'boss') {
            return true;
        }
        
        // 方法2：检查特殊效果中是否标记为boss波次
        if (this.currentWaveConfig.specialEffects && this.currentWaveConfig.specialEffects.bossWave) {
            return true;
        }
        
        // 方法3：检查是否包含boss类型怪物
        for (let monsterGroup of this.currentWaveConfig.monsters) {
            if (monsterGroup.type === 'boss') {
                return true;
            }
        }
        
        return false;
    }
    
    // 创建生成队列（使用新配置系统）
    createSpawningQueue() {
        const queue = [];
        
        // 将所有怪物类型展开成单个怪物
        for (let monsterGroup of this.currentWaveConfig.monsters) {
            for (let i = 0; i < monsterGroup.count; i++) {
                queue.push({
                    type: monsterGroup.type,
                    strengthMultiplier: this.getStrengthMultiplier()
                });
            }
        }
        
        // 根据生成模式决定是否打乱顺序
        if (this.currentWaveConfig.spawnMode !== 'burst') {
            this.shuffleArray(queue);
        }
        
        return queue;
    }
    
    // 获取强度加成倍数
    getStrengthMultiplier() {
        let multiplier = 1.0;
        
        // Boss波次有强度加成
        if (this.currentWaveConfig.specialEffects && this.currentWaveConfig.specialEffects.strengthBonus) {
            multiplier *= this.currentWaveConfig.specialEffects.strengthBonus;
        }
        
        // 获取生成模式的加成
        const modeConfig = waveConfig.getSpawnModeConfig(this.currentWaveConfig.spawnMode);
        if (modeConfig.strengthMultiplier) {
            multiplier *= modeConfig.strengthMultiplier;
        }
        
        return multiplier;
    }
    
    // 生成下一个随机间隔
    generateNextSpawnInterval() {
        this.currentSpawnInterval = waveConfig.getRandomInterval(this.currentWave + 1);
        
        // 快速模式的间隔调整
        const modeConfig = waveConfig.getSpawnModeConfig(this.currentWaveConfig.spawnMode);
        if (modeConfig.speedMultiplier) {
            this.currentSpawnInterval /= modeConfig.speedMultiplier;
        }
    }
    
    // 显示特殊效果信息
    showSpecialEffectMessage(message) {
        this.specialEffectMessage = message;
        this.showSpecialMessage = true;
        this.specialMessageTimer = 3000; // 显示3秒
    }
    
    // 数组随机排序
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 更新生成器
    update(deltaTime) {
        // 更新特殊信息显示
        this.updateSpecialMessage(deltaTime);
        
        // 更新怪物生成逻辑
        this.updateSpawning(deltaTime);
        
        // 更新所有活动怪物（无论是否还在生成）
        this.updateActiveMonsters(deltaTime);
    }
    
    // 更新特殊信息显示
    updateSpecialMessage(deltaTime) {
        if (this.showSpecialMessage) {
            this.specialMessageTimer -= deltaTime;
            if (this.specialMessageTimer <= 0) {
                this.showSpecialMessage = false;
            }
        }
    }
    
    // 更新生成逻辑
    updateSpawning(deltaTime) {
        if (!this.isSpawning) return;
        
        this.spawnTimer += deltaTime;
        
        // 检查是否可以生成下一个怪物
        if (this.spawnTimer >= this.currentSpawnInterval && this.spawningQueue.length > 0) {
            this.spawnNextMonster();
            this.spawnTimer = 0;
            
            // 生成下一个随机间隔
            this.generateNextSpawnInterval();
        }
        
        // 检查当前波次生成是否完成
        if (this.spawningQueue.length === 0 && !this.waveCompleted) {
            this.isSpawning = false;
            this.waveCompleted = true;
            console.log(`第 ${this.currentWave + 1} 波生成完毕，但怪物继续移动`);
        }
    }
    
    // 生成下一个怪物（支持特殊模式）
    spawnNextMonster() {
        if (this.spawningQueue.length === 0) return;
        
        // 根据生成模式确定本次生成数量
        let spawnCount = 1;
        const modeConfig = waveConfig.getSpawnModeConfig(this.currentWaveConfig.spawnMode);
        
        if (this.currentWaveConfig.spawnMode === 'burst') {
            // 爆发模式：随机生成2-3个
            spawnCount = Math.floor(Math.random() * 2) + 2; // 2-3个
            if (this.currentWaveConfig.specialEffects && this.currentWaveConfig.specialEffects.burstCount) {
                spawnCount = this.currentWaveConfig.specialEffects.burstCount;
            }
        } else if (modeConfig.spawnCount) {
            spawnCount = modeConfig.spawnCount;
        }
        
        // 生成指定数量的怪物
        spawnCount = Math.min(spawnCount, this.spawningQueue.length); // 不超过剩余数量
        
        for (let i = 0; i < spawnCount; i++) {
            if (this.spawningQueue.length === 0) break;
            
            const monsterData = this.spawningQueue.shift();
            const monster = this.getMonsterFromPool();
            
            // 激活怪物并应用强度加成
            monster.activate(monsterData.type, monsterData.strengthMultiplier);
            
            // 记录到怪物图鉴
            monsterCodex.encounterMonster(monsterData.type);
            
            this.activeMonsters.push(monster);
            
            console.log(`生成怪物: ${monsterData.type}${monsterData.strengthMultiplier > 1 ? ` (强化${Math.round(monsterData.strengthMultiplier * 100)}%)` : ''}, 剩余: ${this.spawningQueue.length}`);
        }
        
        if (spawnCount > 1) {
            console.log(`${this.currentWaveConfig.spawnMode}模式：一次生成了${spawnCount}个怪物！`);
        }
    }
    
    // 更新所有活动怪物
    updateActiveMonsters(deltaTime) {
        const monstersToRemove = [];
        
        for (let monster of this.activeMonsters) {
            monster.update(deltaTime);
            
            // 检查怪物是否需要移除
            if (monster.isDead || monster.isAtEnd) {
                monstersToRemove.push(monster);
            }
        }
        
        // 移除死亡或到达终点的怪物
        for (let monster of monstersToRemove) {
            if (monster.isAtEnd && !monster.isDead) {
                // 怪物到达终点，玩家失去生命
                this.onMonsterReachEnd(monster);
            } else if (monster.isDead) {
                // 怪物死亡，给予金币奖励
                this.onMonsterKilled(monster);
            }
            
            this.returnMonsterToPool(monster);
        }
        
        // 调试信息：每隔一段时间输出怪物状态
        if (this.activeMonsters.length > 0 && Math.random() < 0.01) {
            console.log(`当前活动怪物数量: ${this.activeMonsters.length}, 生成状态: ${this.isSpawning}`);
        }
    }
    
    // 怪物到达终点处理
    onMonsterReachEnd(monster) {
        if (window.gameEngine) {
            const lifeDamage = monster.getLifeDamage();
            
            console.log(`💀 ${monster.name}突破防线！造成${lifeDamage}点生命伤害！`);
            
            // 连续扣除生命
            for (let i = 0; i < lifeDamage; i++) {
                if (window.gameEngine.gameState.lives > 0) {
                    window.gameEngine.loseLife();
                }
            }
            
            // 播放相应的音效
            if (window.audioManager) {
                if (monster.type === 'boss') {
                    audioManager.playBossAttack(); // BOSS突破音效
                } else {
                    // 普通怪物突破音效（可以后续添加）
                }
            }
            
            console.log(`⚠️ ${monster.name}突破防线！扣除${lifeDamage}条生命！剩余生命: ${window.gameEngine.gameState.lives}`);
        }
    }
    
    // 怪物死亡处理
    onMonsterKilled(monster) {
        if (window.gameEngine) {
            window.gameEngine.addCoins(10); // 固定给10金币
            console.log(`击杀怪物 ${monster.name}，获得10金币`);
        }
    }
    
    // 渲染所有活动怪物
    render(ctx) {
        for (let monster of this.activeMonsters) {
            monster.render(ctx);
        }
        
        // 渲染特殊效果信息
        this.renderSpecialEffects(ctx);
    }
    
    // 渲染特殊效果信息
    renderSpecialEffects(ctx) {
        if (!this.showSpecialMessage) return;
        
        // 计算透明度（淡入淡出效果）
        let alpha = 1.0;
        if (this.specialMessageTimer < 500) {
            alpha = this.specialMessageTimer / 500; // 淡出
        } else if (this.specialMessageTimer > 2500) {
            alpha = (3000 - this.specialMessageTimer) / 500; // 淡入
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制背景
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(250, 100, 300, 60);
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 3;
        ctx.strokeRect(250, 100, 300, 60);
        
        // 绘制文字
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.specialEffectMessage, 400, 125);
        
        // 绘制波次模式
        if (this.currentWaveConfig) {
            const modeConfig = waveConfig.getSpawnModeConfig(this.currentWaveConfig.spawnMode);
            ctx.font = '12px Arial';
            ctx.fillText(`模式: ${modeConfig.name}`, 400, 145);
        }
        
        ctx.restore();
    }
    
    // 检查当前波次是否完成（所有怪物生成且清理完毕）
    isCurrentWaveComplete() {
        return this.waveCompleted && this.activeMonsters.length === 0;
    }
    
    // 获取当前活动怪物数量
    getActiveMonsterCount() {
        return this.activeMonsters.length;
    }
    
    // 获取指定位置的怪物（用于点击检测）
    getMonsterAt(x, y) {
        for (let monster of this.activeMonsters) {
            if (monster.isPointInside(x, y)) {
                return monster;
            }
        }
        return null;
    }
    
    // 强制清理所有怪物（用于重置游戏）
    clearAllMonsters() {
        for (let monster of this.activeMonsters) {
            this.returnMonsterToPool(monster);
        }
        this.spawningQueue = [];
        this.isSpawning = false;
        this.waveCompleted = true;
    }
    
    // 获取波次信息（使用新配置系统）
    getWaveInfo(waveNumber) {
        // 直接使用waveConfig系统
        return waveConfig.getWaveDisplayInfo(waveNumber + 1); // +1 因为waveConfig使用1-based
    }
    
    // 获取当前波次的详细信息
    getCurrentWaveInfo() {
        if (!this.currentWaveConfig) return null;
        
        return {
            name: this.currentWaveConfig.name,
            description: this.currentWaveConfig.description,
            spawnMode: this.currentWaveConfig.spawnMode,
            specialEffects: this.currentWaveConfig.specialEffects || {},
            remainingMonsters: this.spawningQueue.length,
            activeMonsters: this.activeMonsters.length,
            currentInterval: Math.round(this.currentSpawnInterval)
        };
    }
    
    // 获取下一个随机间隔的预览（用于调试）
    getIntervalRange() {
        if (!this.currentWaveConfig) return null;
        
        return {
            min: this.currentWaveConfig.spawnInterval.min,
            max: this.currentWaveConfig.spawnInterval.max,
            current: Math.round(this.currentSpawnInterval)
        };
    }
}

// 创建全局怪物生成器实例
const monsterSpawner = new MonsterSpawner(); 