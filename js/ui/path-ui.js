// 路径模板UI - 路径选择和测试界面
class PathTemplateUI {
    constructor() {
        this.isOpen = false;
        this.createPanel();
        this.initializeEventListeners();
    }
    
    // 创建面板HTML
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'pathTemplatePanel';
        panel.className = 'path-template-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>路径模板测试</h3>
                <button id="closePathPanel" class="close-btn">×</button>
            </div>
            <div class="panel-content">
                <div class="current-template">
                    <h4>当前模板</h4>
                    <p id="currentTemplateName">默认路径</p>
                    <p id="currentTemplateDesc">S型蛇形路径</p>
                </div>
                
                <div class="template-list">
                    <h4>选择模板</h4>
                    <div id="templateCards"></div>
                </div>
                
                <div class="template-controls">
                    <button id="randomPathBtn" class="control-btn">随机路径</button>
                    <button id="resetPathBtn" class="control-btn">重置默认</button>
                    <button id="togglePathPointsBtn" class="control-btn">显示路径点</button>
                </div>
                
                <div class="path-info">
                    <h4>路径信息</h4>
                    <div id="pathInfoContent">
                        <p>地面路径长度: <span id="groundLength">0</span>px</p>
                        <p>飞行路径长度: <span id="airLength">0</span>px</p>
                        <p>地面路径点数: <span id="groundPoints">0</span></p>
                        <p>飞行路径点数: <span id="airPoints">0</span></p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .path-template-panel {
                position: fixed;
                left: -380px;
                top: 50%;
                transform: translateY(-50%);
                width: 350px;
                height: 550px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: left 0.3s ease;
                z-index: 1000;
                overflow: hidden;
            }
            
            .path-template-panel.open {
                left: 20px;
            }
            
            .panel-content {
                padding: 15px;
                height: calc(100% - 70px);
                overflow-y: auto;
            }
            
