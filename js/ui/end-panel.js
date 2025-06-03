// 游戏结束面板 - 显示游戏结果和相关信息
class EndPanel {
    constructor() {
        this.isOpen = false;
        this.createPanel();
        this.initializeEventListeners();
    }
    
    // 创建面板HTML
    createPanel() {
        // 创建结束面板容器
        const panel = document.createElement('div');
        panel.id = 'endPanel';
        panel.className = 'end-panel';
        panel.innerHTML = `
            <div class="panel-content">
                <div class="panel-header">
                    <h3 id="endPanelTitle">游戏结束</h3>
                    <button id="closeEndPanel" class="close-btn">×</button>
                </div>
                <div class="info-content">
                    <div class="section">
                        <h4>最后一关说明</h4>
                        <p>最后一关过不去，菜就多练！</p>
                        <p>我和我舍友能过去了，说明是能过去的，我练了一个小时</p>
                    </div>
                    
                    <div class="section">
                        <h4>个人主页</h4>
                        <p><a href="https://leafy-gumption-ac62e5.netlify.app/" target="_blank">https://leafy-gumption-ac62e5.netlify.app/</a></p>
                    </div>
                    
                    <div class="section">
                        <h4>项目反馈问卷</h4>
                        <p><a href="https://b0kswls0jgj.feishu.cn/share/base/form/shrcnlDQVzsOuD8LIvN3jwuqPUb" target="_blank">填写反馈问卷</a></p>
                    </div>
                    
                    <div class="section">
                        <h4>Remix</h4>
                        <p>可以通过remix复刻代码，从而自己随意修改游戏属性</p>
                        <p>或者查看下方的github的项目源码，docx文件下有一些具体的说明，可以修改游戏玩法。</p>
                    </div>
                    
                    <div class="section">
                        <h4>项目源码</h4>
                        <p><a href="https://github.com/MeiYanDong/Carrot_Defense" target="_blank">https://github.com/MeiYanDong/Carrot_Defense</a></p>
                    </div>
                    
                    <div class="section">
                        <h4>作者过关视频(终于过了)</h4>
                        <p><a href="https://www.bilibili.com/video/BV1cT7eztE73/?vd_source=d3e857b9e4939b571542c3c8b5add97b" target="_blank">B站观看视频</a></p>
                    </div>
                </div>
                <div class="button-row">
                    <button id="retryButton" class="action-btn">重新挑战</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .end-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 2000;
                display: none;
                justify-content: center;
                align-items: center;
            }
            
            .end-panel.open {
                display: flex;
            }
            
            .panel-content {
                background: white;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #FFB84C;
                color: white;
            }
            
            .panel-header h3 {
                margin: 0;
                font-size: 22px;
                font-weight: bold;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .info-content {
                padding: 20px;
                overflow-y: auto;
                max-height: 60vh;
            }
            
            .section {
                margin-bottom: 20px;
            }
            
            .section h4 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 16px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
            }
            
            .section p {
                margin: 5px 0;
                font-size: 14px;
                line-height: 1.5;
                color: #444;
            }
            
            .section a {
                color: #4ECDC4;
                text-decoration: none;
            }
            
            .section a:hover {
                text-decoration: underline;
            }
            
            .button-row {
                padding: 15px;
                display: flex;
                justify-content: center;
                border-top: 1px solid #eee;
            }
            
            .action-btn {
                padding: 10px 30px;
                background: #96E6B3;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 16px;
            }
            
            .action-btn:hover {
                background: #7dd3a0;
            }
            
            .victory {
                background: #FFD700 !important;
            }
            
            .defeat {
                background: #FF6B6B !important;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(panel);
        
        this.panel = panel;
    }
    
    // 初始化事件监听
    initializeEventListeners() {
        // 关闭面板
        document.getElementById('closeEndPanel').addEventListener('click', () => {
            this.close();
        });
        
        // 重试按钮
        document.getElementById('retryButton').addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    // 显示胜利面板
    showVictory() {
        const title = document.getElementById('endPanelTitle');
        title.textContent = '胜利！恭喜你通关了！';
        title.parentElement.classList.add('victory');
        title.parentElement.classList.remove('defeat');
        this.open();
    }
    
    // 显示失败面板
    showDefeat() {
        const title = document.getElementById('endPanelTitle');
        title.textContent = '失败！怪物突破了防线！';
        title.parentElement.classList.add('defeat');
        title.parentElement.classList.remove('victory');
        this.open();
    }
    
    // 打开面板
    open() {
        this.isOpen = true;
        document.getElementById('endPanel').classList.add('open');
        
        // 播放相应音效（如果有）
        if (window.audioManager) {
            try {
                if (document.getElementById('endPanelTitle').textContent.includes('胜利')) {
                    audioManager.playUISound('victory');
                } else {
                    audioManager.playUISound('game_over');
                }
            } catch (e) {
                console.log('音效播放失败', e);
            }
        }
    }
    
    // 关闭面板
    close() {
        this.isOpen = false;
        document.getElementById('endPanel').classList.remove('open');
    }
}

// 创建全局实例
const endPanel = new EndPanel(); 