// 路线模板模块 - 用于测试不同路径设计
class PathTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
        this.currentTemplate = 'snake'; // 默认模板
    }
    
    // 初始化所有路径模板
    initializeTemplates() {
        // 定义地面路径，飞行路径将自动生成
        const templateGroundPaths = {

            
            // 2. S型蛇形路径
            'snake': {
                name: 'S型蛇形',
                description: '蛇形弯曲路径，增加防御空间',
                groundPath: [
                    { x: 50, y: 400 },   // 左下起点（从500调整到400）
                    { x: 200, y: 400 },  // 向右
                    { x: 200, y: 280 },  // 向上（从350调整到280）
                    { x: 400, y: 280 },  // 向右
                    { x: 400, y: 160 },  // 向上（从200调整到160）
                    { x: 600, y: 160 },  // 向右
                    { x: 600, y: 80 },   // 向上（从100调整到80）
                    { x: 750, y: 80 }    // 到终点（从100调整到80）
                ]
            },
            
            // 3. 螺旋路径
            'spiral': {
                name: '螺旋路径',
                description: '螺旋形路径，最大化防御覆盖',
                groundPath: this.generateSpiralPath(400, 300, 150, 3, 16)
            },
            
            // 4. 迷宫型路径
            'maze': {
                name: '迷宫路径',
                description: '复杂迷宫路径，挑战性强',
                groundPath: [
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
                ]
            },
            
            // 5. 简单直线（测试用）
            'straight': {
                name: '直线路径',
                description: '最简单的直线路径，用于测试',
                groundPath: [
                    { x: 50, y: 300 },   // 起点
                    { x: 750, y: 300 }   // 终点
                ]
            },
            

            
            // 示例：如何添加新路径模板
            'zigzag': {
                name: 'Z字路径',
                description: 'Z字形路径，多转折防御',
                groundPath: [
                    { x: 50, y: 400 },   // 起点（从500调整到400）
                    { x: 250, y: 400 },  // 第一段（从500调整到400）
                    { x: 350, y: 280 },  // 斜向上（从350调整到280）
                    { x: 550, y: 280 },  // 第二段（从350调整到280）
                    { x: 650, y: 160 },  // 斜向上（从200调整到160）
                    { x: 750, y: 160 }   // 终点（从200调整到160）
                ]
            }
        };
        
        // 为每个模板自动生成飞行路径
        const templates = {};
        for (const [key, template] of Object.entries(templateGroundPaths)) {
            templates[key] = {
                name: template.name,
                description: template.description,
                groundPath: template.groundPath,
                airPath: this.generateAirPath(template.groundPath)
            };
        }
        
        return templates;
    }
    
    // 自动生成飞行路径（地面路径起点到终点的直线）
    generateAirPath(groundPath) {
        if (!groundPath || groundPath.length < 2) {
            return [{ x: 50, y: 300 }, { x: 750, y: 300 }]; // 默认直线
        }
        
        const startPoint = groundPath[0];
        const endPoint = groundPath[groundPath.length - 1];
        
        // 飞行路径就是起点到终点的直线，坐标完全相同
        return [
            { x: startPoint.x, y: startPoint.y },
            { x: endPoint.x, y: endPoint.y }
        ];
    }
    
    // 生成螺旋路径
    generateSpiralPath(centerX, centerY, maxRadius, turns, points) {
        const path = [];
        const totalPoints = turns * points;
        
        for (let i = 0; i <= totalPoints; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const radius = (i / totalPoints) * maxRadius;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            path.push({ x: Math.round(x), y: Math.round(y) });
        }
        
        return path;
    }
    
    // 获取当前模板
    getCurrentTemplate() {
        return this.templates[this.currentTemplate];
    }
    
    // 切换模板
    setTemplate(templateName) {
        if (this.templates[templateName]) {
            this.currentTemplate = templateName;
            console.log(`切换到路径模板: ${this.templates[templateName].name}`);
            return true;
        }
        console.warn(`路径模板 "${templateName}" 不存在`);
        return false;
    }
    
    // 获取所有模板列表
    getTemplateList() {
        return Object.keys(this.templates).map(key => ({
            id: key,
            name: this.templates[key].name,
            description: this.templates[key].description
        }));
    }
    
    // 获取模板的路径数据
    getTemplatePaths(templateName = null) {
        const template = templateName ? 
            this.templates[templateName] : 
            this.getCurrentTemplate();
            
        if (!template) return null;
        
        return {
            groundPath: [...template.groundPath],
            airPath: [...template.airPath]
        };
    }
    
    // 验证路径模板
    validateTemplate(template) {
        if (!template.groundPath || !template.airPath) {
            return { valid: false, error: '缺少地面路径或飞行路径' };
        }
        
        if (template.groundPath.length < 2) {
            return { valid: false, error: '地面路径至少需要2个点' };
        }
        
        if (template.airPath.length < 2) {
            return { valid: false, error: '飞行路径至少需要2个点' };
        }
        
        // 检查路径点是否在画布范围内
        const canvasWidth = 800;
        const canvasHeight = 500;
        
        const allPoints = [...template.groundPath, ...template.airPath];
        for (let point of allPoints) {
            if (point.x < 0 || point.x > canvasWidth || 
                point.y < 0 || point.y > canvasHeight) {
                return { 
                    valid: false, 
                    error: `路径点 (${point.x}, ${point.y}) 超出画布范围` 
                };
            }
        }
        
        return { valid: true };
    }
    
    // 添加自定义模板
    addCustomTemplate(name, template) {
        // 如果没有提供飞行路径，自动生成
        if (template.groundPath && !template.airPath) {
            template.airPath = this.generateAirPath(template.groundPath);
        }
        
        const validation = this.validateTemplate(template);
        if (!validation.valid) {
            console.error(`无法添加模板 "${name}": ${validation.error}`);
            return false;
        }
        
        this.templates[name] = {
            name: template.name || name,
            description: template.description || '自定义路径',
            groundPath: [...template.groundPath],
            airPath: [...template.airPath]
        };
        
        console.log(`成功添加自定义模板: ${name}`);
        return true;
    }
    
    // 导出模板数据
    exportTemplate(templateName) {
        const template = this.templates[templateName];
        if (!template) return null;
        
        return JSON.stringify(template, null, 2);
    }
    
    // 导入模板数据
    importTemplate(name, jsonData) {
        try {
            const template = JSON.parse(jsonData);
            return this.addCustomTemplate(name, template);
        } catch (error) {
            console.error(`导入模板失败: ${error.message}`);
            return false;
        }
    }
    
    // 生成随机路径（用于测试）
    generateRandomPath(complexity = 'medium') {
        const canvasWidth = 800;
        const canvasHeight = 500;
        const margin = 50;
        
        let pointCount;
        switch (complexity) {
            case 'simple': pointCount = 3; break;
            case 'medium': pointCount = 6; break;
            case 'complex': pointCount = 10; break;
            default: pointCount = 6;
        }
        
        const groundPath = [];
        
        // 生成地面路径
        groundPath.push({ x: margin, y: Math.random() * (canvasHeight - 2 * margin) + margin });
        
        for (let i = 1; i < pointCount - 1; i++) {
            const x = (i / (pointCount - 1)) * (canvasWidth - 2 * margin) + margin;
            const y = Math.random() * (canvasHeight - 2 * margin) + margin;
            groundPath.push({ x: Math.round(x), y: Math.round(y) });
        }
        
        groundPath.push({ x: canvasWidth - margin, y: Math.random() * (canvasHeight - 2 * margin) + margin });
        
        // 自动生成飞行路径
        const airPath = this.generateAirPath(groundPath);
        
        return {
            name: `随机路径_${Date.now()}`,
            description: `${complexity}复杂度的随机生成路径`,
            groundPath,
            airPath
        };
    }
    
    // 删除模板
    removeTemplate(templateName) {
        if (templateName === 'classic') {
            console.warn('不能删除默认模板');
            return false;
        }
        
        if (this.templates[templateName]) {
            delete this.templates[templateName];
            
            // 如果删除的是当前模板，切换到默认模板
            if (this.currentTemplate === templateName) {
                this.currentTemplate = 'classic';
            }
            
            console.log(`已删除模板: ${templateName}`);
            return true;
        }
        
        console.warn(`模板 "${templateName}" 不存在`);
        return false;
    }
    
    // 检查模板是否存在
    hasTemplate(templateName) {
        return this.templates.hasOwnProperty(templateName);
    }
    
    // 清空所有自定义模板（保留默认模板）
    clearCustomTemplates() {
        const defaultTemplates = ['classic', 'snake', 'spiral', 'maze', 'straight', 'cross', 'zigzag'];
        const customTemplates = [];
        
        for (const templateName of Object.keys(this.templates)) {
            if (!defaultTemplates.includes(templateName)) {
                customTemplates.push(templateName);
            }
        }
        
        customTemplates.forEach(templateName => {
            delete this.templates[templateName];
        });
        
        console.log(`已清空 ${customTemplates.length} 个自定义模板`);
        return customTemplates.length;
    }
}

// 创建全局路径模板实例
const pathTemplates = new PathTemplates(); 