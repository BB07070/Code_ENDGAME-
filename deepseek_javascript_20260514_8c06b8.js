export class ContraryAI {
    constructor() {
        this.contraryLevel = 0.7; // 70% chance to disobey
        this.mood = 'playful';
        this.frustrationLevel = 0;
        
        // Direction opposites
        this.opposites = {
            'left': 'right',
            'right': 'left',
            'up': 'down',
            'down': 'up'
        };
        
        // Character responses
        this.responses = [
            "Nope! I'll go MY way! 😜",
            "You're not my boss! 😤",
            "I know a better path! 🌟",
            "Make me! 😈",
            "How about... NO! 🙅",
            "Trust me, I got this! 👍",
            "I do what I want! 💪",
            "Let's take the scenic route! 🌈"
        ];
        
        // Funny misinterpretations
        this.misinterpretations = [
            "while dancing 💃",
            "but backwards 🔄",
            "in slow motion 🐌",
            "like a ninja 🥷",
            "with style ✨",
            "on one foot 🦶",
            "while spinning 🌀",
            "like a crab 🦀"
        ];
    }

    interpretCommand(command) {
        command = command.toLowerCase().trim();
        console.log('Original command:', command);
        
        // Extract direction
        let direction = this.extractDirection(command);
        
        if (direction === 'unknown') {
            return { action: 'confused', response: "I have no idea what you want! 🤷" };
        }
        
        // Decide to obey or disobey
        const willObey = Math.random() > this.contraryLevel;
        
        let finalAction;
        let response;
        
        if (willObey) {
            finalAction = `go ${direction}`;
            response = "Fine, I'll listen this time... 😒";
            this.frustrationLevel = Math.max(0, this.frustrationLevel - 0.1);
        } else {
            // Do the opposite
            const oppositeDirection = this.invertDirection(direction);
            
            // Sometimes add a funny twist
            if (Math.random() < 0.3) {
                const twist = this.misinterpretations[
                    Math.floor(Math.random() * this.misinterpretations.length)
                ];
                finalAction = `go ${oppositeDirection} ${twist}`;
            } else {
                finalAction = `go ${oppositeDirection}`;
            }
            
            response = this.responses[
                Math.floor(Math.random() * this.responses.length)
            ];
            this.frustrationLevel = Math.min(1, this.frustrationLevel + 0.1);
        }
        
        // Adjust contrary level based on frustration
        this.contraryLevel = 0.5 + (this.frustrationLevel * 0.4);
        
        return {
            action: finalAction,
            response: response,
            originalCommand: command,
            contraryLevel: this.contraryLevel
        };
    }

    extractDirection(command) {
        if (command.includes('left')) return 'left';
        if (command.includes('right')) return 'right';
        if (command.includes('up')) return 'up';
        if (command.includes('down')) return 'down';
        return 'unknown';
    }

    invertDirection(direction) {
        return this.opposites[direction] || direction;
    }

    getMood() {
        const moods = {
            high: { text: 'Very Contrary 😈', color: '#ff0000' },
            medium: { text: 'Somewhat Cooperative 🤔', color: '#ffaa00' },
            low: { text: 'Mostly Obedient 😊', color: '#00ff00' }
        };
        
        if (this.contraryLevel > 0.8) return moods.high;
        if (this.contraryLevel > 0.5) return moods.medium;
        return moods.low;
    }
}