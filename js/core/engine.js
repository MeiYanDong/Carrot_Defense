// 游戏引擎 - 主循环和渲染管理
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.gameState = {
            wave: 1,
            lives: 5,
            coins: 100,
            status: 'ready', // ready, preparing, playing, paused, gameOver, victory
            isRunning: false
        };
        
        // 游戏对象数组（后续添加炮台等）
        this.turrets = [];
        this.projectiles = [];
        
        // 时间管理
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // 波次管理
        this.waveTimer = 0;
        this.waveDelay = 10000; // 波次间隔10秒
        this.waitingForNextWave = false;
        
        // 准备时间管理
        this.preparationTimer = 0;
        this.preparationDelay = 5000; // 5秒准备时间
        this.isPreparing = false;
        

        
        this.initializeEventListeners();
        this.updateUI();
        

        
        // 立即开始游戏循环以显示路径
        this.gameLoop();
    }
    
    // 初始化事件监听
    initializeEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('turretBtn').addEventListener('click', () => {
            towerUI.open();
        });
        
        document.getElementById('codexBtn').addEventListener('click', () => {
            monsterCodexUI.toggle();
        });
        

        
        // Canvas点击事件（怪物攻击和炮台选择）
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
        

    }
    
    // 处理Canvas点击
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // 将屏幕坐标转换为Canvas坐标
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        x = x * scaleX;
        y = y * scaleY;
        
        // 首先检查是否点击了金币收集
        const collectedTurret = turretManager.checkGoldCollection(x, y);
        if (collectedTurret) {
            console.log(`收集了金币萝卜的金币！`);
            return;
        }
        
        // 然后检查是否点击了炮台
        const turret = turretManager.getTurretAt(x, y);
        if (turret) {
            turretManager.selectTurret(turret);
            towerUI.showTurretInfo(turret);
            return;
        }
        
        // 如果没有点击炮台，取消选择
        turretManager.selectTurret(null);
        towerUI.hideTurretInfo();
    }
    
    // 开始游戏
    startGame() {
        if (this.gameState.status === 'ready' || this.gameState.status === 'paused') {
            this.gameState.status = 'preparing';
            this.gameState.isRunning = true;
            this.isPreparing = true;
            this.preparationTimer = 0;
            this.updateUI();
            
            console.log('游戏开始！5秒准备时间...');
        }
    }
    
    // 暂停/继续游戏
    togglePause() {
        if (this.gameState.status === 'playing' || this.gameState.status === 'preparing') {
            this.gameState.status = 'paused';
            this.gameState.isRunning = false;
        } else if (this.gameState.status === 'paused') {
            // 恢复到之前的状态
            if (this.isPreparing) {
                this.gameState.status = 'preparing';
            } else {
                this.gameState.status = 'playing';
            }
            this.gameState.isRunning = true;
        }
        this.updateUI();
    }
    
    // 开始下一波
    startNextWave() {
        const totalWaves = waveConfig.getTotalWaves(); // 动态获取总波数
        
        if (this.gameState.wave > totalWaves) {
            this.victory();
            return;
        }
        
        console.log(`准备开始第 ${this.gameState.wave} 波`);
        monsterSpawner.startWave(this.gameState.wave - 1); // spawner使用0-based index
        this.waitingForNextWave = false;
        this.waveTimer = 0;
    }
    
    // 更新UI显示
    updateUI() {
        const totalWaves = waveConfig.getTotalWaves(); // 动态获取总波数
        
        document.getElementById('waveNumber').textContent = this.gameState.wave;
        document.getElementById('totalWaves').textContent = totalWaves; // 更新总波数显示
        document.getElementById('lives').textContent = this.gameState.lives;
        document.getElementById('coins').textContent = this.gameState.coins;
        
        const statusMap = {
            'ready': '准备中',
            'preparing': '准备防御',
            'playing': '进行中',
            'paused': '已暂停',
            'gameOver': '游戏结束',
            'victory': '胜利！'
        };
        document.getElementById('gameStatus').textContent = statusMap[this.gameState.status];
    }
    
    // 主游戏循环
    gameLoop(currentTime = 0) {
        // 计算时间差
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 清空画布
        this.clearCanvas();
        
        // 绘制背景和路径
        this.drawBackground();
        
        // 更新游戏逻辑（只在游戏运行时）
        if (this.gameState.isRunning) {
            this.update(this.deltaTime);
        }
        
        // 渲染所有游戏对象
        this.render();
        
        // 继续循环
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // 清空画布
    clearCanvas() {
        this.ctx.fillStyle = '#FFF9EC';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 绘制背景和路径
    drawBackground() {
        // 绘制地面路径
        pathSystem.drawPath(this.ctx, 'ground');
        
        // 绘制飞行路径（虚线）
        pathSystem.drawPath(this.ctx, 'air');
        
        // 绘制路径标识 - 调整位置适配500px高度
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('地面路径', 60, 420);  // 从520调整到420
        this.ctx.fillText('飞行路径', 60, 440);  // 从540调整到440
        
        // 显示当前波次信息
        this.drawWaveInfo();
    }
    
    // 绘制波次信息
    drawWaveInfo() {
        const activeCount = monsterSpawner.getActiveMonsterCount();
        const waveInfo = monsterSpawner.getWaveInfo(this.gameState.wave - 1);
        const currentWaveInfo = monsterSpawner.getCurrentWaveInfo();
        const intervalInfo = monsterSpawner.getIntervalRange();
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        
        // 显示准备倒计时
        if (this.isPreparing) {
            const remainingTime = Math.ceil((this.preparationDelay - this.preparationTimer) / 1000);
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(`准备时间: ${remainingTime}秒`, 80, 30);
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('准备防御！', 80, 50);
            return;
        }
        
        if (waveInfo) {
            // 波次基本信息 - 调整到画布内的左上角稍微右移
            this.ctx.fillStyle = '#2E7D32';
            this.ctx.font = 'bold 16px Arial';
            const totalWaves = waveConfig.getTotalWaves(); // 动态获取总波数
            this.ctx.fillText(`第${waveInfo.waveNumber}/${totalWaves}波: ${waveInfo.name}`, 80, 30);
            
            // 波次描述
            this.ctx.fillStyle = '#666';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(waveInfo.description, 80, 48);
            
            // 生成模式
            const modeConfig = waveConfig.getSpawnModeConfig(waveInfo.spawnMode);
            this.ctx.fillStyle = '#FF5722';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.fillText(`模式: ${modeConfig.name}`, 80, 65);
            
            // 当前状态
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`场上怪物: ${activeCount}`, 80, 80);
            
            // 显示剩余怪物和间隔信息
            if (currentWaveInfo) {
                this.ctx.fillText(`待生成: ${currentWaveInfo.remainingMonsters}`, 80, 95);
                
                if (intervalInfo) {
                    this.ctx.fillStyle = '#795548';
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(`间隔: ${intervalInfo.min}-${intervalInfo.max}ms(当前:${intervalInfo.current}ms)`, 80, 110);
                }
            }
            
            // 下一波倒计时
            if (this.waitingForNextWave) {
                const waitTime = Math.ceil((this.waveDelay - this.waveTimer) / 1000);
                this.ctx.fillStyle = '#FF9800';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.fillText(`下一波倒计时: ${waitTime}秒`, 80, 125);
            }
        }
        
        // 调试信息：显示路径长度 - 调整位置适配500px高度
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#999';
        this.ctx.fillText(`地面路径: ${Math.round(pathSystem.groundPathLength)}px`, 20, 475);  // 从575调整到475
        this.ctx.fillText(`飞行路径: ${Math.round(pathSystem.airPathLength)}px`, 20, 490);   // 从590调整到490
    }
    
    // 更新游戏逻辑
    update(deltaTime) {
        // 处理准备阶段
        if (this.isPreparing) {
            this.preparationTimer += deltaTime;
            
            if (this.preparationTimer >= this.preparationDelay) {
                // 准备时间结束，开始第一波
                this.isPreparing = false;
                this.gameState.status = 'playing';
                this.startNextWave();
                console.log('准备时间结束！第一波开始！');
            }
            return; // 准备阶段不执行其他更新
        }
        
        // 更新怪物生成器
        monsterSpawner.update(deltaTime);
        
        // 更新炮台系统
        turretManager.update(deltaTime);
        
        // 更新子弹系统
        bulletSystem.update(deltaTime);
        
        // 检查波次完成状态
        this.checkWaveCompletion(deltaTime);
        

    }
    
    // 检查波次完成状态
    checkWaveCompletion(deltaTime) {
        if (monsterSpawner.isCurrentWaveComplete() && !this.waitingForNextWave) {
            console.log(`第 ${this.gameState.wave} 波完成！`);
            
            const totalWaves = waveConfig.getTotalWaves(); // 动态获取总波数
            
            if (this.gameState.wave >= totalWaves) {
                this.victory();
            } else {
                this.waitingForNextWave = true;
                this.waveTimer = 0;
                this.gameState.wave++;
                this.updateUI();
            }
        }
        
        // 更新波次等待计时器
        if (this.waitingForNextWave) {
            this.waveTimer += deltaTime;
            
            if (this.waveTimer >= this.waveDelay) {
                this.startNextWave();
            }
        }
    }
    
    // 渲染所有游戏对象
    render() {
        // 渲染怪物
        monsterSpawner.render(this.ctx);
        
        // 渲染炮台
        turretManager.render(this.ctx);
        
        // 渲染子弹
        bulletSystem.render(this.ctx);
        
        // 渲染拖拽预览
        this.renderDragPreview();
        

    }
    
    // 渲染拖拽预览
    renderDragPreview() {
        const preview = towerUI.getPreviewTurret();
        if (!preview) return;
        
        // 创建临时炮台对象用于预览渲染
        const tempTurret = {
            type: preview.type,
            x: preview.x,
            y: preview.y,
            level: 1,
            animationTime: Date.now(), // 使用当前时间作为动画时间
            effectPhase: Date.now() * 0.003,
            pulseScale: 1,
            isSelected: false,
            target: null,
            angle: 0,
            rotationSpeed: 0,
            
            // 设置炮台属性（复制自Turret类）
            setAttributes: function(type) {
                const baseAttributes = {
                    'single': {
                        baseDamage: 40,
                        baseRange: 120,
                        baseFireRate: 1.0,
                        color: '#FF4444',
                        name: '单体炮台',
                        description: '高伤害精准射击'
                    },
                    'splash': {
                        baseDamage: 25,
                        baseRange: 80,
                        baseFireRate: 0.8,
                        splashRadius: 40,
                        color: '#44AA44',
                        name: '群体炮台',
                        description: '毒气范围攻击'
                    },
                    'slow': {
                        baseDamage: 15,
                        baseRange: 150,
                        baseFireRate: 1.2,
                        slowPercent: 0.5,
                        slowDuration: 5000,
                        color: '#4444FF',
                        name: '减速炮台',
                        description: '冰冻减速效果'
                    },
                    'gold': {
                        baseDamage: 0,
                        baseRange: 0,
                        baseFireRate: 0,
                        goldProduction: 25,
                        productionInterval: 7000,
                        color: '#FF8800',
                        name: '金币萝卜',
                        description: '定期生产金币'
                    }
                };
                
                const base = baseAttributes[type];
                const multiplier = 1 + (this.level - 1) * 0.2;
                
                this.damage = Math.round(base.baseDamage * multiplier);
                this.range = Math.round(base.baseRange * multiplier);
                this.fireRate = base.baseFireRate * multiplier;
                this.color = base.color;
                this.name = base.name;
                this.description = base.description;
                
                if (type === 'splash') {
                    this.splashRadius = Math.round(base.splashRadius * multiplier);
                }
                if (type === 'slow') {
                    this.slowPercent = base.slowPercent;
                    this.slowDuration = base.slowDuration;
                }
                if (type === 'gold') {
                    this.goldProduction = Math.round(base.goldProduction * multiplier);
                    this.productionInterval = base.productionInterval;
                    this.productionProgress = 0.3; // 预览时显示部分进度
                    this.isWaitingCollection = false;
                    this.collectionCoin = null;
                }
            },
            
            // 添加必要的渲染方法（从Turret类复制）
            renderGoldCarrot: function(ctx) {
                const x = this.x;
                const y = this.y;
                const scale = this.pulseScale;
                
                ctx.save();
                
                // 绘制萝卜身体（更立体的椭圆）
                const gradient = ctx.createRadialGradient(x - 5, y - 2, 0, x, y + 3, 20);
                gradient.addColorStop(0, '#FFAA44');
                gradient.addColorStop(0.7, this.color); // '#FF8800'
                gradient.addColorStop(1, '#CC6600');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(x, y + 3, 18, 15, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // 萝卜纹理线条
                ctx.strokeStyle = '#E67300';
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    const radius = 6 + i * 3;
                    ctx.arc(x, y + 3, radius, 0.3, Math.PI - 0.3);
                    ctx.stroke();
                }
                
                // 绘制萝卜叶子
                const leafSway = Math.sin(this.animationTime * 0.003) * 0.2;
                
                // 左叶子
                ctx.save();
                ctx.translate(x - 8, y - 10);
                ctx.rotate(-0.3 + leafSway);
                ctx.fillStyle = '#66BB44';
                ctx.beginPath();
                ctx.ellipse(0, 0, 6, 10, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#558833';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
                
                // 右叶子
                ctx.save();
                ctx.translate(x + 8, y - 10);
                ctx.rotate(0.3 - leafSway);
                ctx.fillStyle = '#66BB44';
                ctx.beginPath();
                ctx.ellipse(0, 0, 6, 10, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#558833';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
                
                // 中间叶子
                ctx.save();
                ctx.translate(x, y - 12);
                ctx.rotate(leafSway * 0.5);
                ctx.fillStyle = '#77CC55';
                ctx.beginPath();
                ctx.ellipse(0, 0, 5, 12, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#669944';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
                
                // 绘制萝卜脸部
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x - 5, y, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 5, y, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(x - 5, y, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 5, y, 1.5, 0, 2 * Math.PI);
                ctx.fill();
                
                // 嘴巴
                ctx.strokeStyle = '#CC6600';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y + 3, 4, 0.2, Math.PI - 0.2);
                ctx.stroke();
                
                ctx.restore();
                
                // 绘制生产进度条（预览版）
                const barWidth = 30;
                const barHeight = 4;
                const barX = x - barWidth / 2;
                const barY = y - 25;
                
                ctx.fillStyle = '#333';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                
                const progressWidth = barWidth * this.productionProgress;
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(barX, barY, progressWidth, barHeight);
                
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
            },
            
            renderSingleTurret: function(ctx) {
                const x = this.x;
                const y = this.y;
                const size = 20;
                
                ctx.save();
                
                // 绘制六边形底座
                ctx.fillStyle = this.color;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const px = x + Math.cos(angle) * size;
                    const py = y + Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = '#CC2222';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // 绘制瞄准器十字线
                ctx.strokeStyle = '#FFFF00';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 2]);
                
                ctx.beginPath();
                ctx.moveTo(x - size * 0.6, y);
                ctx.lineTo(x + size * 0.6, y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x, y - size * 0.6);
                ctx.lineTo(x, y + size * 0.6);
                ctx.stroke();
                
                ctx.setLineDash([]);
                
                // 中心瞄准点
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.restore();
            },
            
            renderSplashTurret: function(ctx) {
                const x = this.x;
                const y = this.y;
                const size = 20;
                
                ctx.save();
                
                // 绘制蘑菇杆子
                ctx.fillStyle = '#DDDDDD';
                ctx.fillRect(x - 4, y, 8, size * 0.6);
                ctx.strokeStyle = '#BBBBBB';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - 4, y, 8, size * 0.6);
                
                // 绘制蘑菇帽子
                const capGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, size);
                capGradient.addColorStop(0, '#66DD66');
                capGradient.addColorStop(0.7, this.color);
                capGradient.addColorStop(1, '#226622');
                
                ctx.fillStyle = capGradient;
                ctx.beginPath();
                ctx.ellipse(x, y - 2, size, size * 0.6, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.strokeStyle = '#336633';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制蘑菇斑点
                ctx.fillStyle = '#BBFFBB';
                const spots = [
                    {x: x - 8, y: y - 5, r: 3},
                    {x: x + 6, y: y - 8, r: 2.5},
                    {x: x - 2, y: y - 12, r: 2}
                ];
                
                spots.forEach(spot => {
                    ctx.beginPath();
                    ctx.arc(spot.x, spot.y, spot.r, 0, 2 * Math.PI);
                    ctx.fill();
                });
                
                ctx.restore();
            },
            
            renderSlowTurret: function(ctx) {
                const x = this.x;
                const y = this.y;
                const size = 20;
                
                ctx.save();
                
                // 绘制水晶底座（菱形）
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.lineTo(x + size * 0.7, y);
                ctx.lineTo(x, y + size);
                ctx.lineTo(x - size * 0.7, y);
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = '#2222CC';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制雪花图案
                ctx.strokeStyle = '#AACCFF';
                ctx.lineWidth = 2;
                
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const endX = x + Math.cos(angle) * size * 0.6;
                    const endY = y + Math.sin(angle) * size * 0.6;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                
                // 中心水晶
                ctx.fillStyle = '#CCDDFF';
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.restore();
            }
        };
        
        // 初始化炮台属性
        tempTurret.setAttributes(preview.type);
        
        // 设置预览透明度
        this.ctx.globalAlpha = 0.7;
        
        // 使用新的渲染方法绘制预览炮台
        switch (preview.type) {
            case 'gold':
                tempTurret.renderGoldCarrot(this.ctx);
                break;
            case 'single':
                tempTurret.renderSingleTurret(this.ctx);
                break;
            case 'splash':
                tempTurret.renderSplashTurret(this.ctx);
                break;
            case 'slow':
                tempTurret.renderSlowTurret(this.ctx);
                break;
        }
        
        // 绘制预览射程（金币萝卜不显示射程）
        if (preview.type !== 'gold') {
            this.ctx.strokeStyle = tempTurret.color;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(preview.x, preview.y, tempTurret.range, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    

    
    // 添加金币
    addCoins(amount) {
        this.gameState.coins += amount;
        this.updateUI();
    }
    
    // 扣除生命
    loseLife() {
        this.gameState.lives--;
        this.updateUI();
        
        if (this.gameState.lives <= 0) {
            this.gameOver();
        }
    }
    
    // 游戏结束
    gameOver() {
        this.gameState.status = 'gameOver';
        this.gameState.isRunning = false;
        this.updateUI();
        
        // 清理所有游戏对象
        monsterSpawner.clearAllMonsters();
        turretManager.clear();
        bulletSystem.clear();
        
        // 使用结束面板替代alert
        endPanel.showDefeat();
    }
    
    // 胜利
    victory() {
        this.gameState.status = 'victory';
        this.gameState.isRunning = false;
        this.updateUI();
        
        // 使用结束面板替代alert
        endPanel.showVictory();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
    console.log('游戏引擎初始化完成！');
}); 