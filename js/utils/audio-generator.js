// 音效生成器 - 使用Web Audio API生成简单的游戏音效
class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.initAudioContext();
    }
    
    // 初始化音频上下文
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ 音频上下文初始化成功');
        } catch (error) {
            console.warn('❌ 音频上下文初始化失败:', error);
        }
    }
    
    // 确保音频上下文激活
    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    // 生成炮台射击音效（不同炮台有不同音调）
    generateTurretShoot(type = 'single') {
        return new Promise(async (resolve) => {
            await this.ensureAudioContext();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // 根据炮台类型设置不同的音效参数
            let frequency, waveType, duration;
            switch (type) {
                case 'single':
                    frequency = 800;
                    waveType = 'square';
                    duration = 0.1;
                    break;
                case 'splash':
                    frequency = 400;
                    waveType = 'sawtooth';
                    duration = 0.15;
                    break;
                case 'slow':
                    frequency = 600;
                    waveType = 'sine';
                    duration = 0.2;
                    break;
                default:
                    frequency = 700;
                    waveType = 'triangle';
                    duration = 0.12;
            }
            
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, this.audioContext.currentTime + duration);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            setTimeout(() => resolve(), duration * 1000);
        });
    }
    
    // 生成怪物死亡音效
    generateMonsterDeath(type = 'soldier') {
        return new Promise(async (resolve) => {
            await this.ensureAudioContext();
            
            // 死亡音效：噪声+音调下降
            const oscillator = this.audioContext.createOscillator();
            const noiseBuffer = this.createNoiseBuffer(0.1);
            const noiseSource = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const noiseGain = this.audioContext.createGain();
            
            let frequency;
            switch (type) {
                case 'soldier':
                    frequency = 300;
                    break;
                case 'tank':
                    frequency = 150;
                    break;
                case 'flyer':
                    frequency = 500;
                    break;
                case 'boss':
                    frequency = 100;
                    break;
                default:
                    frequency = 250;
            }
            
            // 主音调
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            // 噪声效果
            noiseSource.buffer = noiseBuffer;
            noiseGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            noiseSource.connect(noiseGain);
            gainNode.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            noiseSource.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            noiseSource.stop(this.audioContext.currentTime + 0.1);
            
            setTimeout(() => resolve(), 400);
        });
    }
    
    // 生成BOSS攻击音效
    generateBossAttack() {
        return new Promise(async (resolve) => {
            await this.ensureAudioContext();
            
            // 蓄力阶段
            const chargeOsc = this.audioContext.createOscillator();
            const chargeGain = this.audioContext.createGain();
            
            chargeOsc.type = 'sine';
            chargeOsc.frequency.setValueAtTime(50, this.audioContext.currentTime);
            chargeOsc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 1.0);
            
            chargeGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            chargeGain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 1.0);
            
            chargeOsc.connect(chargeGain);
            chargeGain.connect(this.audioContext.destination);
            
            chargeOsc.start(this.audioContext.currentTime);
            chargeOsc.stop(this.audioContext.currentTime + 1.0);
            
            // 攻击爆发阶段
            setTimeout(() => {
                const attackOsc = this.audioContext.createOscillator();
                const attackGain = this.audioContext.createGain();
                const noiseBuffer = this.createNoiseBuffer(0.2);
                const noiseSource = this.audioContext.createBufferSource();
                const noiseGain = this.audioContext.createGain();
                
                attackOsc.type = 'square';
                attackOsc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                attackOsc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
                
                attackGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                attackGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                noiseSource.buffer = noiseBuffer;
                noiseGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                attackOsc.connect(attackGain);
                noiseSource.connect(noiseGain);
                attackGain.connect(this.audioContext.destination);
                noiseGain.connect(this.audioContext.destination);
                
                attackOsc.start(this.audioContext.currentTime);
                noiseSource.start(this.audioContext.currentTime);
                attackOsc.stop(this.audioContext.currentTime + 0.2);
                noiseSource.stop(this.audioContext.currentTime + 0.2);
            }, 1000);
            
            setTimeout(() => resolve(), 1300);
        });
    }
    
    // 生成UI点击音效
    generateUIClick() {
        return new Promise(async (resolve) => {
            await this.ensureAudioContext();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
            
            setTimeout(() => resolve(), 100);
        });
    }
    
    // 生成金币音效
    generateCoinSound() {
        return new Promise(async (resolve) => {
            await this.ensureAudioContext();
            
            // 金币音效：快速上升的音调
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.05); // E5
            oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.1); // G5
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
            
            setTimeout(() => resolve(), 200);
        });
    }
    
    // 生成波次开始音效
    generateWaveStart() {
        return new Promise(async (resolve) => {
            await this.ensureAudioContext();
            
            // 号角音效
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator1.type = 'sawtooth';
            oscillator1.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
            
            oscillator2.type = 'sawtooth';
            oscillator2.frequency.setValueAtTime(330, this.audioContext.currentTime); // E4
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator1.start(this.audioContext.currentTime);
            oscillator2.start(this.audioContext.currentTime);
            oscillator1.stop(this.audioContext.currentTime + 0.6);
            oscillator2.stop(this.audioContext.currentTime + 0.6);
            
            setTimeout(() => resolve(), 700);
        });
    }
    
    // 创建噪声缓冲区
    createNoiseBuffer(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    // 播放生成的音效
    async playGeneratedSound(type, subtype = null) {
        try {
            switch (type) {
                case 'turret':
                    await this.generateTurretShoot(subtype || 'single');
                    break;
                case 'monster':
                    await this.generateMonsterDeath(subtype || 'soldier');
                    break;
                case 'boss':
                    await this.generateBossAttack();
                    break;
                case 'ui':
                    await this.generateUIClick();
                    break;
                case 'coin':
                    await this.generateCoinSound();
                    break;
                case 'wave':
                    await this.generateWaveStart();
                    break;
                default:
                    console.warn('未知的音效类型:', type);
            }
            console.log(`🔊 播放生成音效: ${type} ${subtype || ''}`);
        } catch (error) {
            console.warn('播放生成音效失败:', error);
        }
    }
}

// 创建全局音效生成器实例
const audioGenerator = new AudioGenerator();
window.audioGenerator = audioGenerator; 