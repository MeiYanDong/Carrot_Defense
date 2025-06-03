// 炮台UI系统 - 面板、拖拽、升级界面
class TowerUI {
    constructor() {
        this.isOpen = false;
        this.dragData = null;
        this.previewTurret = null;
        
        this.createPanel();
        this.initializeEventListeners();
    }
    
    // 创建面板HTML
    createPanel() {
        // 创建炮台面板容器
        const panel = document.createElement('div');
        panel.id = 'turretPanel';
        panel.className = 'turret-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>炮台管理</h3>
                <button id="closeTurretPanel" class="close-btn">×</button>
            </div>
            <div class="panel-content">
                <div class="turret-cards">
                    <div class="turret-card" data-type="single">
                        <canvas class="card-icon" width="36" height="36" data-type="single"></canvas>
                        <div class="card-info">
                            <h4>单体炮台</h4>
                            <p>费用: 50金币</p>
                            <p>高伤害精准射击</p>
                        </div>
                    </div>
                    <div class="turret-card" data-type="splash">
                        <canvas class="card-icon" width="36" height="36" data-type="splash"></canvas>
                        <div class="card-info">
                            <h4>群体炮台</h4>
                            <p>费用: 50金币</p>
                            <p>毒气范围攻击</p>
                        </div>
                    </div>
                    <div class="turret-card" data-type="slow">
                        <canvas class="card-icon" width="36" height="36" data-type="slow"></canvas>
                        <div class="card-info">
                            <h4>减速炮台</h4>
                            <p>费用: 50金币</p>
                            <p>冰冻减速效果</p>
                        </div>
                    </div>
                    <div class="turret-card" data-type="gold">
                        <canvas class="card-icon" width="36" height="36" data-type="gold"></canvas>
                        <div class="card-info">
                            <h4>金币萝卜</h4>
                            <p>费用: 50金币</p>
                            <p>7秒生产25金币</p>
                        </div>
                    </div>
                </div>
                <div id="turretInfo" class="turret-info" style="display: none;">
                    <h4 id="selectedTurretName">炮台信息</h4>
                    <div id="turretStats"></div>
                    <button id="upgradeTurretBtn" class="upgrade-btn">升级炮台</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .turret-panel {
                position: fixed;
                right: -350px;
                top: 50%;
                transform: translateY(-50%);
                width: 320px;
                max-height: 95vh;
                min-height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: right 0.3s ease;
                z-index: 1000;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .turret-panel.open {
                right: 20px;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #FFB84C;
                color: white;
                flex-shrink: 0;
            }
            
            .panel-header h3 {
                margin: 0;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-btn:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .panel-content {
                padding: 15px;
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .turret-cards {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 15px;
                flex-shrink: 0;
            }
            
            .turret-card {
                display: flex;
                align-items: center;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 8px;
                cursor: grab;
                transition: all 0.2s;
                background: white;
            }
            
            .turret-card:hover {
                border-color: #96E6B3;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .turret-card.dragging {
                opacity: 0.7;
                transform: rotate(5deg);
            }
            
            .turret-card.insufficient-funds {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .card-icon {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                margin-right: 10px;
                background: #f5f5f5;
                border: 2px solid #ddd;
                flex-shrink: 0;
            }
            
            .card-info h4 {
                margin: 0 0 3px 0;
                font-size: 13px;
            }
            
            .card-info p {
                margin: 1px 0;
                font-size: 11px;
                color: #666;
            }
            
            .turret-info {
                border-top: 1px solid #eee;
                padding-top: 12px;
                margin-top: auto;
                flex-shrink: 0;
            }
            
            .turret-info h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 14px;
            }
            
            #turretStats {
                font-size: 12px;
                line-height: 1.3;
                margin-bottom: 12px;
            }
            
            .upgrade-btn {
                width: 100%;
                padding: 8px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
            }
            
            .upgrade-btn:hover {
                background: #45a049;
            }
            
            .upgrade-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            
            .drag-preview {
                position: fixed;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
        
        this.panel = panel;
        
        // 绘制炮台图标
        this.drawTurretIcons();
    }
    
    // 绘制炮台图标
    drawTurretIcons() {
        const canvases = document.querySelectorAll('.card-icon');
        
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const type = canvas.getAttribute('data-type');
            const size = 36;
            const center = size / 2;
            
            // 清空画布
            ctx.clearRect(0, 0, size, size);
            
            // 根据类型绘制对应的炮台图标
            switch (type) {
                case 'single':
                    this.drawSingleTurretIcon(ctx, center, center, 12);
                    break;
                case 'splash':
                    this.drawSplashTurretIcon(ctx, center, center, 12);
                    break;
                case 'slow':
                    this.drawSlowTurretIcon(ctx, center, center, 12);
                    break;
                case 'gold':
                    this.drawGoldCarrotIcon(ctx, center, center, 12);
                    break;
            }
        });
    }
    
    // 绘制单体炮台图标
    drawSingleTurretIcon(ctx, x, y, size) {
        ctx.save();
        
        // 绘制六边形
        ctx.fillStyle = '#FF4444';
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
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制十字瞄准线
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 1]);
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(x - size * 0.5, y);
        ctx.lineTo(x + size * 0.5, y);
        ctx.stroke();
        
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.5);
        ctx.lineTo(x, y + size * 0.5);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // 中心点
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制群体炮台图标
    drawSplashTurretIcon(ctx, x, y, size) {
        ctx.save();
        
        // 绘制蘑菇杆子
        ctx.fillStyle = '#DDDDDD';
        ctx.fillRect(x - 2, y + 2, 4, size * 0.4);
        
        // 绘制蘑菇帽子
        ctx.fillStyle = '#44AA44';
        ctx.beginPath();
        ctx.ellipse(x, y - 1, size * 0.8, size * 0.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#336633';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 绘制蘑菇斑点
        ctx.fillStyle = '#BBFFBB';
        const spots = [
            {x: x - 6, y: y - 3, r: 1.5},
            {x: x + 4, y: y - 5, r: 1},
            {x: x - 1, y: y - 8, r: 1}
        ];
        
        spots.forEach(spot => {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.r, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    // 绘制减速炮台图标
    drawSlowTurretIcon(ctx, x, y, size) {
        ctx.save();
        
        // 绘制菱形底座
        ctx.fillStyle = '#4444FF';
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.6, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.6, y);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#2222CC';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 绘制雪花图案
        ctx.strokeStyle = '#AACCFF';
        ctx.lineWidth = 1.5;
        
        // 主要的六个方向
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const endX = x + Math.cos(angle) * size * 0.4;
            const endY = y + Math.sin(angle) * size * 0.4;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 中心水晶
        ctx.fillStyle = '#CCDDFF';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制金币萝卜图标
    drawGoldCarrotIcon(ctx, x, y, size) {
        ctx.save();
        
        // 绘制萝卜身体
        ctx.fillStyle = '#FF8800';
        ctx.beginPath();
        ctx.ellipse(x, y + 2, size * 0.6, size * 0.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 萝卜纹理
        ctx.strokeStyle = '#E67300';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const radius = 3 + i * 2;
            ctx.arc(x, y + 2, radius, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
        
        // 绘制叶子
        ctx.fillStyle = '#66BB44';
        
        // 左叶子
        ctx.save();
        ctx.translate(x - 4, y - 6);
        ctx.rotate(-0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 3, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        
        // 右叶子
        ctx.save();
        ctx.translate(x + 4, y - 6);
        ctx.rotate(0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 3, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        
        // 中间叶子
        ctx.save();
        ctx.translate(x, y - 8);
        ctx.beginPath();
        ctx.ellipse(0, 0, 2, 7, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        
        // 绘制可爱的眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 3, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 3, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - 3, y, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 3, y, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        // 微笑
        ctx.strokeStyle = '#CC6600';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y + 2, 2, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 初始化事件监听
    initializeEventListeners() {
        // 关闭面板
        document.getElementById('closeTurretPanel').addEventListener('click', () => {
            this.close();
        });
        
        // 炮台卡片拖拽
        const cards = document.querySelectorAll('.turret-card');
        cards.forEach(card => {
            card.addEventListener('mousedown', (e) => this.startDrag(e, card));
            card.addEventListener('dragstart', (e) => e.preventDefault()); // 禁用默认拖拽
        });
        
        // 升级按钮
        document.getElementById('upgradeTurretBtn').addEventListener('click', () => {
            this.upgradeTurret();
        });
        
        // 全局鼠标事件
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // 更新资金状态
        setInterval(() => this.updateAffordability(), 100);
    }
    
    // 开始拖拽
    startDrag(e, card) {
        const turretType = card.dataset.type;
        const cost = 50;
        
        // 检查是否有足够金币
        if (window.gameEngine.gameState.coins < cost) {
            return;
        }
        
        this.dragData = {
            type: turretType,
            cost: cost,
            offsetX: e.clientX,
            offsetY: e.clientY
        };
        
        card.classList.add('dragging');
        
        // 创建拖拽预览
        this.createDragPreview(turretType, e.clientX, e.clientY);
        
        e.preventDefault();
    }
    
    // 创建拖拽预览
    createDragPreview(type, x, y) {
        const preview = document.createElement('div');
        preview.className = 'drag-preview';
        preview.style.left = x + 'px';
        preview.style.top = y + 'px';
        
        const colors = {
            'single': '#FF4444',
            'splash': '#44AA44',
            'slow': '#4444FF',
            'gold': '#FF8800'
        };
        
        preview.style.background = colors[type];
        const label = type === 'single' ? 'S' : 
                     type === 'splash' ? 'G' : 
                     type === 'slow' ? 'R' : '🥕';
        preview.textContent = label;
        preview.style.color = 'white';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
        preview.style.fontWeight = 'bold';
        
        document.body.appendChild(preview);
        this.dragPreview = preview;
    }
    
    // 鼠标移动
    onMouseMove(e) {
        if (!this.dragData) return;
        
        // 更新拖拽预览位置
        if (this.dragPreview) {
            this.dragPreview.style.left = e.clientX + 'px';
            this.dragPreview.style.top = e.clientY + 'px';
        }
        
        // 显示放置预览
        this.updatePlacementPreview(e);
    }
    
    // 更新放置预览
    updatePlacementPreview(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 创建预览炮台（在引擎中渲染）
            this.previewTurret = {
                type: this.dragData.type,
                x: x,
                y: y,
                isPreview: true
            };
        } else {
            this.previewTurret = null;
        }
    }
    
    // 鼠标释放
    onMouseUp(e) {
        if (!this.dragData) return;
        
        // 清理拖拽状态
        const cards = document.querySelectorAll('.turret-card');
        cards.forEach(card => card.classList.remove('dragging'));
        
        if (this.dragPreview) {
            document.body.removeChild(this.dragPreview);
            this.dragPreview = null;
        }
        
        // 检查是否在游戏区域内放置
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.placeTurret(this.dragData.type, x, y, this.dragData.cost);
        }
        
        // 清理
        this.dragData = null;
        this.previewTurret = null;
    }
    
    // 放置炮台
    placeTurret(type, x, y, cost) {
        // 检查位置是否合法（不在路径上，不与其他炮台重叠）
        if (!this.isValidPlacement(x, y)) {
            console.log('无法在此位置放置炮台');
            return;
        }
        
        // 检查金币
        if (window.gameEngine.gameState.coins < cost) {
            console.log('金币不足');
            return;
        }
        
        // 扣除金币并放置炮台
        window.gameEngine.gameState.coins -= cost;
        window.gameEngine.updateUI();
        
        const turret = turretManager.addTurret(type, x, y);
        console.log(`放置炮台: ${turret.name} 在 (${x}, ${y})`);
    }
    
    // 检查放置位置是否合法
    isValidPlacement(x, y) {
        // 检查是否与现有炮台重叠
        for (let turret of turretManager.turrets) {
            const distance = Math.sqrt(
                Math.pow(x - turret.x, 2) + 
                Math.pow(y - turret.y, 2)
            );
            if (distance < 50) { // 最小间距50像素
                return false;
            }
        }
        
        // 检查是否在路径上（简单检查：避开路径中心区域）
        // 这里可以更精确地检查路径，暂时用简单规则
        const pathCheckRadius = 30;
        const groundPath = pathSystem.groundPath;
        
        for (let i = 0; i < groundPath.length - 1; i++) {
            const segmentStart = groundPath[i];
            const segmentEnd = groundPath[i + 1];
            
            // 检查点到线段的距离
            const distance = this.pointToLineDistance(x, y, segmentStart, segmentEnd);
            if (distance < pathCheckRadius) {
                return false;
            }
        }
        
        return true;
    }
    
    // 计算点到线段的距离
    pointToLineDistance(px, py, lineStart, lineEnd) {
        const A = px - lineStart.x;
        const B = py - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        
        const xx = lineStart.x + param * C;
        const yy = lineStart.y + param * D;
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 更新资金状态
    updateAffordability() {
        if (!this.isOpen) return;
        
        const coins = window.gameEngine?.gameState?.coins || 0;
        const cards = document.querySelectorAll('.turret-card');
        
        cards.forEach(card => {
            const cost = 50; // 基础费用
            if (coins < cost) {
                card.classList.add('insufficient-funds');
            } else {
                card.classList.remove('insufficient-funds');
            }
        });
    }
    
    // 显示炮台信息
    showTurretInfo(turret) {
        const info = turret.getInfo();
        const infoPanel = document.getElementById('turretInfo');
        const nameElement = document.getElementById('selectedTurretName');
        const statsElement = document.getElementById('turretStats');
        const upgradeBtn = document.getElementById('upgradeTurretBtn');
        
        nameElement.textContent = `${info.name} (等级 ${info.level})`;
        
        statsElement.innerHTML = `
            <div><strong>伤害:</strong> ${info.damage}</div>
            <div><strong>射程:</strong> ${info.range}px</div>
            <div><strong>射速:</strong> ${info.fireRate}/秒</div>
            <div><strong>特性:</strong> ${info.specialInfo}</div>
        `;
        
        if (info.upgradeCost) {
            upgradeBtn.textContent = `升级 (${info.upgradeCost}金币)`;
            upgradeBtn.disabled = window.gameEngine.gameState.coins < info.upgradeCost;
        } else {
            upgradeBtn.textContent = '已满级';
            upgradeBtn.disabled = true;
        }
        
        infoPanel.style.display = 'block';
    }
    
    // 隐藏炮台信息
    hideTurretInfo() {
        document.getElementById('turretInfo').style.display = 'none';
    }
    
    // 升级炮台
    upgradeTurret() {
        const selectedTurret = turretManager.selectedTurret;
        if (!selectedTurret) return;
        
        const cost = selectedTurret.upgradeCost;
        if (!cost || window.gameEngine.gameState.coins < cost) return;
        
        window.gameEngine.gameState.coins -= cost;
        window.gameEngine.updateUI();
        
        selectedTurret.upgrade();
        this.showTurretInfo(selectedTurret);
        
        console.log(`升级炮台到等级 ${selectedTurret.level}`);
    }
    
    // 打开面板
    open() {
        this.isOpen = true;
        document.getElementById('turretPanel').classList.add('open');
    }
    
    // 关闭面板
    close() {
        this.isOpen = false;
        document.getElementById('turretPanel').classList.remove('open');
        this.hideTurretInfo();
        turretManager.selectTurret(null);
    }
    
    // 获取预览炮台（用于渲染）
    getPreviewTurret() {
        return this.previewTurret;
    }
}

// 创建全局实例
const towerUI = new TowerUI(); 