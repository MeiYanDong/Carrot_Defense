// 路径系统 - 管理怪物移动路径
class PathSystem {
    constructor() {
        // 默认路径（保持兼容性）- 调整为500高度canvas
        this.defaultGroundPath = [
            { x: 50, y: 450 },   // 底部起点（从550调整到450）
            { x: 150, y: 450 },  // 向右（从550调整到450）
            { x: 150, y: 350 },  // 向上（从450调整到350）
            { x: 300, y: 350 },  // 向右（从450调整到350）
            { x: 300, y: 280 },  // 向上（从350调整到280）
            { x: 200, y: 280 },  // 向左（从350调整到280）
            { x: 200, y: 200 },  // 向上（从250调整到200）
            { x: 400, y: 200 },  // 向右（从250调整到200）
            { x: 400, y: 120 },  // 向上（从150调整到120）
            { x: 500, y: 120 },  // 向右（从150调整到120）
            { x: 500, y: 280 },  // 向下（从350调整到280）
            { x: 650, y: 280 },  // 向右（从350调整到280）
            { x: 650, y: 80 },   // 向上（从100调整到80）
            { x: 750, y: 80 }    // 到终点（从100调整到80）
        ];
        
        this.defaultAirPath = [
            { x: 50,  y: 450 },  // 起点（从500调整到400）
            { x: 750, y: 80 }    // 终点（从100调整到80）
        ];
        
        // 当前使用的路径
        this.groundPath = [...this.defaultGroundPath];
        this.airPath = [...this.defaultAirPath];
        
        // 路径总长度（用于计算移动进度）
        this.groundPathLength = this.calculatePathLength(this.groundPath);
        this.airPathLength = this.calculatePathLength(this.airPath);
        
        // 当前模板信息
        this.currentTemplate = null;
    }
    
    // 从模板加载路径
    loadFromTemplate(templateName) {
        if (typeof pathTemplates === 'undefined') {
            console.warn('路径模板系统未加载，使用默认路径');
            return false;
        }
        
        const templateData = pathTemplates.getTemplatePaths(templateName);
        if (!templateData) {
            console.warn(`模板 "${templateName}" 不存在，使用默认路径`);
            return false;
        }
        
        this.groundPath = [...templateData.groundPath];
        this.airPath = [...templateData.airPath];
        
        // 重新计算路径长度
        this.groundPathLength = this.calculatePathLength(this.groundPath);
        this.airPathLength = this.calculatePathLength(this.airPath);
        
        this.currentTemplate = templateName;
        console.log(`成功加载路径模板: ${templateName}`);
        
        // 如果游戏正在运行，重置相关状态
        this.resetGamePathState();
        
        return true;
    }
    
    // 重置游戏路径状态（当路径改变时）
    resetGamePathState() {
        // 清除当前场上的怪物
        if (typeof monsterSpawner !== 'undefined') {
            monsterSpawner.clearAllMonsters();
            console.log('路径变更，清除场上怪物');
        }
        
        // 清除炮台选择状态
        if (typeof turretManager !== 'undefined') {
            turretManager.selectTurret(null);
        }
    }
    
    // 获取当前模板信息
    getCurrentTemplate() {
        return this.currentTemplate;
    }
    
    // 重置为默认路径
    resetToDefault() {
        this.groundPath = [...this.defaultGroundPath];
        this.airPath = [...this.defaultAirPath];
        this.groundPathLength = this.calculatePathLength(this.groundPath);
        this.airPathLength = this.calculatePathLength(this.airPath);
        this.currentTemplate = null;
        
        this.resetGamePathState();
        console.log('已重置为默认路径');
    }
    
