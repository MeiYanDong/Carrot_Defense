// 怪物系统 - 怪物类定义和渲染
class Monster {
    constructor(type, id) {
        this.id = id;
        this.type = type;
        this.isActive = false;
        
        // 根据类型设置属性
        this.setAttributes(type);
        
        // 移动相关
        this.pathProgress = 0;
        this.position = { x: 0, y: 0 };
        
        // 状态
        this.isDead = false;
        this.isAtEnd = false;
        
        // 减速状态
        this.isSlowed = false;
        this.originalSpeed = 0;
        this.slowEndTime = 0;
        this.slowEffect = null;
        
        // 动画相关
        this.animationTime = 0;
        this.walkCycle = 0;
        this.lastPosition = { x: 0, y: 0 };
        this.direction = 0; // 移动方向角度
        
        // 新增调试信息相关
        this.lastLoggedAttackState = false;
        
        // BOSS相关
        this.isAttacking = false;
        this.attackFrameCounter = 0;
        this.attackPhase = null;
    }
    
    // 设置怪物属性
    setAttributes(type) {
        const attributes = {
            'soldier': {
                maxHealth: 50,
                speed: 60, // 像素/秒
                size: 12,
                color: '#FF6B6B',
                pathType: 'ground',
                name: '小兵'
            },
            'tank': {
                maxHealth: 120,
                speed: 30, // 像素/秒
                size: 18,
                color: '#8B4513',
                pathType: 'ground',
                name: '坦克'
            },
            'flyer': {
                maxHealth: 30,
                speed: 80, // 像素/秒
                size: 10,
                color: '#4ECDC4',
                pathType: 'air',
                name: '飞行'
            },
            'boss': {
                maxHealth: 3000,
                speed: 45, // 像素/秒 - 适中速度
                size: 25,
                color: '#8B008B',
                pathType: 'ground',
                name: 'BOSS',
                attackDamage: 80, // BOSS独有的攻击力
                attackRange: 100, // 攻击范围（增加到100px）
                attackCooldown: 3000 // 攻击冷却时间（毫秒）
            }
        };
        
        const attr = attributes[type];
        this.maxHealth = attr.maxHealth;
        this.currentHealth = attr.maxHealth;
        this.speed = attr.speed;
        this.size = attr.size;
        this.color = attr.color;
        this.pathType = attr.pathType;
        this.name = attr.name;
        
        // BOSS特有属性
        if (type === 'boss') {
            this.attackDamage = attr.attackDamage;
            this.attackRange = attr.attackRange;
            this.attackCooldown = attr.attackCooldown;
            this.lastAttackTime = 0;
            this.isAttacking = false;
            this.attackTarget = null;
            this.attackAnimationTime = 0;
            this.attackFrameCounter = 0;
            this.attackPhase = null;
            this.originalSpeed = this.speed;
        }
    }
    
    // 激活怪物（从对象池中取出）
    activate(type, strengthMultiplier = 1.0) {
        this.type = type;
        this.setAttributes(type);
        
        // 应用强度加成
        if (strengthMultiplier !== 1.0) {
            this.maxHealth = Math.round(this.maxHealth * strengthMultiplier);
            this.currentHealth = this.maxHealth;
            this.speed = Math.round(this.speed * strengthMultiplier);
            
            // 保存加成信息用于显示
            this.strengthMultiplier = strengthMultiplier;
            this.isEnhanced = true;
        } else {
            this.strengthMultiplier = 1.0;
            this.isEnhanced = false;
        }
        
        this.pathProgress = 0;
        this.isDead = false;
        this.isAtEnd = false;
        this.isActive = true;
        
        // 重置减速状态
        this.isSlowed = false;
        this.slowEndTime = 0;
        this.slowEffect = null;
        
        // 对于BOSS，确保originalSpeed正确设置
        if (type === 'boss') {
            this.originalSpeed = this.speed; // 这里的speed已经应用了强化倍数
            this.isAttacking = false;
            this.attackTarget = null;
            this.attackFrameCounter = 0;
            this.attackPhase = null;
            
            console.log(`🔧 BOSS初始化: speed=${this.speed}, originalSpeed=${this.originalSpeed}, 强化倍数=${strengthMultiplier}`);
        }
        
        // 设置起始位置
        this.position = pathSystem.getPositionAtProgress(this.pathType, 0);
    }
    
    // 停用怪物（返回对象池）
    deactivate() {
        this.isActive = false;
        this.isDead = false;
        this.isAtEnd = false;
    }
    