            .current-template {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .current-template h4 {
                margin: 0 0 8px 0;
                color: #333;
            }
            
            .current-template p {
                margin: 4px 0;
                font-size: 13px;
                color: #666;
            }
            
            .template-list {
                margin-bottom: 15px;
            }
            
            .template-list h4 {
                margin: 0 0 10px 0;
                color: #333;
            }
            
            .template-card {
                background: white;
                border: 2px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .template-card:hover {
                border-color: #96E6B3;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .template-card.active {
                border-color: #FFB84C;
                background: #FFF9EC;
            }
            
            .template-card h5 {
                margin: 0 0 4px 0;
                color: #333;
                font-size: 14px;
            }
            
            .template-card p {
                margin: 0;
                font-size: 12px;
                color: #666;
            }
            
            .template-controls {
                margin-bottom: 15px;
            }
            
            .control-btn {
                width: 100%;
                padding: 8px;
                margin-bottom: 8px;
                background: #96E6B3;
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .control-btn:hover {
                background: #7dd3a0;
            }
            
            .control-btn:active {
                background: #FFB84C;
            }
            
            .path-info {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 8px;
            }
            
            .path-info h4 {
                margin: 0 0 8px 0;
                color: #333;
            }
            
            .path-info p {
                margin: 4px 0;
                font-size: 13px;
                color: #666;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
        
        this.populateTemplateList();
    }
    
    // 填充模板列表
    populateTemplateList() {
        if (typeof pathTemplates === 'undefined') return;
        
        const container = document.getElementById('templateCards');
        const templates = pathTemplates.getTemplateList();
        
        container.innerHTML = '';
        
        templates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.dataset.templateId = template.id;
            card.innerHTML = `
                <h5>${template.name}</h5>
                <p>${template.description}</p>
            `;
            
            card.addEventListener('click', () => {
                this.selectTemplate(template.id);
            });
            
            container.appendChild(card);
        });
        
        this.updateCurrentTemplate();
    }
    
    // 初始化事件监听
    initializeEventListeners() {
        // 关闭面板
        document.getElementById('closePathPanel').addEventListener('click', () => {
            this.close();
        });
        
        // 随机路径
        document.getElementById('randomPathBtn').addEventListener('click', () => {
            this.generateRandomPath();
        });
        
        // 重置默认路径
        document.getElementById('resetPathBtn').addEventListener('click', () => {
            this.resetToDefault();
        });
        
        // 切换路径点显示
        document.getElementById('togglePathPointsBtn').addEventListener('click', () => {
            pathSystem.togglePathPoints();
        });
        
        // 定期更新路径信息
        setInterval(() => this.updatePathInfo(), 1000);
    }
    
    // 选择模板
    selectTemplate(templateId) {
        if (pathSystem.loadFromTemplate(templateId)) {
            if (typeof pathTemplates !== 'undefined') {
                pathTemplates.setTemplate(templateId);
            }
            this.updateCurrentTemplate();
            this.updateTemplateCards();
            this.updatePathInfo();
            
            console.log(`切换到路径模板: ${templateId}`);
        }
    }
    
    // 生成随机路径
    generateRandomPath() {
        if (typeof pathTemplates === 'undefined') return;
        
        const complexities = ['simple', 'medium', 'complex'];
        const randomComplexity = complexities[Math.floor(Math.random() * complexities.length)];
        
        const randomTemplate = pathTemplates.generateRandomPath(randomComplexity);
        pathSystem.setCustomPath(randomTemplate.groundPath, randomTemplate.airPath);
        
        this.updateCurrentTemplate();
        this.updateTemplateCards();
        this.updatePathInfo();
        
        console.log(`生成随机路径: ${randomTemplate.name}`);
    }
    
    // 重置为默认路径
    resetToDefault() {
        pathSystem.resetToDefault();
        this.updateCurrentTemplate();
        this.updateTemplateCards();
        this.updatePathInfo();
    }
    
    // 更新当前模板显示
    updateCurrentTemplate() {
        const currentTemplate = pathSystem.getCurrentTemplate();
        const nameElement = document.getElementById('currentTemplateName');
        const descElement = document.getElementById('currentTemplateDesc');
        
        if (currentTemplate === null) {
            nameElement.textContent = '默认路径';
            descElement.textContent = '迷宫路径';
        } else if (currentTemplate === 'custom') {
            nameElement.textContent = '自定义路径';
            descElement.textContent = '随机生成或自定义路径';
        } else if (typeof pathTemplates !== 'undefined') {
            const template = pathTemplates.getCurrentTemplate();
            nameElement.textContent = template.name;
            descElement.textContent = template.description;
        }
    }
    
    // 更新模板卡片状态
    updateTemplateCards() {
        const cards = document.querySelectorAll('.template-card');
        const currentTemplate = pathSystem.getCurrentTemplate();
        
        cards.forEach(card => {
            if (card.dataset.templateId === currentTemplate) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
    
    // 更新路径信息
    updatePathInfo() {
        const pathInfo = pathSystem.getPathInfo();
        
        document.getElementById('groundLength').textContent = pathInfo.groundPathLength;
        document.getElementById('airLength').textContent = pathInfo.airPathLength;
        document.getElementById('groundPoints').textContent = pathInfo.groundPathPoints;
        document.getElementById('airPoints').textContent = pathInfo.airPathPoints;
    }
    
    // 打开面板
    open() {
        this.isOpen = true;
        document.getElementById('pathTemplatePanel').classList.add('open');
        this.updateCurrentTemplate();
        this.updateTemplateCards();
        this.updatePathInfo();
    }
    
    // 关闭面板
    close() {
        this.isOpen = false;
        document.getElementById('pathTemplatePanel').classList.remove('open');
    }
    
    // 切换面板状态
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// 创建全局路径模板UI实例
const pathTemplateUI = new PathTemplateUI(); 