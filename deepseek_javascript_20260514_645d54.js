import Phaser from 'phaser';
import { ContraryAI } from '../ai/ContraryAI.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Create simple graphics
        this.createGraphics();
    }

    createGraphics() {
        // Create character (blue square)
        const charGraphics = this.add.graphics();
        charGraphics.fillStyle(0x4466ff, 1);
        charGraphics.fillRoundedRect(0, 0, 40, 40, 8);
        charGraphics.generateTexture('character', 40, 40);
        charGraphics.destroy();

        // Create home marker (green circle)
        const homeGraphics = this.add.graphics();
        homeGraphics.fillStyle(0x00ff00, 1);
        homeGraphics.fillCircle(20, 20, 20);
        homeGraphics.generateTexture('home', 40, 40);
        homeGraphics.destroy();

        // Create destination marker (red circle)
        const destGraphics = this.add.graphics();
        destGraphics.fillStyle(0xff0000, 1);
        destGraphics.fillCircle(20, 20, 20);
        destGraphics.generateTexture('destination', 40, 40);
        destGraphics.destroy();

        // Create obstacle texture
        const obsGraphics = this.add.graphics();
        obsGraphics.fillStyle(0x666666, 1);
        obsGraphics.fillRect(0, 0, 30, 30);
        obsGraphics.generateTexture('obstacle', 30, 30);
        obsGraphics.destroy();
    }

    create() {
        // Set world bounds
        this.physics.world.setBounds(0, 0, 800, 600);

        // Draw road/path
        this.drawPath();

        // Create home marker
        this.homeMarker = this.add.image(50, 300, 'home');
        this.add.text(50, 340, 'HOME', { fontSize: '12px', fill: '#ffffff' }).setOrigin(0.5);

        // Create destination marker
        this.destinationMarker = this.add.image(750, 300, 'destination');
        this.add.text(750, 340, 'SCHOOL', { fontSize: '12px', fill: '#ffffff' }).setOrigin(0.5);

        // Create character
        this.player = this.physics.add.sprite(50, 300, 'character');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(40, 40);

        // Create obstacles
        this.createObstacles();

        // Collision with obstacles
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);

        // Initialize AI
        this.contraryAI = new ContraryAI();

        // Setup controls
        this.setupKeyboardControls();
        this.setupVoiceControls();

        // UI Elements
        this.createUI();

        // Game state
        this.gameStarted = false;
        this.distanceTraveled = 0;
        this.commandCount = 0;
        this.lastPosition = { x: 50, y: 300 };
    }

    drawPath() {
        const graphics = this.add.graphics();
        
        // Draw road
        graphics.lineStyle(60, 0x999999, 0.5);
        graphics.beginPath();
        graphics.moveTo(0, 300);
        graphics.lineTo(800, 300);
        graphics.strokePath();
        
        // Road markings
        graphics.lineStyle(2, 0xffffff, 0.8);
        for (let x = 0; x < 800; x += 40) {
            graphics.beginPath();
            graphics.moveTo(x, 298);
            graphics.lineTo(x + 20, 298);
            graphics.strokePath();
        }
    }

    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();
        
        // Place some obstacles along the path
        const obstaclePositions = [
            { x: 200, y: 300 },
            { x: 350, y: 250 },
            { x: 500, y: 350 },
            { x: 650, y: 280 }
        ];
        
        obstaclePositions.forEach(pos => {
            const obstacle = this.obstacles.create(pos.x, pos.y, 'obstacle');
            obstacle.setTint(0xff6600);
        });
    }

    createUI() {
        // Title
        this.add.text(400, 25, '😈 CONTRARY COMPANION 😈', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Status text
        this.statusText = this.add.text(400, 550, 'Say a command to start! 🎤', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Mood indicator
        this.moodText = this.add.text(400, 60, '', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Stats
        this.commandsText = this.add.text(10, 90, 'Commands: 0', {
            fontSize: '12px',
            fill: '#ffffff'
        });

        this.distanceText = this.add.text(10, 110, 'Distance: 0m', {
            fontSize: '12px',
            fill: '#ffffff'
        });

        // Voice status
        this.voiceStatusText = this.add.text(400, 580, '🎤 Click anywhere to enable microphone', {
            fontSize: '12px',
            fill: '#ffff00'
        }).setOrigin(0.5);
    }

    setupKeyboardControls() {
        // Arrow keys as backup
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.input.keyboard.on('keydown-LEFT', () => this.giveCommand('go left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.giveCommand('go right'));
        this.input.keyboard.on('keydown-UP', () => this.giveCommand('go up'));
        this.input.keyboard.on('keydown-DOWN', () => this.giveCommand('go down'));
        this.input.keyboard.on('keydown-SPACE', () => this.giveCommand('stop'));
    }

    setupVoiceControls() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript;
                console.log('Voice detected:', command);
                this.giveCommand(command);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.voiceStatusText.setText('🎤 Error: ' + event.error);
            };

            this.recognition.onend = () => {
                // Restart if still playing
                if (this.gameStarted) {
                    this.recognition.start();
                }
            };

            // Start on click (required by browsers)
            this.input.on('pointerdown', () => {
                if (!this.gameStarted) {
                    this.recognition.start();
                    this.gameStarted = true;
                    this.voiceStatusText.setText('🎤 Listening... Speak now!');
                }
            });

            this.voiceStatusText.setText('🎤 Click to start voice control');
        } else {
            this.voiceStatusText.setText('❌ Voice not supported - Use Arrow Keys');
        }
    }

    giveCommand(command) {
        if (!command) return;
        
        this.commandCount++;
        this.commandsText.setText(`Commands: ${this.commandCount}`);
        
        // Process through AI
        const result = this.contraryAI.interpretCommand(command);
        
        // Update UI
        this.statusText.setText(`You: "${command}" → Character: "${result.action}"`);
        this.moodText.setText(result.response);
        
        // Execute action
        this.executeAction(result.action);
        
        // Show floating response
        this.showFloatingText(result.response);
    }

    executeAction(action) {
        const speed = 200;
        
        // Reset velocity
        this.player.body.setVelocity(0, 0);
        
        if (action.includes('left')) {
            this.player.body.setVelocityX(-speed);
        }
        if (action.includes('right')) {
            this.player.body.setVelocityX(speed);
        }
        if (action.includes('up')) {
            this.player.body.setVelocityY(-speed);
        }
        if (action.includes('down')) {
            this.player.body.setVelocityY(speed);
        }
        if (action.includes('stop')) {
            this.player.body.setVelocity(0, 0);
        }
        
        // Check win condition
        this.checkDestination();
    }

    showFloatingText(text) {
        const floatText = this.add.text(
            this.player.x,
            this.player.y - 30,
            text,
            {
                fontSize: '16px',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: floatText,
            y: floatText.y - 50,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => floatText.destroy()
        });
    }

    hitObstacle(player, obstacle) {
        // Bounce back
        player.body.setVelocity(
            -player.body.velocity.x * 0.5,
            -player.body.velocity.y * 0.5
        );
        
        // Flash effect
        player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            player.clearTint();
        });
        
        this.showFloatingText('Ouch! 🚧');
    }

    checkDestination() {
        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.destinationMarker.x,
            this.destinationMarker.y
        );

        // Update distance display
        this.distanceText.setText(`Distance to school: ${Math.floor(distance)}m`);

        if (distance < 40) {
            this.player.body.setVelocity(0, 0);
            this.statusText.setText('🎉 CONGRATULATIONS! You made it! 🎉');
            this.showFloatingText('Finally! 🎓');
            
            // Celebration effect
            this.cameras.main.flash(1000, 255, 255, 255);
            
            // Stop voice recognition
            if (this.recognition) {
                this.recognition.stop();
                this.gameStarted = false;
            }
        }
    }

    update() {
        // Calculate distance traveled
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            const dx = this.player.x - this.lastPosition.x;
            const dy = this.player.y - this.lastPosition.y;
            this.distanceTraveled += Math.sqrt(dx * dx + dy * dy);
            this.lastPosition = { x: this.player.x, y: this.player.y };
        }
    }
}