    // 更新怪物状态
    update(deltaTime) {
        if (!this.isActive || this.isDead || this.isAtEnd) return;
        
        // 记录上一帧位置用于计算方向
        this.lastPosition = { ...this.position };
        
        // 检查减速状态是否过期
        this.updateSlowEffect();
        
        // BOSS特殊逻辑：检查是否需要攻击炮台
        if (this.type === 'boss') {
            // 只在攻击状态变化时输出调试信息
            if (this.lastLoggedAttackState !== this.isAttacking) {
                console.log(`🔄 BOSS状态变化: 攻击中=${this.isAttacking}, 位置=(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`);
                this.lastLoggedAttackState = this.isAttacking;
            }
            
            // 检查是否需要攻击炮台
            this.updateBossAttack(deltaTime);
        }
        
        // 如果BOSS正在攻击，停止移动
        if (this.isAttacking) {
            this.updateAnimationTime(deltaTime);
            return;
        }
        
        // 获取路径总长度
        const pathLength = this.pathType === 'air' ? 
            pathSystem.airPathLength : pathSystem.groundPathLength;
        
        // 计算移动距离（像素）
        const moveDistance = (this.speed * deltaTime) / 1000; // deltaTime转换为秒
        
        // BOSS移动调试信息
        if (this.type === 'boss') {
            // 每60帧输出一次调试信息（约1秒一次）
            if (Math.floor(this.animationTime / 1000) !== Math.floor((this.animationTime - deltaTime) / 1000)) {
                console.log(`🚶 BOSS移动: 速度=${this.speed}, 移动距离=${moveDistance.toFixed(3)}, 路径进度=${(this.pathProgress * 100).toFixed(1)}%, isAttacking=${this.isAttacking}`);
            }
        }
        
        // 转换为路径进度百分比
        this.pathProgress += moveDistance / pathLength;
        
        // 更新位置
        this.position = pathSystem.getPositionAtProgress(this.pathType, this.pathProgress);
        
        // 计算移动方向
        const dx = this.position.x - this.lastPosition.x;
        const dy = this.position.y - this.lastPosition.y;
        if (dx !== 0 || dy !== 0) {
            this.direction = Math.atan2(dy, dx);
        }
        
        this.updateAnimationTime(deltaTime);
        
        // 检查是否到达终点
        if (pathSystem.isAtEnd(this.pathType, this.pathProgress)) {
            this.isAtEnd = true;
        }
    }
    
    // 更新动画时间（提取为独立方法）
    updateAnimationTime(deltaTime) {
        // 更新动画时间
        this.animationTime += deltaTime;
        
        // 更新行走周期（基于实际移动速度）
        const dx = this.position.x - this.lastPosition.x;
        const dy = this.position.y - this.lastPosition.y;
        if (dx !== 0 || dy !== 0) {
            this.walkCycle += deltaTime * 0.01; // 行走动画速度
        }
        
        // BOSS攻击动画
        if (this.type === 'boss' && this.isAttacking) {
            this.attackAnimationTime += deltaTime;
        }
    }
    
    // 更新减速效果
    updateSlowEffect() {
        if (this.isSlowed && this.slowEndTime > 0) {
            const currentTime = Date.now();
            
            if (currentTime >= this.slowEndTime) {
                // 减速效果结束
                const oldSpeed = this.speed;
                this.speed = this.originalSpeed;
                this.isSlowed = false;
                this.slowEndTime = 0;
                this.slowEffect = null;
                
                if (this.type === 'boss') {
                    console.log(`❄️ BOSS减速效果结束，速度从${oldSpeed}恢复到${this.speed}`);
                } else {
                    console.log(`${this.name} 减速效果结束，恢复正常速度`);
                }
            } else if (this.slowEffect) {
                // 更新减速视觉效果
                this.slowEffect.pulsePhase += 0.1;
                this.slowEffect.alpha = 0.6 + 0.4 * Math.sin(this.slowEffect.pulsePhase);
            }
        }
    }
    
    // BOSS攻击逻辑（停止攻击版本）
    updateBossAttack(deltaTime) {
        // 如果已经在攻击过程中，更新攻击状态
        if (this.isAttacking) {
            this.updateAttackProgress();
            return;
        }
        
        // 检查攻击冷却（如果刚刚完成一轮攻击，给一个短暂的冷却）
        const currentTime = Date.now();
        const cooldownTime = this.lastAttackTime === 0 ? 0 : 500; // 第一次攻击无冷却，后续攻击0.5秒冷却
        
        if (currentTime - this.lastAttackTime < cooldownTime) {
            return;
        }
        
        // 查找攻击范围内的炮台
        const nearbyTurrets = this.findNearbyTurrets();
        
        if (nearbyTurrets.length > 0) {
            // 选择最近的炮台作为目标
            this.attackTarget = nearbyTurrets[0];
            console.log(`🎯 BOSS发现目标：${this.attackTarget.name}，开始停止并攻击！`);
            this.startAttackSequence();
        }
    }
    
