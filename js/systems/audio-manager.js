// 音效管理系统 - 统一管理游戏中的所有音效
class AudioManager {
    constructor() {
        // 音效存储
        this.sounds = {};
        this.music = null;
        this.currentMusic = null; // 当前播放的音乐名称
        this.isBossMusic = false; // 当前是否播放BOSS音乐
        
        // 音量控制
        this.settings = {
            masterVolume: 0.7,      // 主音量
            effectVolume: 0.8,      // 音效音量
            musicVolume: 0.5,       // 背景音乐音量
            enabled: true,          // 音效总开关
            useGeneratedSounds: true // 使用生成音效作为备用
        };
        
        // 音效播放状态
        this.currentlyPlaying = new Set(); // 正在播放的音效
        this.maxConcurrentSounds = 5;      // 最大同时播放数量
        
        // 初始化音效配置
        this.initSoundConfig();
        this.loadSettings();
    }
    
    // 初始化音效配置
    initSoundConfig() {
        this.soundConfig = {
            // 炮台相关音效
            turret: {
                'single_shoot': { file: 'assets/audio/sounds/turret_single.mp3', volume: 0.6, generated: 'single' },
                'splash_shoot': { file: 'assets/audio/sounds/turret_splash.mp3', volume: 0.7, generated: 'splash' },
                'slow_shoot': { file: 'assets/audio/sounds/turret_slow.mp3', volume: 0.5, generated: 'slow' },
                'build': { file: 'assets/audio/sounds/turret_build.mp3', volume: 0.8, generated: 'ui' },
                'upgrade': { file: 'assets/audio/sounds/turret_upgrade.mp3', volume: 0.7, generated: 'ui' },
                'sell': { file: 'assets/audio/sounds/turret_sell.mp3', volume: 0.6, generated: 'ui' }
            },
            
            // 怪物相关音效
            monster: {
                'soldier_death': { file: 'assets/audio/sounds/monster_death1.mp3', volume: 0.5, generated: 'soldier' },
                'tank_death': { file: 'assets/audio/sounds/monster_death2.mp3', volume: 0.6, generated: 'tank' },
                'flyer_death': { file: 'assets/audio/sounds/monster_death3.mp3', volume: 0.4, generated: 'flyer' },
                'boss_attack': { file: 'assets/audio/sounds/boss_attack.mp3', volume: 0.9, generated: 'boss' },
                'boss_death': { file: 'assets/audio/sounds/boss_death.mp3', volume: 1.0, generated: 'boss' }
            },
            
            // UI相关音效
            ui: {
                'button_click': { file: 'assets/audio/sounds/ui_click.mp3', volume: 0.4, generated: 'ui' },
                'wave_start': { file: 'assets/audio/sounds/wave_start.mp3', volume: 0.8, generated: 'wave' },
                'game_over': { file: 'assets/audio/sounds/game_over.mp3', volume: 0.9, generated: 'ui' },
                'victory': { file: 'assets/audio/sounds/victory.mp3', volume: 0.9, generated: 'ui' },
                'coin_earn': { file: 'assets/audio/sounds/coin.mp3', volume: 0.3, generated: 'coin' }
            },
            
            // 背景音乐
            music: {
                'normal_background': { file: 'assets/audio/sounds/L.S.传送带.mp3', volume: 0.3, loop: true },
                'boss_background': { file: 'assets/audio/sounds/Brainiac.mp3', volume: 0.4, loop: true }
            }
        };
    }
    
    // 预加载所有音效
    async preloadSounds() {
        console.log('🔊 开始预加载音效文件...');
        
        const loadPromises = [];
        
        // 遍历所有音效配置
        for (const category in this.soundConfig) {
            for (const soundName in this.soundConfig[category]) {
                const config = this.soundConfig[category][soundName];
                const fullName = `${category}_${soundName}`;
                
                const promise = this.loadSound(fullName, config.file, config.volume, config.loop, config.generated);
                loadPromises.push(promise);
            }
        }
        
        try {
            await Promise.all(loadPromises);
            console.log('✅ 所有音效加载完成！');
            return true;
        } catch (error) {
            console.warn('⚠️ 部分音效加载失败，游戏将以静音模式运行:', error);
            return false;
        }
    }
    
