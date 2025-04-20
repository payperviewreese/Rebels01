import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.player = null;
    this.cursors = null;
    this.isInteracting = false;
    this.interactableObject = null;
    this.interactKey = null;
    this.health = 100;
  }

  create() {
    // Create a simple map
    this.createMap();
    
    // Add player
    this.createPlayer();
    
    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    // Set up camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    
    // Add some interactable objects
    this.createInteractables();

    // Notify React component that the game has started
    if (window.gameEvents) {
      window.gameEvents.emit('gameStarted', { health: this.health });
    }

    // Set up interaction event handler
    this.input.keyboard.on('keydown-E', () => {
      if (this.interactableObject) {
        this.handleInteraction(this.interactableObject);
      }
    });
  }

  createMap() {
    // For now, create a simple background with graphics
    const graphics = this.add.graphics();
    
    // Draw background (city streets)
    graphics.fillStyle(0x222222); // Dark gray for streets
    graphics.fillRect(0, 0, 3000, 3000);
    
    // Add collisions for buildings
    this.buildingColliders = this.physics.add.staticGroup();
    
    // Draw some buildings
    this.createBuilding(graphics, 100, 100, 300, 200, 0x555555, 'Pharmacy');
    this.createBuilding(graphics, 500, 100, 350, 250, 0x777777, 'Hardware Store');
    this.createBuilding(graphics, 100, 400, 400, 300, 0x666666, 'School');
    this.createBuilding(graphics, 600, 450, 350, 350, 0x888888, 'Shopping Center');
    this.createBuilding(graphics, 1000, 200, 300, 400, 0x999999, 'Zoo');
    this.createBuilding(graphics, 1100, 700, 250, 150, 0x444444, 'Pier');
    
    // World bounds
    this.physics.world.setBounds(0, 0, 3000, 3000);
  }

  createBuilding(graphics, x, y, width, height, color, name) {
    // Draw the building
    graphics.fillStyle(color);
    graphics.fillRect(x, y, width, height);
    
    // Add border
    graphics.lineStyle(2, 0x000000);
    graphics.strokeRect(x, y, width, height);
    
    // Add building name
    this.add.text(x + width/2, y + height/2, name, {
      font: '12px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Add collision
    const building = this.buildingColliders.create(x + width/2, y + height/2, '').setVisible(false);
    building.setSize(width, height);
    building.name = name;
    
    // Add door (entry point)
    let doorX, doorY;
    
    // Position door based on building position
    if (y > 300) {
      // Door on the top
      doorX = x + width/2;
      doorY = y;
    } else {
      // Door on the bottom
      doorX = x + width/2;
      doorY = y + height;
    }
    
    // Add door marker
    graphics.fillStyle(0xffff00);
    graphics.fillRect(doorX - 10, doorY - 5, 20, 10);
    
    // Add interactable door zone
    const doorZone = this.add.rectangle(doorX, doorY, 40, 40);
    this.physics.add.existing(doorZone, true);
    doorZone.name = name;
    doorZone.type = 'door';
    
    return { building, doorZone };
  }

  createPlayer() {
    // Add player sprite - placing closer to center of screen
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // Make player more visible for debugging
    this.player.setTint(0x00ff00);
    
    // Set up physics
    this.physics.add.collider(this.player, this.buildingColliders);
    
    // Set initial animation (with error handling)
    try {
      this.player.anims.play('player_idle_down');
    } catch (error) {
      console.error("Error playing animation:", error);
      // Fallback to simple rectangle if animation fails
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00);
      graphics.fillRect(this.player.x - 16, this.player.y - 16, 32, 32);
    }
    
    console.log("Player created at", this.player.x, this.player.y);
  }

  createInteractables() {
    // Create interactable objects
    this.interactables = this.physics.add.group();
    
    // Add a key item
    const key = this.physics.add.sprite(300, 350, 'key');
    key.name = 'Key';
    key.description = 'A small key that might open something.';
    this.interactables.add(key);
    
    // Add bolt cutters
    const boltCutters = this.physics.add.sprite(600, 350, 'boltCutters');
    boltCutters.name = 'Bolt Cutters';
    boltCutters.description = 'Heavy-duty bolt cutters. Could cut through chains.';
    this.interactables.add(boltCutters);
    
    // Add a medkit
    const medkit = this.physics.add.sprite(800, 550, 'medkit');
    medkit.name = 'Medkit';
    medkit.description = 'A first aid kit that can restore health.';
    this.interactables.add(medkit);
    
    // Add a weapon
    const bat = this.physics.add.sprite(1000, 650, 'bat');
    bat.name = 'Baseball Bat';
    bat.description = 'A sturdy wooden baseball bat. Good for self-defense.';
    this.interactables.add(bat);
    
    // Set up overlap detection for interactables
    this.physics.add.overlap(this.player, this.interactables, this.handleOverlap, null, this);
  }

  handleOverlap(player, object) {
    // Mark object as interactable
    this.interactableObject = object;
    
    // Show interaction prompt
    if (window.gameEvents) {
      window.gameEvents.emit('showInteractPrompt', { name: object.name });
    }
  }

  handleInteraction(object) {
    if (object.type === 'door') {
      // Handle entering a building
      let dialogText = `Entering ${object.name}...`;
      let options = [
        { text: "Go inside", action: "enter" },
        { text: "Not now", action: "cancel" }
      ];
      
      // Add custom dialogue based on location
      if (object.name === 'Pharmacy') {
        dialogText = "The pharmacy looks ransacked but might still have medical supplies. I should check inside.";
      } else if (object.name === 'Hardware Store') {
        dialogText = "The hardware store could have tools I need. Might find bolt cutters here.";
      } else if (object.name === 'School') {
        dialogText = "The school might be a good place to find survivors. Could be dangerous though.";
      } else if (object.name === 'Shopping Center') {
        dialogText = "The shopping center is large and might have food and supplies. But there could be many zombies inside.";
      }
      
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: dialogText,
          options: options
        });
      }
    } else if (object.name === 'Key') {
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "A small key... looks like it might open a locker or small cabinet. Could be useful.",
          options: [
            { text: "Take it", action: "pickup" },
            { text: "Leave it", action: "cancel" }
          ]
        });
      }
    } else if (object.name === 'Bolt Cutters') {
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "Heavy-duty bolt cutters. These could cut through chains and padlocks. I might need them to access the pharmacy.",
          options: [
            { text: "Take it", action: "pickup" },
            { text: "Leave it", action: "cancel" }
          ]
        });
      }
    } else if (object.name === 'Medkit') {
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "A first aid kit. Could be a lifesaver if I get injured. I should take it.",
          options: [
            { text: "Take it", action: "pickup" },
            { text: "Leave it", action: "cancel" }
          ]
        });
      }
    } else if (object.name === 'Baseball Bat') {
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "A sturdy wooden baseball bat. Not the best weapon, but it could keep zombies at bay.",
          options: [
            { text: "Take it", action: "pickup" },
            { text: "Leave it", action: "cancel" }
          ]
        });
      }
    } else {
      // Generic handler for other items
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: `Found ${object.name}: ${object.description}`,
          options: [
            { text: "Take it", action: "pickup" },
            { text: "Leave it", action: "cancel" }
          ]
        });
      }
    }
  }

  processDialogChoice(choice, object) {
    if (choice === 'pickup') {
      // Add to inventory and remove from world
      if (window.gameEvents) {
        window.gameEvents.emit('addToInventory', {
          name: this.interactableObject.name,
          description: this.interactableObject.description,
          image: this.interactableObject.texture.key
        });
      }
      this.interactableObject.destroy();
      this.interactableObject = null;
    } else if (choice === 'enter') {
      // Handle entering building
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: `You enter the ${object.name}. The inside is dark and eerie.`,
          options: [
            { text: "Continue exploring", action: "continue" }
          ]
        });
      }
    }
  }

  update() {
    if (!this.player) {
      console.log("Player reference is missing in update!");
      return;
    }
    
    // Store previous position for change detection
    const prevX = this.player.x;
    const prevY = this.player.y;
    
    // Handle player movement
    this.handlePlayerMovement();
    
    // If player position changed, emit event for UI
    if (prevX !== this.player.x || prevY !== this.player.y) {
      if (window.gameEvents) {
        window.gameEvents.emit('playerMove', {
          x: this.player.x,
          y: this.player.y
        });
      }
    }
    
    // Check for interactable objects
    this.checkInteractables();
  }

  handlePlayerMovement() {
    // Reset velocity
    this.player.setVelocity(0);
    
    const speed = 160;
    
    // Handle movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('player_walk_left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('player_walk_right', true);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.player.anims.play('player_walk_up', true);
      }
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.player.anims.play('player_walk_down', true);
      }
    }
    
    // Handle idle animations
    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      const currentAnim = this.player.anims.currentAnim;
      if (currentAnim) {
        if (currentAnim.key === 'player_walk_left') {
          this.player.anims.play('player_idle_left');
        } else if (currentAnim.key === 'player_walk_right') {
          this.player.anims.play('player_idle_right');
        } else if (currentAnim.key === 'player_walk_up') {
          this.player.anims.play('player_idle_up');
        } else if (currentAnim.key === 'player_walk_down') {
          this.player.anims.play('player_idle_down');
        }
      }
    }
  }

  checkInteractables() {
    let foundInteractable = false;
    
    // Check each interactable
    this.interactables.getChildren().forEach(object => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        object.x, object.y
      );
      
      // If player is close enough
      if (distance < 50) {
        this.interactableObject = object;
        foundInteractable = true;
        
        // Show interaction prompt
        if (window.gameEvents) {
          window.gameEvents.emit('showInteractPrompt', { name: object.name });
        }
      }
    });
    
    // If no interactable found nearby, clear the current one
    if (!foundInteractable && this.interactableObject) {
      this.interactableObject = null;
      if (window.gameEvents) {
        window.gameEvents.emit('hideInteractPrompt');
      }
    }
  }
}

export default MainScene;