    // 开始攻击序列
    startAttackSequence() {
        console.log(`🛑 BOSS停止移动，准备攻击`);
        console.log(`🔍 攻击开始前: speed=${this.speed}, originalSpeed=${this.originalSpeed}, isAttacking=${this.isAttacking}`);
        
        // 播放BOSS攻击音效
        if (window.audioManager) {
            audioManager.playBossAttack();
        }
        
        this.isAttacking = true;
        this.attackFrameCounter = 0; // 使用帧计数器
        
        // 保存当前速度，确保它不为0
        if (this.speed > 0) {
            this.originalSpeed = this.speed;
        } else if (this.originalSpeed <= 0) {
            // 如果当前速度和原始速度都为0，设置默认速度
            this.originalSpeed = 45; // BOSS默认速度
        }
        
        this.speed = 0; // 停止移动
        this.attackPhase = 'preparing'; // preparing -> attacking -> finishing
        
        console.log(`🔍 攻击开始后: speed=${this.speed}, originalSpeed=${this.originalSpeed}, isAttacking=${this.isAttacking}`);
    }
    
    // 更新攻击进度（基于帧计数）
    updateAttackProgress() {
        this.attackFrameCounter++;
        
        // 假设60FPS，60帧 = 1秒
        if (this.attackPhase === 'preparing' && this.attackFrameCounter >= 60) {
            // 1秒后执行攻击
            this.executeAttack();
            this.attackPhase = 'attacking';
        } else if (this.attackPhase === 'attacking' && this.attackFrameCounter >= 75) {
            // 0.25秒攻击动画
            this.attackPhase = 'finishing';
        } else if (this.attackPhase === 'finishing' && this.attackFrameCounter >= 120) {
            // 再等0.75秒，总共2秒
            this.finishAttack();
        }
        
        // 额外安全检查，防止BOSS卡住超过3秒
        if (this.attackFrameCounter > 180) {
            console.log(`⚠️ 攻击时间过长，强制结束攻击状态`);
            this.finishAttack();
        }
    }
    
    // 执行攻击
    executeAttack() {
        console.log(`💥 BOSS执行攻击！目标：${this.attackTarget ? this.attackTarget.name : '无'}`);
        
        if (this.attackTarget && this.attackTarget.isActive) {
            const targetName = this.attackTarget.name;
            const targetPos = `(${this.attackTarget.x}, ${this.attackTarget.y})`;
            
            // 调用炮台管理器的摧毁方法
            if (window.turretManager) {
                const destroyed = window.turretManager.destroyTurret(this.attackTarget);
                if (destroyed) {
                    console.log(`💀 ${targetName} 已被BOSS摧毁！位置: ${targetPos}`);
                    
                    // 扣除金币惩罚
                    if (window.gameEngine && window.gameEngine.gameState) {
                        const penalty = Math.min(50, window.gameEngine.gameState.coins);
                        window.gameEngine.gameState.coins -= penalty;
                        console.log(`💸 炮台被摧毁，损失${penalty}金币！剩余金币: ${window.gameEngine.gameState.coins}`);
                        window.gameEngine.updateUI();
                    }
                } else {
                    console.log(`❌ 摧毁炮台失败！目标: ${targetName}`);
                }
            }
        } else {
            console.log('⚠️ 攻击目标已失效或被摧毁');
        }
        
        this.lastAttackTime = Date.now();
    }
    
