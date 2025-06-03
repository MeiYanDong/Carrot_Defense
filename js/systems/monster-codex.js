// 怪物图鉴系统 - 核心逻辑
class MonsterCodex {
    constructor() {
        // 追踪遇到过的怪物类型
        this.encounteredMonsters = new Set();
        
        // 怪物类型定义（从monster.js复制的属性信息）
        this.monsterTypes = {
            'soldier': {
                name: '小兵',
                description: '移动速度快，血量中等的基础单位',
                maxHealth: 50,
                speed: 60,
                size: 12,
                color: '#FF6B6B',
                pathType: 'ground',
                pathName: '地面路径'
            },
            'tank': {
                name: '坦克',
                description: '血量厚，移动缓慢的重装单位',
                maxHealth: 120,
                speed: 30,
                size: 18,
                color: '#8B4513',
                pathType: 'ground',
                pathName: '地面路径'
            },
            'flyer': {
                name: '飞行单位',
                description: '血量低，走直线路径的空中单位',
                maxHealth: 30,
                speed: 80,
                size: 10,
                color: '#4ECDC4',
                pathType: 'air',
                pathName: '飞行路径'
            },
            'boss': {
                name: 'BOSS',
                description: '血量极高，具有攻击能力的终极敌人',
                maxHealth: 3000,
                speed: 45,
                size: 25,
                color: '#8B008B',
                pathType: 'ground',
                pathName: '地面路径',
                attackDamage: 80,
                attackRange: 60,
                attackCooldown: 3000
            }
        };
    }
    
    // 记录遇到怪物（当怪物首次生成时调用）
    encounterMonster(monsterType) {
        if (!this.encounteredMonsters.has(monsterType)) {
            this.encounteredMonsters.add(monsterType);
            console.log(`首次遇到怪物: ${this.monsterTypes[monsterType].name}`);
            return true; // 返回true表示这是首次遇到
        }
        return false; // 已经遇到过
    }
    
    // 检查是否遇到过某种怪物
    hasEncountered(monsterType) {
        return this.encounteredMonsters.has(monsterType);
    }
    
    // 获取怪物信息
    getMonsterInfo(monsterType) {
        return this.monsterTypes[monsterType] || null;
    }
    
    // 获取所有怪物类型列表
    getAllMonsterTypes() {
        return Object.keys(this.monsterTypes);
    }
    
    // 获取已遇到的怪物列表
    getEncounteredMonsters() {
        return Array.from(this.encounteredMonsters);
    }
    
    // 获取未遇到的怪物列表  
    getUnencounteredMonsters() {
        return this.getAllMonsterTypes().filter(type => !this.hasEncountered(type));
    }
    
    // 重置图鉴（用于测试）
    reset() {
        this.encounteredMonsters.clear();
        console.log('怪物图鉴已重置');
    }
    
    // 解锁所有怪物（用于测试）
    unlockAll() {
        this.getAllMonsterTypes().forEach(type => {
            this.encounteredMonsters.add(type);
        });
        console.log('已解锁所有怪物');
    }
}

// 创建全局怪物图鉴实例
const monsterCodex = new MonsterCodex(); 