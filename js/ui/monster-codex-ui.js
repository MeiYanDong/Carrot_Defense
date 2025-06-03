// 怪物图鉴UI界面
class MonsterCodexUI {
    constructor() {
        this.isOpen = false;
        this.overlay = null;
        this.panel = null;
        
        this.createUI();
    }
    
    // 创建UI元素
    createUI() {
        // 不再需要覆盖层，直接创建侧边面板
        this.panel = document.createElement('div');
        this.panel.id = 'codexPanel';
        this.panel.className = 'monster-codex-panel';
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .monster-codex-panel {
                position: fixed;
                left: -420px;
                top: 50%;
                transform: translateY(-50%);
                width: 400px;
                height: 580px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: left 0.3s ease;
                z-index: 1000;
                overflow: hidden;
                border: 2px solid #96E6B3;
            }
            
            .monster-codex-panel.open {
                left: 20px;
            }
            
            .codex-panel-header {
                background: #96E6B3;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .codex-panel-header h2 {
                margin: 0;
                font-size: 18px;
            }
            
            .codex-close-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: none;
                border-radius: 6px;
                width: 28px;
                height: 28px;
                cursor: pointer;
                font-weight: bold;
                font-size: 16px;
                transition: background 0.2s;
            }
            
            .codex-close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .codex-panel-content {
                display: flex;
                height: calc(100% - 65px);
            }
            
            .codex-monster-list {
                width: 140px;
                background: #f5f5f5;
                padding: 15px 10px;
                border-right: 2px solid #e0e0e0;
                overflow-y: auto;
            }
            
            .codex-monster-list h3 {
                margin: 0 0 15px 0;
                color: #333;
                text-align: center;
                font-size: 14px;
            }
            
            .codex-monster-btn {
                width: 100%;
                padding: 10px 8px;
                margin-bottom: 8px;
                border: 2px solid #ccc;
                border-radius: 8px;
                background: #f0f0f0;
                color: #999;
                cursor: not-allowed;
                text-align: left;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .codex-monster-btn.unlocked {
                border-color: #96E6B3;
                background: white;
                color: #333;
                cursor: pointer;
            }
            
            .codex-monster-btn.unlocked:hover {
                background: #f9f9f9;
                border-color: #7dd3a0;
            }
            
            .codex-monster-detail {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
            }
            
            .codex-placeholder {
                text-align: center;
                color: #666;
                margin-top: 80px;
                font-size: 14px;
            }
            
            .codex-monster-title {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .codex-monster-title h3 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 20px;
            }
            
            .codex-monster-title p {
                margin: 0;
                color: #666;
                font-style: italic;
                font-size: 13px;
            }
            
            .codex-monster-preview {
                text-align: center;
                margin: 20px 0;
            }
            
            .codex-preview-canvas {
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                background: #FFF9EC;
            }
            
            .codex-monster-stats {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 12px;
                margin: 15px 0;
            }
            
            .codex-monster-stats h4 {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 14px;
            }
            
            .codex-stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                font-size: 12px;
            }
            
            .codex-stats-item {
                color: #333;
            }
            
            .codex-monster-tactics {
                background: #e8f5e8;
                padding: 15px;
                border-radius: 12px;
                border-left: 4px solid #96E6B3;
            }
            
            .codex-monster-tactics h4 {
                margin: 0 0 8px 0;
                color: #2E7D32;
                font-size: 14px;
            }
            
            .codex-monster-tactics p {
                margin: 0;
                color: #333;
                line-height: 1.4;
                font-size: 12px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.panel);
        