    // 完成攻击，检查是否继续攻击
    finishAttack() {
        console.log(`✅ BOSS单次攻击完成！位置: (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`);
        console.log(`🔍 攻击前状态: isAttacking=${this.isAttacking}, speed=${this.speed}, originalSpeed=${this.originalSpeed}`);
        
        // 重置攻击状态
        this.isAttacking = false;
        this.attackTarget = null;
        this.attackFrameCounter = 0;
        this.attackPhase = null;
        
        // 检查是否还有其他炮台在攻击范围内
        const remainingTurrets = this.findNearbyTurrets();
        
        if (remainingTurrets.length > 0) {
            console.log(`🎯 BOSS发现范围内还有${remainingTurrets.length}个炮台，继续攻击！`);
            
            // 继续攻击下一个目标
            this.attackTarget = remainingTurrets[0];
            this.startAttackSequence();
            return; // 不恢复移动，继续攻击
        }
        
        // 没有更多目标，恢复移动
        console.log(`🏃 攻击范围内已清空，BOSS恢复移动！`);
        
        // 确保originalSpeed有效，否则设置默认值
        if (this.originalSpeed <= 0) {
            this.originalSpeed = 45; // BOSS默认速度
            console.log(`⚠️ 原始速度无效，设置为默认值: ${this.originalSpeed}`);
        }
        
        this.speed = this.originalSpeed; // 恢复移动速度
        
        console.log(`🔍 攻击后状态: isAttacking=${this.isAttacking}, speed=${this.speed}, originalSpeed=${this.originalSpeed}`);
        console.log(`🏃 BOSS恢复移动，当前速度: ${this.speed}`);
        
        // 安全检查，确保BOSS不会卡住
        if (this.speed <= 0) {
            console.log(`⚠️ 警告：速度仍为0或负数！强制设置正常速度...`);
            this.speed = 45; // 强制设置为BOSS的默认速度
            this.originalSpeed = 45; // 同时更新原始速度
            console.log(`🔧 强制设置速度为: ${this.speed}`);
        }
    }
    