    // 设置自定义路径
    setCustomPath(groundPath, airPath = null) {
        if (!groundPath) {
            console.error('自定义路径数据无效');
            return false;
        }
        
        // 如果没有提供飞行路径，自动生成
        if (!airPath && typeof pathTemplates !== 'undefined') {
            airPath = pathTemplates.generateAirPath(groundPath);
        } else if (!airPath) {
            // 如果pathTemplates未加载，使用简单的直线
            airPath = [
                { x: groundPath[0].x, y: groundPath[0].y },
                { x: groundPath[groundPath.length - 1].x, y: groundPath[groundPath.length - 1].y }
            ];
        }
        
        this.groundPath = [...groundPath];
        this.airPath = [...airPath];
        this.groundPathLength = this.calculatePathLength(this.groundPath);
        this.airPathLength = this.calculatePathLength(this.airPath);
        this.currentTemplate = 'custom';
        
        this.resetGamePathState();
        console.log('已设置自定义路径（飞行路径已自动生成）');
        return true;
    }
    
    // 计算路径总长度
    calculatePathLength(path) {
        let totalLength = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }
        return totalLength;
    }
    
    // 根据移动进度获取当前位置
    getPositionAtProgress(pathType, progress) {
        const path = pathType === 'air' ? this.airPath : this.groundPath;
        const totalLength = pathType === 'air' ? this.airPathLength : this.groundPathLength;
        
        // progress: 0-1 之间的值，表示沿路径移动的百分比
        progress = Math.max(0, Math.min(1, progress));
        const targetDistance = progress * totalLength;
        
        let currentDistance = 0;
        
        // 找到当前应该在哪一段路径上
        for (let i = 0; i < path.length - 1; i++) {
            const segmentStart = path[i];
            const segmentEnd = path[i + 1];
            const segmentLength = Math.sqrt(
                Math.pow(segmentEnd.x - segmentStart.x, 2) + 
                Math.pow(segmentEnd.y - segmentStart.y, 2)
            );
            
            if (currentDistance + segmentLength >= targetDistance) {
                // 在这一段路径上
                const segmentProgress = (targetDistance - currentDistance) / segmentLength;
                return {
                    x: segmentStart.x + (segmentEnd.x - segmentStart.x) * segmentProgress,
                    y: segmentStart.y + (segmentEnd.y - segmentStart.y) * segmentProgress
                };
            }
            
            currentDistance += segmentLength;
        }
        
        // 如果超出路径，返回终点
        return path[path.length - 1];
    }
    
    // 绘制路径（用于可视化）
    drawPath(ctx, pathType) {
        const path = pathType === 'air' ? this.airPath : this.groundPath;
        
        ctx.strokeStyle = pathType === 'air' ? '#87CEEB' : '#8B4513';
        ctx.lineWidth = pathType === 'air' ? 2 : 8;
        ctx.setLineDash(pathType === 'air' ? [5, 5] : []);
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        
        ctx.stroke();
        ctx.setLineDash([]); // 重置虚线样式
        
        // 绘制路径点（用于调试）
        if (this.showPathPoints) {
            this.drawPathPoints(ctx, path, pathType);
        }
    }
    
    // 绘制路径点（调试用）
    drawPathPoints(ctx, path, pathType) {
        ctx.fillStyle = pathType === 'air' ? '#87CEEB' : '#8B4513';
        
        for (let i = 0; i < path.length; i++) {
            ctx.beginPath();
            ctx.arc(path[i].x, path[i].y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // 绘制点的序号
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), path[i].x, path[i].y + 3);
            ctx.fillStyle = pathType === 'air' ? '#87CEEB' : '#8B4513';
        }
    }
    
    // 切换路径点显示
    togglePathPoints() {
        this.showPathPoints = !this.showPathPoints;
        console.log(`路径点显示: ${this.showPathPoints ? '开启' : '关闭'}`);
    }
    
    // 检查位置是否到达终点
    isAtEnd(pathType, progress) {
        return progress >= 1.0;
    }
    
    // 获取路径信息
    getPathInfo() {
        return {
            currentTemplate: this.currentTemplate,
            groundPathLength: Math.round(this.groundPathLength),
            airPathLength: Math.round(this.airPathLength),
            groundPathPoints: this.groundPath.length,
            airPathPoints: this.airPath.length
        };
    }
}

// 创建全局路径系统实例
const pathSystem = new PathSystem(); 