        // 创建面板内容
        this.createPanelContent();
    }
    
    // 创建面板内容
    createPanelContent() {
        this.panel.innerHTML = `
            <div class="codex-panel-header">
                <h2>怪物图鉴</h2>
                <button id="codexCloseBtn" class="codex-close-btn">×</button>
            </div>
            <div class="codex-panel-content">
                <!-- 左侧怪物列表 -->
                <div class="codex-monster-list">
                    <h3>怪物列表</h3>
                    <div id="monsterList"></div>
                </div>
                
                <!-- 右侧详细信息 -->
                <div class="codex-monster-detail">
                    <div id="monsterDetail">
                        <div class="codex-placeholder">
                            选择左侧的怪物<br>查看详细信息
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定关闭按钮事件
        document.getElementById('codexCloseBtn').addEventListener('click', () => this.close());
    }
    
    // 打开图鉴
    open() {
        this.isOpen = true;
        this.panel.classList.add('open');
        this.refreshMonsterList();
    }
    
    // 关闭图鉴
    close() {
        this.isOpen = false;
        this.panel.classList.remove('open');
    }
    
    // 切换显示状态
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // 刷新怪物列表
    refreshMonsterList() {
        const listContainer = document.getElementById('monsterList');
        listContainer.innerHTML = '';
        
        const allTypes = monsterCodex.getAllMonsterTypes();
        
        allTypes.forEach(type => {
            const info = monsterCodex.getMonsterInfo(type);
            const isEncountered = monsterCodex.hasEncountered(type);
            
            const button = document.createElement('button');
            button.className = `codex-monster-btn ${isEncountered ? 'unlocked' : ''}`;
            
            if (isEncountered) {
                button.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 2px;">${info.name}</div>
                    <div style="font-size: 10px; color: #666;">已解锁</div>
                `;
                button.addEventListener('click', () => this.showMonsterDetail(type));
            } else {
                button.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 2px;">???</div>
                    <div style="font-size: 10px; color: #999;">未解锁</div>
                `;
            }
            
            listContainer.appendChild(button);
        });
    }
    
    // 显示怪物详细信息
    showMonsterDetail(type) {
        const info = monsterCodex.getMonsterInfo(type);
        if (!info) return;
        
        const detailContainer = document.getElementById('monsterDetail');
        
        detailContainer.innerHTML = `
            <div class="codex-monster-title">
                <h3>${info.name}</h3>
                <p>${info.description}</p>
            </div>
            
            <!-- 怪物图像展示区域 -->
            <div class="codex-monster-preview">
                <canvas id="monsterPreview" width="100" height="100" class="codex-preview-canvas"></canvas>
            </div>
            
            <!-- 属性信息 -->
            <div class="codex-monster-stats">
                <h4>基础属性</h4>
                <div class="codex-stats-grid">
                    <div class="codex-stats-item">
                        <strong>生命值:</strong> ${info.maxHealth}
                    </div>
                    <div class="codex-stats-item">
                        <strong>移动速度:</strong> ${info.speed} px/s
                    </div>
                    <div class="codex-stats-item">
                        <strong>体型大小:</strong> ${info.size}
                    </div>
                    <div class="codex-stats-item">
                        <strong>移动路径:</strong> ${info.pathName}
                    </div>
                    ${type === 'boss' ? `
                    <div class="codex-stats-item">
                        <strong>攻击伤害:</strong> ${info.attackDamage}
                    </div>
                    <div class="codex-stats-item">
                        <strong>攻击范围:</strong> ${info.attackRange}px
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- 特性说明 -->
            <div class="codex-monster-tactics">
                <h4>战术特点</h4>
                <p>${this.getMonsterTactics(type)}</p>
            </div>
        `;
        
        // 绘制怪物预览图
        this.drawMonsterPreview(type);
    }
    
    // 绘制怪物预览图
    drawMonsterPreview(type) {
        const canvas = document.getElementById('monsterPreview');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const info = monsterCodex.getMonsterInfo(type);
        
        // 清空画布
        ctx.fillStyle = '#FFF9EC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 创建临时怪物对象用于绘制
        const tempMonster = {
            type: type,
            position: { x: 50, y: 50 }, // 画布中心
            size: info.size * 1.8, // 适当放大显示
            color: info.color,
            currentHealth: info.maxHealth,
            maxHealth: info.maxHealth,
            animationTime: 0,
            walkCycle: 0,
            direction: 0,
            isEnhanced: false
        };
        
        // 使用monster.js中的绘制方法
        if (type === 'soldier') {
            this.renderSoldierPreview(ctx, tempMonster);
        } else if (type === 'tank') {
            this.renderTankPreview(ctx, tempMonster);
        } else if (type === 'flyer') {
            this.renderFlyerPreview(ctx, tempMonster);
        } else if (type === 'boss') {
            this.renderBossPreview(ctx, tempMonster);
        }
    }
    
    // 绘制小兵预览（简化版）
    renderSoldierPreview(ctx, monster) {
        const x = monster.position.x;
        const y = monster.position.y;
        const size = monster.size;
        
        // 身体
        ctx.fillStyle = monster.color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        // 头部
        ctx.fillStyle = '#FFE5B4';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.3, size * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.4, size * 0.1, 0, 2 * Math.PI);
        ctx.arc(x + size * 0.2, y - size * 0.4, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 绘制坦克预览（简化版）
    renderTankPreview(ctx, monster) {
        const x = monster.position.x;
        const y = monster.position.y;
        const size = monster.size;
        
        // 履带底座
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - size, y + size * 0.3, size * 2, size * 0.6);
        
        // 主体装甲
        ctx.fillStyle = monster.color;
        ctx.fillRect(x - size * 0.8, y - size * 0.5, size * 1.6, size * 1.2);
        
        // 炮塔
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, 2 * Math.PI);
        ctx.fill();
        
        // 炮管
        ctx.fillStyle = '#333';
        ctx.fillRect(x + size * 0.3, y - size * 0.1, size * 0.8, size * 0.2);
        
        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size * 0.8, y - size * 0.5, size * 1.6, size * 1.2);
        ctx.beginPath();
        ctx.arc(x, y, size * 0.6, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 绘制飞行单位预览（简化版）  
    renderFlyerPreview(ctx, monster) {
        const x = monster.position.x;
        const y = monster.position.y;
        const size = monster.size;
        
        // 机身
        ctx.fillStyle = monster.color;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 机翼
        ctx.fillStyle = '#2E8B8B';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.3, y, size * 1.2, size * 0.3, -Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + size * 0.3, y, size * 1.2, size * 0.3, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // 螺旋桨效果
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x - size * 1.2, y);
        ctx.lineTo(x + size * 1.2, y);
        ctx.stroke();
        
        // 边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 绘制BOSS预览（简化版）
    renderBossPreview(ctx, monster) {
        const x = monster.position.x;
        const y = monster.position.y;
        const size = monster.size * 0.8; // 适应画布大小
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + 2, y + size * 0.6, size * 0.7, size * 0.2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // BOSS主体
        ctx.fillStyle = monster.color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, 2 * Math.PI);
        ctx.fill();
        
        // 装甲纹理
        ctx.fillStyle = '#660066';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.55, 0, 2 * Math.PI);
        ctx.fill();
        
        // 胸甲
        ctx.fillStyle = '#4B0082';
        ctx.fillRect(x - size * 0.4, y - size * 0.25, size * 0.8, size * 0.5);
        
        // 简化的王冠
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - size * 0.5, y - size * 0.8, size, size * 0.2);
        // 王冠尖刺
        ctx.beginPath();
        ctx.moveTo(x - size * 0.3, y - size * 0.8);
        ctx.lineTo(x - size * 0.1, y - size * 1.1);
        ctx.lineTo(x + size * 0.1, y - size * 0.8);
        ctx.moveTo(x + size * 0.1, y - size * 0.8);
        ctx.lineTo(x + size * 0.3, y - size * 1.1);
        ctx.lineTo(x + size * 0.5, y - size * 0.8);
        ctx.fill();
        
        // 王冠宝石
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.9, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        
        // 威武的眼睛
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.15, size * 0.1, 0, 2 * Math.PI);
        ctx.arc(x + size * 0.2, y - size * 0.15, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        
        // 眼睛发光
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.15, size * 0.05, 0, 2 * Math.PI);
        ctx.arc(x + size * 0.2, y - size * 0.15, size * 0.05, 0, 2 * Math.PI);
        ctx.fill();
        
        // 威武的嘴巴
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + size * 0.1, size * 0.25, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // 简化的利爪
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        // 左爪
        ctx.beginPath();
        ctx.moveTo(x - size * 0.8, y);
        ctx.lineTo(x - size * 0.6, y - size * 0.2);
        ctx.stroke();
        // 右爪
        ctx.beginPath();
        ctx.moveTo(x + size * 0.8, y);
        ctx.lineTo(x + size * 0.6, y - size * 0.2);
        ctx.stroke();
        
        // 主体轮廓
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 获取怪物战术特点说明
    getMonsterTactics(type) {
        const tactics = {
            'soldier': '小兵是最基础的敌人，数量较多但单体实力有限。建议使用群体攻击炮台来应对大量小兵的冲击。它们移动速度适中，给玩家充足的反应时间。',
            'tank': '坦克拥有厚重的装甲和大量生命值，但移动缓慢。建议集中火力攻击，或使用减速型炮台进一步降低其移动速度，争取更多攻击时间。',
            'flyer': '飞行单位走直线路径，无视地面防御布局，但生命值较低。需要部署对空炮台来专门应对，反应要快因为它们移动速度很快。',
            'boss': '⚠️ 极度危险！BOSS拥有3000点巨额生命值和毁灭性攻击能力。每次攻击都会直接摧毁一个炮台！它会停下来攻击范围内的炮台，造成巨大损失。务必保持所有炮台远离BOSS的100像素攻击范围，并集中所有火力优先击杀。被BOSS摧毁炮台还会损失金币！'
        };
        return tactics[type] || '暂无战术信息。';
    }
}

// 创建全局怪物图鉴UI实例
const monsterCodexUI = new MonsterCodexUI(); 