// 炮台系统 - 炮台类定义和攻击逻辑
class Turret {
    constructor(type, x, y, id) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.level = 1;
        
        // 设置炮台属性
        this.setAttributes(type);
        
        // 攻击相关
        this.lastFireTime = 0;
        this.target = null;
        this.angle = 0;
        
        // 状态
        this.isActive = true;
        this.isSelected = false;
        
        // 动画相关
        this.animationTime = 0;
        this.rotationSpeed = 0;
        this.effectPhase = 0;
        this.pulseScale = 1;
    }
    
    // 设置炮台属性
    setAttributes(type) {
        const baseAttributes = {
            'single': {
                baseDamage: 40,
                baseRange: 120,
                baseFireRate: 1.0, // 次/秒
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
                slowDuration: 5000, // 毫秒
                color: '#4444FF',
                name: '减速炮台',
                description: '冰冻减速效果'
            },
            'gold': {
                baseDamage: 0,
                baseRange: 0,
                baseFireRate: 0,
                goldProduction: 25, // 生产金币数量
                productionInterval: 7000, // 7秒生产一次
                color: '#FF8800',
                name: '金币萝卜',
                description: '定期生产金币'
            }
        };
        
        const base = baseAttributes[type];
        
        // 计算当前等级的属性（每级增加20%）
        const multiplier = 1 + (this.level - 1) * 0.2;
        
        this.damage = Math.round(base.baseDamage * multiplier);
        this.range = Math.round(base.baseRange * multiplier);
        this.fireRate = base.baseFireRate * multiplier;
        this.color = base.color;
        this.name = base.name;
        this.description = base.description;
        
        // 特殊属性
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
            this.lastProductionTime = 0;
            this.productionProgress = 0; // 0-1 之间的进度
            this.isWaitingCollection = false; // 是否等待收集
            this.collectionCoin = null; // 收集金币的位置和状态
        }
        
        // 计算升级费用
        this.upgradeCost = this.calculateUpgradeCost();
    }
    
    // 计算升级费用
    calculateUpgradeCost() {
        if (this.level >= 3) return null; // 最高3级
        
        const baseCost = 50;
        return Math.round(baseCost * Math.pow(1.25, this.level));
    }
    
    // 升级炮台
    upgrade() {
        if (this.level >= 3) return false;
        
        this.level++;
        this.setAttributes(this.type);
        return true;
    }
    
    // 更新炮台逻辑
    update(deltaTime, monsters) {
        if (!this.isActive) return;
        
        // 更新动画时间
        this.animationTime += deltaTime;
        this.effectPhase += deltaTime * 0.003; // 特效相位
        
        if (this.type === 'gold') {
            // 金币萝卜逻辑
            this.updateGoldProduction(deltaTime);
            
            // 添加萝卜叶子摆动效果
            this.pulseScale = 1 + Math.sin(this.animationTime * 0.002) * 0.05;
        } else {
            // 战斗炮台逻辑
            this.findTarget(monsters);
            this.tryFire(deltaTime);
            
            // 炮台旋转效果
            if (this.target) {
                this.rotationSpeed = Math.min(this.rotationSpeed + deltaTime * 0.005, 1);
            } else {
                this.rotationSpeed = Math.max(this.rotationSpeed - deltaTime * 0.002, 0);
            }
        }
    }
    
    // 寻找射程内的目标
    findTarget(monsters) {
        let closestMonster = null;
        let closestDistance = Infinity;
        
        for (let monster of monsters) {
            if (!monster.isActive || monster.isDead) continue;
            
            const distance = Math.sqrt(
                Math.pow(monster.position.x - this.x, 2) + 
                Math.pow(monster.position.y - this.y, 2)
            );
            
            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                closestMonster = monster;
            }
        }
        
        this.target = closestMonster;
        
        // 计算炮台朝向
        if (this.target) {
            this.angle = Math.atan2(
                this.target.position.y - this.y,
                this.target.position.x - this.x
            );
        }
    }
    
    // 尝试开火
    tryFire(deltaTime) {
        if (!this.target) return;
        
        const currentTime = Date.now();
        const fireInterval = 1000 / this.fireRate; // 转换为毫秒间隔
        
        if (currentTime - this.lastFireTime >= fireInterval) {
            this.fire();
            this.lastFireTime = currentTime;
        }
    }
    
    // 开火
    fire() {
        if (!this.target) return;
        
        // 播放射击音效
        if (window.audioManager) {
            audioManager.playTurretShoot(this.type);
        }
        
        // 创建子弹
        const bullet = new Bullet(
            this.x, 
            this.y, 
            this.target.position.x, 
            this.target.position.y,
            this.type,
            this.damage,
            this
        );
        
        // 添加到子弹系统
        bulletSystem.addBullet(bullet);
        
        console.log(`${this.name} 开火！目标: ${this.target.name}`);
    }
    
    // 渲染炮台
    render(ctx) {
        if (!this.isActive) return;
        
        // 绘制射程范围（如果被选中）
        if (this.isSelected && this.type !== 'gold') {
            this.renderRange(ctx);
        }
        
        // 根据类型绘制不同的炮台形象
        switch (this.type) {
            case 'gold':
                this.renderGoldCarrot(ctx);
                break;
            case 'single':
                this.renderSingleTurret(ctx);
                break;
            case 'splash':
                this.renderSplashTurret(ctx);
                break;
            case 'slow':
                this.renderSlowTurret(ctx);
                break;
            default:
                this.renderDefaultTurret(ctx);
        }
    }
    
    // 渲染金币萝卜（改进版本）
    renderGoldCarrot(ctx) {
        const x = this.x;
        const y = this.y;
        const scale = this.pulseScale;
        
        ctx.save();
        
        // 应用缩放动画
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.translate(-x, -y);
        
        // 绘制萝卜身体（更立体的椭圆）
        const gradient = ctx.createRadialGradient(x - 5, y - 2, 0, x, y + 3, 20);
        gradient.addColorStop(0, '#FFAA44');
        gradient.addColorStop(0.7, this.color); // '#FF8800'
        gradient.addColorStop(1, '#CC6600');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(x, y + 3, 18, 15, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 萝卜纹理线条（更细致）
        ctx.strokeStyle = '#E67300';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            const radius = 6 + i * 3;
            ctx.arc(x, y + 3, radius, 0.3, Math.PI - 0.3);
            ctx.stroke();
        }
        
        // 绘制萝卜叶子（有摆动动画）
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
        
        // 绘制萝卜脸部（可爱的表情）
        // 眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 5, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - 5, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // 嘴巴（微笑）
        ctx.strokeStyle = '#CC6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + 3, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // 绘制等级标识
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#CC6600';
        ctx.lineWidth = 3;
        ctx.strokeText(this.level.toString(), x, y + 12);
        ctx.fillText(this.level.toString(), x, y + 12);
        
        // 绘制闪亮特效
        if (Math.sin(this.effectPhase * 2) > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x - 10, y - 5, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 8, y + 2, 1.5, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 绘制生产进度条
        this.renderProductionProgress(ctx);
        
        // 绘制可收集的金币
        if (this.isWaitingCollection && this.collectionCoin) {
            this.renderCollectionCoin(ctx);
        }
        
        // 绘制选中状态
        if (this.isSelected) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.ellipse(x, y + 3, 25, 22, 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // 渲染单体炮台（精准六边形瞄准器）
    renderSingleTurret(ctx) {
        const x = this.x;
        const y = this.y;
        const size = 20;
        
        ctx.save();
        
        // 旋转动画
        ctx.translate(x, y);
        ctx.rotate(this.angle + this.rotationSpeed * this.effectPhase);
        ctx.translate(-x, -y);
        
        // 绘制六边形底座
        ctx.fillStyle = this.color; // '#FF4444'
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
        
        // 六边形边框
        ctx.strokeStyle = '#CC2222';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 内部渐变效果
        const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGradient;
        ctx.fill();
        
        // 绘制瞄准器十字线
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(x - size * 0.6, y);
        ctx.lineTo(x + size * 0.6, y);
        ctx.stroke();
        
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.6);
        ctx.lineTo(x, y + size * 0.6);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // 绘制中心瞄准点
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制精准指示环
        if (this.target) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.4, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 绘制等级和类型标识
        this.renderTurretInfo(ctx, 'S');
    }
    
    // 渲染群体炮台（蘑菇造型）
    renderSplashTurret(ctx) {
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
        
        // 绘制蘑菇帽子（椭圆）
        const capGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, size);
        capGradient.addColorStop(0, '#66DD66');
        capGradient.addColorStop(0.7, this.color); // '#44AA44'
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
            {x: x - 2, y: y - 12, r: 2},
            {x: x + 10, y: y + 2, r: 2.5},
            {x: x - 12, y: y + 5, r: 2}
        ];
        
        spots.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.r, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // 绘制毒气效果（如果有目标）
        if (this.target) {
            this.renderPoisonEffect(ctx);
        }
        
        // 绘制发光效果
        if (Math.sin(this.effectPhase * 3) > 0.3) {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.4)';
            ctx.beginPath();
            ctx.ellipse(x, y - 2, size * 1.2, size * 0.8, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 绘制等级和类型标识
        this.renderTurretInfo(ctx, 'G');
    }
    
    // 渲染减速炮台（雪花水晶造型）
    renderSlowTurret(ctx) {
        const x = this.x;
        const y = this.y;
        const size = 20;
        
        ctx.save();
        
        // 旋转动画（缓慢旋转）
        ctx.translate(x, y);
        ctx.rotate(this.effectPhase * 0.5);
        ctx.translate(-x, -y);
        
        // 绘制水晶底座（菱形）
        ctx.fillStyle = this.color; // '#4444FF'
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.7, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.7, y);
        ctx.closePath();
        ctx.fill();
        
        // 水晶渐变效果
        const crystalGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, size);
        crystalGradient.addColorStop(0, 'rgba(200, 200, 255, 0.8)');
        crystalGradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.4)');
        crystalGradient.addColorStop(1, 'rgba(68, 68, 255, 0.2)');
        ctx.fillStyle = crystalGradient;
        ctx.fill();
        
        ctx.strokeStyle = '#2222CC';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制雪花图案
        ctx.strokeStyle = '#AACCFF';
        ctx.lineWidth = 2;
        
        // 主要的六个方向
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const endX = x + Math.cos(angle) * size * 0.6;
            const endY = y + Math.sin(angle) * size * 0.6;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // 小分支
            const branchLength = size * 0.2;
            const branch1X = endX - Math.cos(angle - 0.5) * branchLength;
            const branch1Y = endY - Math.sin(angle - 0.5) * branchLength;
            const branch2X = endX - Math.cos(angle + 0.5) * branchLength;
            const branch2Y = endY - Math.sin(angle + 0.5) * branchLength;
            
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(branch1X, branch1Y);
            ctx.moveTo(endX, endY);
            ctx.lineTo(branch2X, branch2Y);
            ctx.stroke();
        }
        
        // 绘制中心水晶
        ctx.fillStyle = '#CCDDFF';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#AACCFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
        
        // 绘制冰晶闪烁特效
        if (Math.sin(this.effectPhase * 4) > 0.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const sparkles = [
                {x: x - 15, y: y - 10},
                {x: x + 12, y: y - 15},
                {x: x + 8, y: y + 12},
                {x: x - 10, y: y + 8}
            ];
            
            sparkles.forEach(sparkle => {
                ctx.save();
                ctx.translate(sparkle.x, sparkle.y);
                ctx.rotate(this.effectPhase);
                ctx.beginPath();
                ctx.moveTo(-3, 0);
                ctx.lineTo(3, 0);
                ctx.moveTo(0, -3);
                ctx.lineTo(0, 3);
                ctx.stroke();
                ctx.restore();
            });
        }
        
        // 绘制冰雾效果（如果有目标）
        if (this.target) {
            ctx.fillStyle = 'rgba(173, 216, 230, 0.3)';
            ctx.beginPath();
            ctx.arc(x, y, size * 1.5, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // 绘制等级和类型标识
        this.renderTurretInfo(ctx, 'R');
    }
    
    // 渲染毒气效果
    renderPoisonEffect(ctx) {
        const x = this.x;
        const y = this.y;
        
        ctx.save();
        ctx.globalAlpha = 0.4;
        
        // 绘制多层毒气云
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(this.effectPhase + i) * 5;
            const radius = 25 + i * 8 + offset;
            
            ctx.fillStyle = i % 2 === 0 ? '#88FF88' : '#66DD66';
            ctx.beginPath();
            ctx.arc(x + offset, y - 20 + offset, radius * 0.3, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 渲染炮台信息（等级和类型）
    renderTurretInfo(ctx, typeLabel) {
        const x = this.x;
        const y = this.y;
        
        // 绘制等级标识
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(this.level.toString(), x, y + 4);
        ctx.fillText(this.level.toString(), x, y + 4);
        
        // 绘制类型标识
        ctx.font = 'bold 10px Arial';
        ctx.strokeText(typeLabel, x, y - 25);
        ctx.fillText(typeLabel, x, y - 25);
        
        // 绘制选中状态
        if (this.isSelected) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // 渲染默认炮台（备用）
    renderDefaultTurret(ctx) {
        // 绘制炮台底座
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制炮管（指向目标）
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        const barrelLength = 15;
        const barrelX = this.x + Math.cos(this.angle) * barrelLength;
        const barrelY = this.y + Math.sin(this.angle) * barrelLength;
        ctx.lineTo(barrelX, barrelY);
        ctx.stroke();
        
        // 绘制等级标识
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.level.toString(), this.x, this.y + 4);
    }
    
    // 渲染射程范围
    renderRange(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 如果是群体攻击，显示爆炸范围
        if (this.type === 'splash' && this.target) {
            ctx.strokeStyle = '#44AA44';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(this.target.position.x, this.target.position.y, this.splashRadius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // 检查点击碰撞
    isPointInside(x, y) {
        const distance = Math.sqrt(
            Math.pow(x - this.x, 2) + 
            Math.pow(y - this.y, 2)
        );
        return distance <= 20;
    }
    
    // 获取炮台信息
    getInfo() {
        return {
            name: this.name,
            level: this.level,
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate.toFixed(1),
            upgradeCost: this.upgradeCost,
            specialInfo: this.getSpecialInfo()
        };
    }
    
    // 获取特殊属性信息
    getSpecialInfo() {
        switch (this.type) {
            case 'splash':
                return `爆炸范围: ${this.splashRadius}px`;
            case 'slow':
                return `减速: ${(this.slowPercent * 100)}% / ${this.slowDuration/1000}s`;
            case 'gold':
                return `金币生产: ${this.goldProduction}金币/次，间隔: ${this.productionInterval/1000}s`;
            default:
                return '单体高伤害';
        }
    }
    
    // 更新金币生产
    updateGoldProduction(deltaTime) {
        if (this.isWaitingCollection) {
            // 等待玩家收集，不更新生产进度
            return;
        }
        
        const currentTime = Date.now();
        
        if (this.lastProductionTime === 0) {
            this.lastProductionTime = currentTime;
        }
        
        const elapsed = currentTime - this.lastProductionTime;
        this.productionProgress = Math.min(elapsed / this.productionInterval, 1.0);
        
        if (elapsed >= this.productionInterval) {
            this.finishProduction();
        }
    }
    
    // 完成生产，等待收集
    finishProduction() {
        this.isWaitingCollection = true;
        this.productionProgress = 1.0;
        
        // 创建收集金币对象
        this.collectionCoin = {
            x: this.x,
            y: this.y - 35,
            size: 16,
            bobOffset: 0, // 浮动效果偏移
            glowIntensity: 0 // 发光效果强度
        };
        
        console.log(`金币萝卜生产完成！点击金币收集 ${this.goldProduction} 金币`);
    }
    
    // 收集金币
    collectGold() {
        if (!this.isWaitingCollection) return false;
        
        if (window.gameEngine) {
            window.gameEngine.addCoins(this.goldProduction);
            console.log(`收集了 ${this.goldProduction} 金币！`);
        }
        
        // 播放金币收集音效
        if (window.audioManager) {
            audioManager.playUISound('coin_earn');
        }
        
        // 重置生产状态
        this.isWaitingCollection = false;
        this.collectionCoin = null;
        this.productionProgress = 0;
        this.lastProductionTime = Date.now();
        
        return true;
    }
    
    // 检查金币是否被点击
    isCoinClicked(x, y) {
        if (!this.isWaitingCollection || !this.collectionCoin) return false;
        
        const distance = Math.sqrt(
            Math.pow(x - this.collectionCoin.x, 2) + 
            Math.pow(y - this.collectionCoin.y, 2)
        );
        
        return distance <= this.collectionCoin.size;
    }
    
    // 渲染可收集的金币
    renderCollectionCoin(ctx) {
        const coin = this.collectionCoin;
        const time = Date.now() * 0.005; // 时间用于动画
        
        // 更新浮动效果
        coin.bobOffset = Math.sin(time) * 3;
        coin.glowIntensity = (Math.sin(time * 2) + 1) * 0.5;
        
        // 计算当前位置
        const currentY = coin.y + coin.bobOffset;
        
        // 绘制发光效果
        const glowRadius = coin.size + coin.glowIntensity * 8;
        const gradient = ctx.createRadialGradient(
            coin.x, currentY, coin.size * 0.3,
            coin.x, currentY, glowRadius
        );
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(coin.x, currentY, glowRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制金币主体
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(coin.x, currentY, coin.size, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制金币边框
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制金币符号
        ctx.fillStyle = '#DAA520';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', coin.x, currentY + 5);
        
        // 绘制闪烁效果
        if (coin.glowIntensity > 0.7) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(coin.x - 4, currentY - 4, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    // 渲染生产进度条
    renderProductionProgress(ctx) {
        const barWidth = 30;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - 25;
        
        // 绘制背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 绘制进度
        const progressWidth = barWidth * this.productionProgress;
        if (this.isWaitingCollection) {
            // 等待收集时，进度条显示为等待状态
            ctx.fillStyle = '#FF8800';
        } else {
            // 正常生产中
            ctx.fillStyle = '#FFD700';
        }
        ctx.fillRect(barX, barY, progressWidth, barHeight);
        
        // 绘制边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 绘制状态提示文字
        if (this.isWaitingCollection) {
            ctx.fillStyle = '#FF8800';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('点击收集', this.x, barY - 2);
        }
    }
}

// 子弹类
class Bullet {
    constructor(startX, startY, targetX, targetY, type, damage, turret) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.type = type;
        this.damage = damage;
        this.turret = turret;
        
        // 计算移动方向
        const distance = Math.sqrt(
            Math.pow(targetX - startX, 2) + 
            Math.pow(targetY - startY, 2)
        );
        
        this.speed = 300; // 像素/秒
        this.vx = (targetX - startX) / distance * this.speed;
        this.vy = (targetY - startY) / distance * this.speed;
        
        this.isActive = true;
        this.hasHit = false;
    }
    
    // 更新子弹位置
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 移动子弹
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // 检查是否到达目标附近
        const distanceToTarget = Math.sqrt(
            Math.pow(this.targetX - this.x, 2) + 
            Math.pow(this.targetY - this.y, 2)
        );
        
        if (distanceToTarget < 10) {
            this.hit();
        }
    }
    
    // 命中处理
    hit() {
        if (this.hasHit) return;
        
        this.hasHit = true;
        this.isActive = false;
        
        // 处理伤害
        this.dealDamage();
    }
    
    // 处理伤害
    dealDamage() {
        const monsters = monsterSpawner.activeMonsters;
        
        if (this.type === 'splash') {
            // 群体攻击：范围伤害
            for (let monster of monsters) {
                const distance = Math.sqrt(
                    Math.pow(monster.position.x - this.targetX, 2) + 
                    Math.pow(monster.position.y - this.targetY, 2)
                );
                
                if (distance <= this.turret.splashRadius) {
                    const died = monster.takeDamage(this.damage);
                    
                    // 播放怪物死亡音效
                    if (died && window.audioManager) {
                        audioManager.playMonsterDeath(monster.type);
                    }
                }
            }
        } else {
            // 单体攻击：寻找最近的怪物
            let closestMonster = null;
            let closestDistance = Infinity;
            
            for (let monster of monsters) {
                const distance = Math.sqrt(
                    Math.pow(monster.position.x - this.targetX, 2) + 
                    Math.pow(monster.position.y - this.targetY, 2)
                );
                
                if (distance < closestDistance && distance < 20) {
                    closestDistance = distance;
                    closestMonster = monster;
                }
            }
            
            if (closestMonster) {
                const died = closestMonster.takeDamage(this.damage);
                
                // 播放怪物死亡音效
                if (died && window.audioManager) {
                    audioManager.playMonsterDeath(closestMonster.type);
                }
                
                // 减速效果
                if (this.type === 'slow') {
                    this.applySlowEffect(closestMonster);
                }
            }
        }
    }
    
    // 应用减速效果
    applySlowEffect(monster) {
        const currentTime = Date.now();
        
        if (monster.isSlowed) {
            // 如果已经被减速，只刷新减速结束时间
            monster.slowEndTime = currentTime + this.turret.slowDuration;
            console.log(`${monster.name} 减速时间刷新！`);
        } else {
            // 首次应用减速效果
            monster.isSlowed = true;
            monster.originalSpeed = monster.speed;
            monster.speed = monster.originalSpeed * (1 - this.turret.slowPercent);
            monster.slowEndTime = currentTime + this.turret.slowDuration;
            
            // 添加减速视觉效果
            monster.slowEffect = {
                radius: monster.size + 8,
                alpha: 0.8,
                pulsePhase: 0
            };
            
            console.log(`${monster.name} 被减速了！速度降低${(this.turret.slowPercent * 100)}%`);
        }
    }
    
    // 渲染子弹
    render(ctx) {
        if (!this.isActive) return;
        
        const colors = {
            'single': '#FF4444',
            'splash': '#44AA44',
            'slow': '#4444FF'
        };
        
        ctx.fillStyle = colors[this.type] || '#666';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// 子弹系统管理器
class BulletSystem {
    constructor() {
        this.bullets = [];
    }
    
    addBullet(bullet) {
        this.bullets.push(bullet);
    }
    
    update(deltaTime) {
        // 更新所有子弹
        for (let bullet of this.bullets) {
            bullet.update(deltaTime);
        }
        
        // 移除失效子弹
        this.bullets = this.bullets.filter(bullet => bullet.isActive);
    }
    
    render(ctx) {
        for (let bullet of this.bullets) {
            bullet.render(ctx);
        }
    }
    
    clear() {
        this.bullets = [];
    }
}

// 炮台管理器
class TurretManager {
    constructor() {
        this.turrets = [];
        this.selectedTurret = null;
        this.nextId = 1;
    }
    
    addTurret(type, x, y) {
        const turret = new Turret(type, x, y, this.nextId++);
        this.turrets.push(turret);
        return turret;
    }
    
    removeTurret(turret) {
        const index = this.turrets.indexOf(turret);
        if (index > -1) {
            this.turrets.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        const monsters = monsterSpawner.activeMonsters;
        
        for (let turret of this.turrets) {
            turret.update(deltaTime, monsters);
        }
        
        // 更新摧毁特效
        this.updateDestroyEffects();
    }
    
    render(ctx) {
        for (let turret of this.turrets) {
            turret.render(ctx);
        }
        
        // 渲染摧毁特效（在炮台上方）
        this.renderDestroyEffects(ctx);
    }
    
    getTurretAt(x, y) {
        for (let turret of this.turrets) {
            if (turret.isPointInside(x, y)) {
                return turret;
            }
        }
        return null;
    }
    
    // 检查是否点击了金币萝卜的收集金币
    checkGoldCollection(x, y) {
        for (let turret of this.turrets) {
            if (turret.type === 'gold' && turret.isCoinClicked && turret.isCoinClicked(x, y)) {
                return turret.collectGold() ? turret : null;
            }
        }
        return null;
    }
    
    selectTurret(turret) {
        // 取消之前的选择
        if (this.selectedTurret) {
            this.selectedTurret.isSelected = false;
        }
        
        this.selectedTurret = turret;
        if (turret) {
            turret.isSelected = true;
        }
    }
    
    clear() {
        this.turrets = [];
        this.selectedTurret = null;
    }
    
    // BOSS攻击摧毁炮台
    destroyTurret(turret) {
        if (!turret || !turret.isActive) return false;
        
        // 先设置炮台为非活跃状态
        turret.isActive = false;
        
        // 创建爆炸特效
        this.createDestroyEffect(turret.x, turret.y);
        
        // 如果被摧毁的是选中的炮台，取消选择
        if (this.selectedTurret === turret) {
            this.selectedTurret = null;
            // 隐藏炮台信息面板
            if (window.towerUI) {
                window.towerUI.hideTurretInfo();
            }
        }
        
        // 从数组中移除
        const index = this.turrets.indexOf(turret);
        if (index > -1) {
            this.turrets.splice(index, 1);
            console.log(`炮台 ${turret.name} 被BOSS摧毁了！已从数组中移除，index: ${index}`);
            return true;
        }
        
        return false;
    }
    
    // 创建炮台被摧毁的特效
    createDestroyEffect(x, y) {
        // 创建爆炸特效对象
        const effect = {
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 1000, // 特效持续1秒
            isActive: true
        };
        
        // 添加到特效列表
        if (!this.destroyEffects) {
            this.destroyEffects = [];
        }
        this.destroyEffects.push(effect);
        
        console.log(`在位置 (${x}, ${y}) 创建炮台摧毁特效`);
    }
    
    // 更新摧毁特效
    updateDestroyEffects() {
        if (!this.destroyEffects) return;
        
        const currentTime = Date.now();
        
        // 更新特效状态
        for (let effect of this.destroyEffects) {
            if (currentTime - effect.startTime >= effect.duration) {
                effect.isActive = false;
            }
        }
        
        // 移除过期特效
        this.destroyEffects = this.destroyEffects.filter(effect => effect.isActive);
    }
    
    // 渲染摧毁特效
    renderDestroyEffects(ctx) {
        if (!this.destroyEffects) return;
        
        const currentTime = Date.now();
        
        for (let effect of this.destroyEffects) {
            const elapsed = currentTime - effect.startTime;
            const progress = elapsed / effect.duration; // 0到1
            
            if (progress >= 1) continue;
            
            const x = effect.x;
            const y = effect.y;
            
            ctx.save();
            
            // 爆炸火焰效果
            const explosionRadius = 30 * (1 - progress * 0.3); // 从30缩小到21
            const alpha = 1 - progress; // 透明度递减
            
            // 外层爆炸火焰（红色）
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(x, y, explosionRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // 中层爆炸火焰（橙色）
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(x, y, explosionRadius * 0.7, 0, 2 * Math.PI);
            ctx.fill();
            
            // 内层爆炸火焰（黄色）
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, explosionRadius * 0.4, 0, 2 * Math.PI);
            ctx.fill();
            
            // 核心闪光（白色）
            if (progress < 0.3) {
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = alpha * 2;
                ctx.beginPath();
                ctx.arc(x, y, explosionRadius * 0.2, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // 爆炸碎片效果
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#8B4513'; // 棕色碎片
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * 2 * Math.PI;
                const distance = 20 + progress * 40; // 碎片飞散
                const fragmentX = x + Math.cos(angle) * distance;
                const fragmentY = y + Math.sin(angle) * distance;
                
                ctx.beginPath();
                ctx.arc(fragmentX, fragmentY, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}

// 创建全局实例
const bulletSystem = new BulletSystem();
const turretManager = new TurretManager();

// 设置为全局变量，让其他模块可以访问
window.turretManager = turretManager;
window.bulletSystem = bulletSystem; 