// 路径模板管理示例代码
// 这个文件展示如何在代码中添加、删除和管理路径模板

// 等待页面加载完成后运行示例
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== 路径模板管理示例 ===');
    
    // 示例1：添加新的路径模板
    function addCustomPaths() {
        console.log('\n1. 添加自定义路径模板:');
        
        // 添加一个心形路径
        const heartPath = {
            name: '心形路径',
            description: '浪漫的心形路径设计',
            groundPath: [
                { x: 50, y: 400 },
                { x: 200, y: 250 },
                { x: 300, y: 200 },
                { x: 400, y: 250 },
                { x: 500, y: 200 },
                { x: 600, y: 250 },
                { x: 750, y: 400 },
                { x: 400, y: 550 }
            ]
        };
        
        const success = pathTemplates.addCustomTemplate('heart', heartPath);
        console.log(`心形路径添加${success ? '成功' : '失败'}`);
        
        // 添加一个波浪形路径
        const wavePath = {
            name: '波浪路径', 
            description: '上下波浪形路径',
            groundPath: [
                { x: 50, y: 300 },
                { x: 150, y: 200 },
                { x: 250, y: 400 },
                { x: 350, y: 200 },
                { x: 450, y: 400 },
                { x: 550, y: 200 },
                { x: 650, y: 400 },
                { x: 750, y: 300 }
            ]
        };
        
        pathTemplates.addCustomTemplate('wave', wavePath);
        console.log('波浪路径添加成功');
    }
    
    // 示例2：查看和管理模板
    function manageTemplates() {
        console.log('\n2. 模板管理操作:');
        
        // 查看所有模板
        const allTemplates = pathTemplates.getTemplateList();
        console.log('当前所有模板:', allTemplates.map(t => t.name));
        
        // 检查特定模板是否存在
        console.log('心形路径是否存在:', pathTemplates.hasTemplate('heart'));
        console.log('不存在的模板:', pathTemplates.hasTemplate('nonexistent'));
    }
    
    // 示例3：切换和使用路径
    function switchPaths() {
        console.log('\n3. 路径切换操作:');
        
        // 切换到自定义路径
        if (pathTemplates.hasTemplate('heart')) {
            pathSystem.loadFromTemplate('heart');
            console.log('已切换到心形路径');
        }
        
        // 延迟切换到另一个路径
        setTimeout(() => {
            if (pathTemplates.hasTemplate('wave')) {
                pathSystem.loadFromTemplate('wave');
                console.log('已切换到波浪路径');
            }
        }, 3000);
    }
    
    // 示例4：删除路径
    function removePaths() {
        console.log('\n4. 删除路径操作:');
        
        // 删除单个模板
        setTimeout(() => {
            const removed = pathTemplates.removeTemplate('heart');
            console.log(`心形路径删除${removed ? '成功' : '失败'}`);
        }, 6000);
        
        // 清空所有自定义模板
        setTimeout(() => {
            const count = pathTemplates.clearCustomTemplates();
            console.log(`已清空 ${count} 个自定义模板`);
        }, 9000);
    }
    
    // 示例5：导入/导出模板
    function importExportTemplates() {
        console.log('\n5. 导入导出操作:');
        
        // 导出模板
        const exportData = pathTemplates.exportTemplate('snake');
        console.log('导出蛇形路径数据:', exportData);
        
        // 导入模板（从JSON字符串）
        const customTemplate = {
            "name": "导入的路径",
            "description": "从JSON导入的路径",
            "groundPath": [
                {"x": 50, "y": 350},
                {"x": 400, "y": 350},
                {"x": 750, "y": 350}
            ]
        };
        
        const imported = pathTemplates.importTemplate('imported', JSON.stringify(customTemplate));
        console.log(`模板导入${imported ? '成功' : '失败'}`);
    }
    
    // 运行所有示例（可以单独调用需要的函数）
    addCustomPaths();
    manageTemplates();
    switchPaths();
    removePaths();
    importExportTemplates();
});

// 全局函数，可以在控制台直接调用
window.pathExamples = {
    // 快速添加测试路径
    addTestPath: function() {
        const testPath = {
            name: '测试路径',
            description: '快速测试用路径',
            groundPath: [
                { x: 100, y: 300 },
                { x: 700, y: 300 }
            ]
        };
        return pathTemplates.addCustomTemplate('test', testPath);
    },
    
    // 快速删除测试路径
    removeTestPath: function() {
        return pathTemplates.removeTemplate('test');
    },
    
    // 查看当前所有模板
    listAll: function() {
        return pathTemplates.getTemplateList();
    },
    
    // 清空自定义模板
    clearCustom: function() {
        return pathTemplates.clearCustomTemplates();
    }
}; 