    // 加载单个音效文件
    loadSound(name, filePath, volume = 1.0, loop = false, generatedType = null) {
        return new Promise((resolve, reject) => {
            try {
                const audio = new Audio();
                
                // 设置音频属性
                audio.preload = 'auto';
                audio.volume = volume * this.settings.effectVolume * this.settings.masterVolume;
                audio.loop = loop;
                
                // 监听加载事件
                audio.addEventListener('canplaythrough', () => {
                    this.sounds[name] = {
                        audio: audio,
                        baseVolume: volume,
                        isMusic: loop,
                        generatedType: generatedType,
                        useGenerated: false
                    };
                    console.log(`✅ 音效加载成功: ${name}`);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`❌ 音效加载失败: ${name} - ${filePath}`);
                    // 创建一个使用生成音效的对象
                    this.sounds[name] = {
                        audio: null,
                        baseVolume: volume,
                        isMusic: loop,
                        generatedType: generatedType,
                        useGenerated: this.settings.useGeneratedSounds && generatedType
                    };
                    console.log(`🔧 将使用生成音效替代: ${name} (类型: ${generatedType})`);
                    resolve(); // 即使失败也resolve，让游戏继续运行
                });
                
                // 开始加载
                audio.src = filePath;
                audio.load();
                
            } catch (error) {
                console.warn(`❌ 创建音频对象失败: ${name}`, error);
                this.sounds[name] = { 
                    audio: null, 
                    baseVolume: volume, 
                    isMusic: loop,
                    generatedType: generatedType,
                    useGenerated: this.settings.useGeneratedSounds && generatedType
                };
                resolve();
            }
        });
    }
    
    // 播放音效
    playSound(soundName, options = {}) {
        if (!this.settings.enabled) return false;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`音效不存在: ${soundName}`);
            return false;
        }
        
        // 如果需要使用生成音效
        if (sound.useGenerated && sound.generatedType) {
            return this.playGeneratedSound(sound.generatedType, soundName, options);
        }
        
        // 使用加载的音效文件
        if (!sound.audio) {
            console.warn(`音效未加载且无生成音效备用: ${soundName}`);
            return false;
        }
        
        try {
            // 检查同时播放数量限制
            if (this.currentlyPlaying.size >= this.maxConcurrentSounds && !sound.isMusic) {
                console.log(`音效播放数量已达上限，跳过: ${soundName}`);
                return false;
            }
            
            const audio = sound.audio;
            
            // 如果是音乐且已在播放，直接返回
            if (sound.isMusic && !audio.paused) {
                return true;
            }
            
            // 重置播放位置
            audio.currentTime = 0;
            
            // 设置音量
            const volumeMultiplier = sound.isMusic ? this.settings.musicVolume : this.settings.effectVolume;
            const customVolume = options.volume || 1.0;
            audio.volume = sound.baseVolume * volumeMultiplier * this.settings.masterVolume * customVolume;
            
            // 开始播放
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.currentlyPlaying.add(soundName);
                    console.log(`🔊 播放音效: ${soundName}`);
                    
                    // 监听播放结束
                    const onEnded = () => {
                        this.currentlyPlaying.delete(soundName);
                        audio.removeEventListener('ended', onEnded);
                    };
                    audio.addEventListener('ended', onEnded);
                    
                }).catch(error => {
                    console.warn(`音效播放失败: ${soundName}`, error);
                });
            }
            
            return true;
            
        } catch (error) {
            console.warn(`播放音效时出错: ${soundName}`, error);
            return false;
        }
    }
    
    // 播放生成的音效
    async playGeneratedSound(generatedType, soundName, options = {}) {
        if (!window.audioGenerator) {
            console.warn('音效生成器未初始化');
            return false;
        }
        
        try {
            // 检查同时播放数量限制
            if (this.currentlyPlaying.size >= this.maxConcurrentSounds) {
                console.log(`音效播放数量已达上限，跳过生成音效: ${soundName}`);
                return false;
            }
            
            this.currentlyPlaying.add(soundName);
            console.log(`🎵 播放生成音效: ${soundName} (类型: ${generatedType})`);
            
            // 根据生成类型播放相应音效
            const [category, subtype] = generatedType.includes('_') ? 
                generatedType.split('_') : [generatedType, null];
            
            switch (category) {
                case 'single':
                case 'splash':
                case 'slow':
                    await window.audioGenerator.generateTurretShoot(category);
                    break;
                case 'soldier':
                case 'tank':
                case 'flyer':
                case 'boss':
                    if (soundName.includes('attack')) {
                        await window.audioGenerator.generateBossAttack();
                    } else {
                        await window.audioGenerator.generateMonsterDeath(category);
                    }
                    break;
                case 'ui':
                    await window.audioGenerator.generateUIClick();
                    break;
                case 'coin':
                    await window.audioGenerator.generateCoinSound();
                    break;
                case 'wave':
                    await window.audioGenerator.generateWaveStart();
                    break;
                default:
                    console.warn(`未知的生成音效类型: ${generatedType}`);
                    this.currentlyPlaying.delete(soundName);
                    return false;
            }
            
            // 播放完成后从播放列表中移除
            setTimeout(() => {
                this.currentlyPlaying.delete(soundName);
            }, 1500); // 假设生成音效最长1.5秒
            
            return true;
            
        } catch (error) {
            console.warn(`播放生成音效失败: ${soundName}`, error);
            this.currentlyPlaying.delete(soundName);
            return false;
        }
    }
    
    // 停止音效
    stopSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound && sound.audio) {
            sound.audio.pause();
            sound.audio.currentTime = 0;
            this.currentlyPlaying.delete(soundName);
            console.log(`⏹️ 停止音效: ${soundName}`);
        }
    }
    
    // 停止所有音效
    stopAllSounds() {
        for (const soundName in this.sounds) {
            this.stopSound(soundName);
        }
        this.currentlyPlaying.clear();
        console.log('⏹️ 所有音效已停止');
    }
    
    // 播放背景音乐（普通波次）
    playBackgroundMusic() {
        this.switchBackgroundMusic(false);
    }
    
    // 播放BOSS背景音乐
    playBossBackgroundMusic() {
        this.switchBackgroundMusic(true);
    }
    
    // 切换背景音乐
    switchBackgroundMusic(isBoss = false) {
        const targetMusic = isBoss ? 'music_boss_background' : 'music_normal_background';
        
        // 如果已经在播放目标音乐，直接返回
        if (this.currentMusic === targetMusic) {
            console.log(`🎵 音乐已经是${isBoss ? 'BOSS' : '普通'}模式，无需切换`);
            return;
        }
        
        // 停止当前音乐
        if (this.currentMusic) {
            this.stopSound(this.currentMusic);
        }
        
        // 播放目标音乐
        this.currentMusic = targetMusic;
        this.isBossMusic = isBoss;
        
        console.log(`🎵 切换到${isBoss ? 'BOSS' : '普通'}背景音乐: ${targetMusic}`);
        this.playSound(targetMusic);
    }
    
    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.stopSound(this.currentMusic);
            this.currentMusic = null;
            this.isBossMusic = false;
            console.log('🎵 背景音乐已停止');
        }
    }
    
    // 获取当前音乐信息
    getCurrentMusicInfo() {
        return {
            currentMusic: this.currentMusic,
            isBossMusic: this.isBossMusic,
            isPlaying: this.currentMusic ? !this.sounds[this.currentMusic]?.audio?.paused : false
        };
    }
    
    // 设置主音量
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
        console.log(`🔊 主音量设置为: ${(this.settings.masterVolume * 100).toFixed(0)}%`);
    }
    
    // 设置音效音量
    setEffectVolume(volume) {
        this.settings.effectVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
        console.log(`🔊 音效音量设置为: ${(this.settings.effectVolume * 100).toFixed(0)}%`);
    }
    
    // 设置音乐音量
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
        console.log(`🎵 音乐音量设置为: ${(this.settings.musicVolume * 100).toFixed(0)}%`);
    }
    
    // 切换音效开关
    toggleSound() {
        this.settings.enabled = !this.settings.enabled;
        if (!this.settings.enabled) {
            this.stopAllSounds();
        }
        this.saveSettings();
        console.log(`🔊 音效 ${this.settings.enabled ? '开启' : '关闭'}`);
        return this.settings.enabled;
    }
    
    // 恢复背景音乐播放（用于取消静音后恢复音乐）
    resumeBackgroundMusic() {
        if (this.settings.enabled && this.currentMusic) {
            console.log(`🎵 恢复播放背景音乐: ${this.currentMusic}`);
            this.playSound(this.currentMusic);
            return true;
        }
        return false;
    }
    
    // 更新所有音效的音量
    updateAllVolumes() {
        for (const soundName in this.sounds) {
            const sound = this.sounds[soundName];
            if (sound && sound.audio) {
                const volumeMultiplier = sound.isMusic ? this.settings.musicVolume : this.settings.effectVolume;
                sound.audio.volume = sound.baseVolume * volumeMultiplier * this.settings.masterVolume;
            }
        }
    }
    
    // 保存音效设置到本地存储
    saveSettings() {
        try {
            localStorage.setItem('audioSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('保存音效设置失败:', error);
        }
    }
    
    // 从本地存储加载音效设置
    loadSettings() {
        try {
            const saved = localStorage.getItem('audioSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                console.log('✅ 音效设置已加载:', this.settings);
            }
        } catch (error) {
            console.warn('加载音效设置失败，使用默认设置:', error);
        }
    }
    
    // 获取当前设置
    getSettings() {
        return { ...this.settings };
    }
    

    
    // 便捷方法：播放炮台射击音效
    playTurretShoot(turretType) {
        return this.playSound(`turret_${turretType}_shoot`);
    }
    
    // 便捷方法：播放怪物死亡音效
    playMonsterDeath(monsterType) {
        return this.playSound(`monster_${monsterType}_death`);
    }
    
    // 便捷方法：播放UI音效
    playUISound(actionType) {
        return this.playSound(`ui_${actionType}`);
    }
    
    // 便捷方法：播放BOSS攻击音效
    playBossAttack() {
        return this.playSound('monster_boss_attack');
    }
    
    // 便捷方法：根据波次类型播放背景音乐
    playBackgroundForWave(waveConfig) {
        if (waveConfig && waveConfig.type === 'boss') {
            this.playBossBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }
}

// 创建全局音效管理器实例
const audioManager = new AudioManager();

// 导出给其他模块使用
window.audioManager = audioManager; 