    // 查找附近的炮台
    findNearbyTurrets() {
        if (!window.turretManager || !window.turretManager.turrets) {
            console.log('BOSS找不到turretManager或turrets数组');
            return [];
        }
        
        const turretCount = window.turretManager.turrets.length;
        const nearbyTurrets = [];
        
        for (let turret of window.turretManager.turrets) {
            if (!turret.isActive) continue;
            
            const distance = Math.sqrt(
                Math.pow(turret.x - this.position.x, 2) + 
                Math.pow(turret.y - this.position.y, 2)
            );
            
            if (distance <= this.attackRange) {
                nearbyTurrets.push({
                    turret: turret,
                    distance: distance
                });
            }
        }
        
        // 只有在找到炮台时才输出详细信息
        if (nearbyTurrets.length > 0) {
            console.log(`🎯 BOSS扫描结果: 发现${nearbyTurrets.length}个炮台在攻击范围内（共${turretCount}个炮台存在）`);
            nearbyTurrets.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.turret.name} 距离: ${item.distance.toFixed(1)}px (位置: ${item.turret.x}, ${item.turret.y})`);
            });
        } else if (turretCount > 0) {
            console.log(`🔍 BOSS扫描结果: 范围内无炮台（共${turretCount}个炮台存在，但都在攻击范围外）`);
        }
        
        // 按距离排序，返回最近的炮台
        nearbyTurrets.sort((a, b) => a.distance - b.distance);
        return nearbyTurrets.map(item => item.turret);
    }
    
    // 受到伤害
    takeDamage(damage) {
        if (this.isDead) return false;
        
        this.currentHealth -= damage;
        
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.isDead = true;
            return true; // 返回true表示怪物死亡
        }
        
        return false;
    }
    
    // 获取血量百分比
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }
    
    // 获取血量条颜色
    getHealthBarColor() {
        const percentage = this.getHealthPercentage();
        
        if (percentage > 0.6) {
            return '#4CAF50'; // 绿色
        } else if (percentage > 0.2) {
            return '#FFC107'; // 黄色
        } else {
            return '#F44336'; // 红色
        }
    }
    
    // 渲染怪物
    render(ctx) {
        if (!this.isActive || this.isDead) return;
        
        // 绘制减速特效（在怪物本体下方）
        if (this.isSlowed && this.slowEffect) {
            this.renderSlowEffect(ctx);
        }
        
        // 绘制强化怪物的发光效果（在怪物本体下方）
        if (this.isEnhanced) {
            this.renderEnhancementEffect(ctx);
        }
        
        // 根据类型绘制不同的怪物形象
        switch (this.type) {
            case 'soldier':
                this.renderSoldier(ctx);
                break;
            case 'tank':
                this.renderTank(ctx);
                break;
            case 'flyer':
                this.renderFlyer(ctx);
                break;
            case 'boss':
                this.renderBoss(ctx);
                break;
            default:
                this.renderDefault(ctx);
        }
        
        // 绘制血量条
        this.renderHealthBar(ctx);
        
        // 绘制强化标识（在怪物上方）
        if (this.isEnhanced) {
            this.renderEnhancementLabel(ctx);
        }
    }
    
    // 渲染小兵（可爱战士造型）
    renderSoldier(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;
        
        // 行走摆动效果
        const walkBob = Math.sin(this.walkCycle * 8) * 2;
        const armSwing = Math.sin(this.walkCycle * 8) * 0.3;
        
        ctx.save();
        
        // 绘制身体（主体圆形）
        ctx.fillStyle = this.color; // '#FF6B6B'
        ctx.beginPath();
        ctx.arc(x, y + walkBob, size * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#D63447';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制头部（稍小的圆形）
        const headColor = '#FF9999'; // 稍浅的红色
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(x, y - size * 0.5 + walkBob, size * 0.6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#D63447';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 绘制头盔
        ctx.fillStyle = '#8B0000'; // 深红色头盔
        ctx.beginPath();
        ctx.arc(x, y - size * 0.5 + walkBob, size * 0.7, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#660000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 绘制眼睛
        ctx.fillStyle = 'white';
        // 左眼
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.6 + walkBob, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        // 右眼
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y - size * 0.6 + walkBob, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制瞳孔
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - size * 0.2, y - size * 0.6 + walkBob, size * 0.05, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.2, y - size * 0.6 + walkBob, size * 0.05, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制小手臂（有摆动动画）
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        // 左臂
        ctx.beginPath();
        ctx.moveTo(x - size * 0.6, y + armSwing + walkBob);
        ctx.lineTo(x - size * 0.9, y + size * 0.3 - armSwing + walkBob);
        ctx.stroke();
        // 右臂
        ctx.beginPath();
        ctx.moveTo(x + size * 0.6, y - armSwing + walkBob);
        ctx.lineTo(x + size * 0.9, y + size * 0.3 + armSwing + walkBob);
        ctx.stroke();
        
        // 绘制小脚（有行走动画）
        ctx.fillStyle = '#8B0000';
        const footOffset = Math.sin(this.walkCycle * 8) * 0.1;
        // 左脚
        ctx.beginPath();
        ctx.ellipse(x - size * 0.3, y + size * 0.9 + walkBob + footOffset, size * 0.2, size * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        // 右脚
        ctx.beginPath();
        ctx.ellipse(x + size * 0.3, y + size * 0.9 + walkBob - footOffset, size * 0.2, size * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染坦克（Q版坦克造型）
    renderTank(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;
        
        // 履带转动效果
        const trackAnimation = (this.animationTime * 0.01) % 1;
        
        ctx.save();
        
        // 绘制履带底座
        ctx.fillStyle = '#654321'; // 更深的棕色
        ctx.fillRect(x - size * 1.1, y + size * 0.3, size * 2.2, size * 0.6);
        ctx.strokeStyle = '#4A2C17';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size * 1.1, y + size * 0.3, size * 2.2, size * 0.6);
        
        // 绘制履带纹理（转动动画）
        ctx.strokeStyle = '#4A2C17';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const trackX = x - size * 1.1 + (i * size * 0.3 + trackAnimation * size * 0.3) % (size * 2.2);
            ctx.beginPath();
            ctx.moveTo(trackX, y + size * 0.3);
            ctx.lineTo(trackX, y + size * 0.9);
            ctx.stroke();
        }
        
        // 绘制坦克主体（矩形）
        ctx.fillStyle = this.color; // '#8B4513'
        const bodyWidth = size * 1.4;
        const bodyHeight = size * 0.8;
        ctx.fillRect(x - bodyWidth/2, y - bodyHeight/2, bodyWidth, bodyHeight);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - bodyWidth/2, y - bodyHeight/2, bodyWidth, bodyHeight);
        
        // 绘制坦克炮塔（圆形）
        ctx.fillStyle = '#A0522D'; // 稍浅的棕色
        ctx.beginPath();
        ctx.arc(x, y - size * 0.3, size * 0.6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制炮管
        ctx.strokeStyle = '#4A2C17';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.3);
        ctx.lineTo(x + size * 0.8, y - size * 0.3);
        ctx.stroke();
        
        // 绘制炮管顶端
        ctx.fillStyle = '#2F1B14';
        ctx.beginPath();
        ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制观察窗/眼睛
        ctx.fillStyle = '#87CEEB'; // 淡蓝色玻璃效果
        ctx.beginPath();
        ctx.rect(x - size * 0.2, y - size * 0.1, size * 0.4, size * 0.2);
        ctx.fill();
        ctx.strokeStyle = '#4A2C17';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - size * 0.2, y - size * 0.1, size * 0.4, size * 0.2);
        
        // 绘制装饰细节
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(x - size * 0.4, y + size * 0.1, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.1, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染飞行单位（蝴蝶造型）
    renderFlyer(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;
        
        // 翅膀扇动动画
        const wingFlap = Math.sin(this.animationTime * 0.02) * 0.5 + 0.5; // 0到1之间
        const wingAngle = wingFlap * Math.PI * 0.3; // 翅膀摆动角度
        
        // 飞行时的上下浮动
        const flyBob = Math.sin(this.animationTime * 0.008) * 3;
        const currentY = y + flyBob;
        
        ctx.save();
        
        // 绘制身体（椭圆形）
        ctx.fillStyle = this.color; // '#4ECDC4'
        ctx.beginPath();
        ctx.ellipse(x, currentY, size * 0.4, size * 0.8, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制头部
        const headColor = '#80E5E1'; // 稍浅的青色
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(x, currentY - size * 0.6, size * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 绘制触角
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 2;
        // 左触角
        ctx.beginPath();
        ctx.moveTo(x - size * 0.2, currentY - size * 0.7);
        ctx.quadraticCurveTo(x - size * 0.4, currentY - size * 1.1, x - size * 0.3, currentY - size * 1.3);
        ctx.stroke();
        // 右触角
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, currentY - size * 0.7);
        ctx.quadraticCurveTo(x + size * 0.4, currentY - size * 1.1, x + size * 0.3, currentY - size * 1.3);
        ctx.stroke();
        
        // 绘制触角顶端的小球
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.arc(x - size * 0.3, currentY - size * 1.3, size * 0.05, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.3, currentY - size * 1.3, size * 0.05, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制上翅膀（有扇动动画）
        ctx.fillStyle = '#80E5E1';
        ctx.save();
        // 左上翅膀
        ctx.translate(x - size * 0.3, currentY - size * 0.2);
        ctx.rotate(-wingAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.7, size * 0.4, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        // 右上翅膀
        ctx.translate(x + size * 0.3, currentY - size * 0.2);
        ctx.rotate(wingAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.7, size * 0.4, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        // 绘制下翅膀（稍小，反向摆动）
        ctx.fillStyle = '#66D9D6';
        ctx.save();
        // 左下翅膀
        ctx.translate(x - size * 0.2, currentY + size * 0.2);
        ctx.rotate(wingAngle * 0.7);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        // 右下翅膀
        ctx.translate(x + size * 0.2, currentY + size * 0.2);
        ctx.rotate(-wingAngle * 0.7);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#26A69A';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        
        // 绘制眼睛
        ctx.fillStyle = 'white';
        // 左眼
        ctx.beginPath();
        ctx.arc(x - size * 0.15, currentY - size * 0.65, size * 0.08, 0, 2 * Math.PI);
        ctx.fill();
        // 右眼
        ctx.beginPath();
        ctx.arc(x + size * 0.15, currentY - size * 0.65, size * 0.08, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制瞳孔
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - size * 0.15, currentY - size * 0.65, size * 0.04, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.15, currentY - size * 0.65, size * 0.04, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制翅膀上的装饰斑点
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.arc(x - size * 0.4, currentY - size * 0.1, size * 0.06, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size * 0.4, currentY - size * 0.1, size * 0.06, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 渲染BOSS（BOSS造型）
    renderBoss(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;
        
        // 绘制攻击特效（如果正在攻击）
        if (this.isAttacking) {
            this.renderBossAttackEffect(ctx);
        }
        
        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 3, y + size * 0.8, size * 0.9, size * 0.3, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制BOSS主体（更大更威武）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制装甲纹理
        ctx.fillStyle = '#660066';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制胸甲
        ctx.fillStyle = '#4B0082';
        ctx.fillRect(x - size * 0.6, y - size * 0.4, size * 1.2, size * 0.8);
        
        // 绘制王冠
        ctx.fillStyle = '#FFD700';
        const crownPoints = [
            {x: x - size * 0.8, y: y - size * 1.2},
            {x: x - size * 0.4, y: y - size * 0.8},
            {x: x, y: y - size * 1.4},
            {x: x + size * 0.4, y: y - size * 0.8},
            {x: x + size * 0.8, y: y - size * 1.2},
            {x: x + size * 0.6, y: y - size * 0.6},
            {x: x - size * 0.6, y: y - size * 0.6}
        ];
        
        ctx.beginPath();
        ctx.moveTo(crownPoints[0].x, crownPoints[0].y);
        for (let i = 1; i < crownPoints.length; i++) {
            ctx.lineTo(crownPoints[i].x, crownPoints[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // 王冠宝石
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y - size * 1.1, size * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制威武的眼睛
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.15, 0, 2 * Math.PI);
        ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        
        // 眼睛发光效果
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.08, 0, 2 * Math.PI);
        ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.08, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制威武的嘴巴
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y + size * 0.2, size * 0.4, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // 绘制利爪/武器
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        // 左爪
        ctx.beginPath();
        ctx.moveTo(x - size * 1.2, y);
        ctx.lineTo(x - size * 0.8, y - size * 0.3);
        ctx.moveTo(x - size * 1.2, y + size * 0.3);
        ctx.lineTo(x - size * 0.8, y);
        ctx.stroke();
        
        // 右爪
        ctx.beginPath();
        ctx.moveTo(x + size * 1.2, y);
        ctx.lineTo(x + size * 0.8, y - size * 0.3);
        ctx.moveTo(x + size * 1.2, y + size * 0.3);
        ctx.lineTo(x + size * 0.8, y);
        ctx.stroke();
        
        // 绘制主体轮廓
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 绘制BOSS标识
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', x, y + size * 1.8);
        
        // 绘制攻击范围提示（始终可见，方便调试）
        ctx.strokeStyle = this.isAttacking ? '#FF0000' : 'rgba(255, 0, 0, 0.2)';
        ctx.lineWidth = this.isAttacking ? 2 : 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, this.attackRange, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 如果正在攻击，绘制额外的攻击线条
        if (this.isAttacking && this.attackTarget) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.attackTarget.x, this.attackTarget.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // 渲染BOSS攻击特效
    renderBossAttackEffect(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;
        
        // 攻击蓄力特效
        if (this.attackAnimationTime < 1000) {
            const progress = this.attackAnimationTime / 1000;
            const glowSize = size * (1 + progress * 0.5);
            
            ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * (1 - progress)})`;
            ctx.beginPath();
            ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
            ctx.fill();
            
            // 蓄力时的能量汇聚效果
            if (this.attackTarget) {
                const targetX = this.attackTarget.x;
                const targetY = this.attackTarget.y;
                
                // 绘制指向目标的蓄力线
                ctx.strokeStyle = `rgba(255, 100, 100, ${0.8 * progress})`;
                ctx.lineWidth = 3 * progress;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(targetX, targetY);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // 目标位置的标记
                ctx.fillStyle = `rgba(255, 0, 0, ${0.6 * progress})`;
                ctx.beginPath();
                ctx.arc(targetX, targetY, 10 * progress, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        
        // 攻击闪光特效（攻击瞬间）
        if (this.attackAnimationTime >= 1000 && this.attackAnimationTime < 1200) {
            // 强烈的白光闪烁
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // 如果有攻击目标，绘制攻击光束
            if (this.attackTarget) {
                const targetX = this.attackTarget.x;
                const targetY = this.attackTarget.y;
                
                // 致命攻击光束
                const gradient = ctx.createLinearGradient(x, y, targetX, targetY);
                gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
                gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0.9)');
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(targetX, targetY);
                ctx.stroke();
                
                // 攻击光束的外层光晕
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 12;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(targetX, targetY);
                ctx.stroke();
            }
        }
        
        // 攻击后的余波效果
        if (this.attackAnimationTime >= 1200 && this.attackAnimationTime < 2000) {
            const afterProgress = (this.attackAnimationTime - 1200) / 800; // 0到1
            const alpha = 1 - afterProgress;
            
            // 余波光环
            ctx.strokeStyle = `rgba(255, 100, 100, ${alpha * 0.5})`;
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(x, y, size * (1 + afterProgress * 0.8), 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // 渲染默认形象（备用）
    renderDefault(ctx) {
        // 绘制怪物本体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制轮廓
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制类型标识
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        const label = this.type === 'soldier' ? 'S' : 
                     this.type === 'tank' ? 'T' : 'F';
        ctx.fillText(label, this.position.x, this.position.y + 3);
    }
    
    // 渲染减速特效
    renderSlowEffect(ctx) {
        const effect = this.slowEffect;
        if (!effect) return;
        
        // 保存当前上下文状态
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = effect.alpha;
        
        // 绘制蓝色光环
        ctx.strokeStyle = '#4444FF';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, effect.radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 绘制内层光环
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, effect.radius - 4, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 绘制冰雪粒子效果
        ctx.fillStyle = '#87CEEB';
        ctx.setLineDash([]);
        for (let i = 0; i < 6; i++) {
            const angle = (effect.pulsePhase + i * Math.PI / 3) % (2 * Math.PI);
            const particleX = this.position.x + Math.cos(angle) * (effect.radius - 2);
            const particleY = this.position.y + Math.sin(angle) * (effect.radius - 2);
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // 恢复上下文状态
        ctx.restore();
    }
    
    // 渲染强化效果（发光光环）
    renderEnhancementEffect(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const time = this.animationTime * 0.005; // 动画时间
        
        ctx.save();
        
        // 创建发光渐变
        const glowRadius = this.size + 8 + Math.sin(time * 3) * 3; // 动态半径
        const gradient = ctx.createRadialGradient(x, y, this.size * 0.5, x, y, glowRadius);
        
        // 根据强化倍数决定颜色
        let glowColor;
        if (this.strengthMultiplier >= 2.0) {
            glowColor = 'rgba(255, 215, 0, '; // 金色 - 超级强化
        } else if (this.strengthMultiplier >= 1.5) {
            glowColor = 'rgba(255, 100, 100, '; // 红色 - 强化
        } else {
            glowColor = 'rgba(100, 255, 100, '; // 绿色 - 轻微强化
        }
        
        gradient.addColorStop(0, glowColor + '0.1)');
        gradient.addColorStop(0.5, glowColor + '0.3)');
        gradient.addColorStop(1, glowColor + '0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制旋转的能量环
        const ringCount = Math.floor(this.strengthMultiplier);
        for (let i = 0; i < ringCount; i++) {
            const ringRadius = this.size + 5 + i * 4;
            const rotation = time * (1 + i * 0.5) + i * Math.PI / 2;
            
            ctx.strokeStyle = glowColor + '0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = rotation * 10;
            
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // 渲染强化标识
    renderEnhancementLabel(ctx) {
        const x = this.position.x;
        const y = this.position.y - this.size - 25; // 在血量条上方
        
        ctx.save();
        
        // 绘制强化级别背景
        const labelWidth = 20;
        const labelHeight = 12;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'; // 金色背景
        ctx.fillRect(x - labelWidth/2, y - labelHeight/2, labelWidth, labelHeight);
        
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - labelWidth/2, y - labelHeight/2, labelWidth, labelHeight);
        
        // 绘制强化文字
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        
        // 显示强化倍数
        const multiplierText = `×${this.strengthMultiplier.toFixed(1)}`;
        ctx.fillText(multiplierText, x, y + 2);
        
        // 绘制闪烁效果
        if (Math.sin(this.animationTime * 0.01) > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText('★', x - 8, y + 2); // 左侧星星
            ctx.fillText('★', x + 8, y + 2); // 右侧星星
        }
        
        ctx.restore();
    }
    
    // 渲染血量条
    renderHealthBar(ctx) {
        const barWidth = this.size * 2.5;
        const barHeight = 6;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 15;
        
        // 绘制背景（空血量）
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 绘制当前血量
        const healthWidth = barWidth * this.getHealthPercentage();
        ctx.fillStyle = this.getHealthBarColor();
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // 绘制边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 绘制血量数值
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${this.currentHealth}/${this.maxHealth}`, 
            this.position.x, 
            barY - 2
        );
    }
    
    // 检查是否与点发生碰撞（用于点击检测）
    isPointInside(x, y) {
        const distance = Math.sqrt(
            Math.pow(x - this.position.x, 2) + 
            Math.pow(y - this.position.y, 2)
        );
        return distance <= this.size;
    }
    
    // 获取怪物到达终点时造成的生命伤害
    getLifeDamage() {
        if (this.type === 'boss') {
            // BOSS根据攻击力计算生命伤害 (攻击力/20)
            return Math.ceil(this.attackDamage / 20); // 80/20 = 4条生命
        } else {
            // 普通怪物固定扣除1条生命
            return 1;
        }
    }
}

// 怪物工厂类
class MonsterFactory {
    static createMonster(type, id) {
        return new Monster(type, id);
    }
    
    // 获取怪物类型信息
    static getMonsterInfo(type) {
        const info = {
            'soldier': { name: '小兵', description: '移动速度快，血量中等' },
            'tank': { name: '坦克', description: '血量厚，移动缓慢' },
            'flyer': { name: '飞行单位', description: '血量低，走直线路径' },
            'boss': { name: 'BOSS', description: '高血量，适中速度，攻击能力' }
        };
        return info[type] || null;
    }
} 