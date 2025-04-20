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
    
    // Set player size for better collision
    this.player.setSize(24, 24);
    this.player.setDisplaySize(32, 32);
    
    // Set up physics
    this.physics.add.collider(this.player, this.buildingColliders);
    
    // Add debug text for player position
    this.playerPosText = this.add.text(10, 50, 'Player: 0, 0', { 
      font: '12px Arial', 
      fill: '#ffffff',
      backgroundColor: '#000000' 
    });
    this.playerPosText.setScrollFactor(0); // Fix to camera
    
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
      
      // Special feedback based on item
      if (this.interactableObject.name === 'Bolt Cutters') {
        if (window.gameEvents) {
          setTimeout(() => {
            window.gameEvents.emit('showDialog', {
              name: "Jamie",
              text: "These bolt cutters will help me access areas blocked by chains. The pharmacy's gate was chained shut - I should try there.",
              options: [
                { text: "Continue", action: "continue" }
              ]
            });
          }, 500);
        }
      } else if (this.interactableObject.name === 'Baseball Bat') {
        if (window.gameEvents) {
          setTimeout(() => {
            window.gameEvents.emit('showDialog', {
              name: "Jamie",
              text: "This bat should help me fight off zombies. I'll need to get close though.",
              options: [
                { text: "Continue", action: "continue" }
              ]
            });
          }, 500);
        }
      }
      
      this.interactableObject.destroy();
      this.interactableObject = null;
    } else if (choice === 'enter') {
      // Handle entering building based on which building
      if (object.name === 'Pharmacy') {
        if (window.gameEvents) {
          window.gameEvents.emit('showDialog', {
            name: "Jamie",
            text: "The pharmacy is a mess. Shelves are toppled, and medications are scattered everywhere. I should look for any useful supplies.",
            options: [
              { text: "Search for medicine", action: "search_pharmacy" },
              { text: "Leave", action: "exit_building" }
            ]
          });
        }
      } else if (object.name === 'Hardware Store') {
        if (window.gameEvents) {
          window.gameEvents.emit('showDialog', {
            name: "Jamie",
            text: "Tools and equipment are still on the shelves. This place hasn't been looted much yet. I might find something useful for defense or breaking into locked areas.",
            options: [
              { text: "Search for tools", action: "search_hardware" },
              { text: "Leave", action: "exit_building" }
            ]
          });
        }
      } else if (object.name === 'School') {
        if (window.gameEvents) {
          window.gameEvents.emit('showDialog', {
            name: "Jamie",
            text: "The school hallways are dark and silent. There are signs of evacuation, but no people. I hear strange noises coming from the gymnasium.",
            options: [
              { text: "Check classrooms", action: "search_school" },
              { text: "Head to gymnasium", action: "school_gym" },
              { text: "Leave", action: "exit_building" }
            ]
          });
        }
      } else {
        // Generic building entry
        if (window.gameEvents) {
          window.gameEvents.emit('showDialog', {
            name: "Jamie",
            text: `You enter the ${object.name}. The inside is dark and eerie.`,
            options: [
              { text: "Continue exploring", action: "continue" },
              { text: "Leave", action: "exit_building" }
            ]
          });
        }
      }
    } else if (choice === 'search_pharmacy') {
      // Pharmacy search logic
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "After searching through the mess, I find some useful medications. There's also a voice message playing on repeat from the pharmacy phone.",
          options: [
            { text: "Take medications", action: "take_meds" },
            { text: "Listen to message", action: "listen_message" }
          ]
        });
      }
    } else if (choice === 'listen_message') {
      // Story progression - Nicole's message
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Voice Message",
          text: "This is Nicole calling from the school. My daughter Charlie is sick and needs medication. If anyone is at the pharmacy, please bring antibiotics to the school. We're hiding in the science lab. Please hurry, she's getting worse...",
          options: [
            { text: "I should head to the school", action: "continue" }
          ]
        });
      }
    } else if (choice === 'take_meds') {
      // Add antibiotics to inventory
      if (window.gameEvents) {
        window.gameEvents.emit('addToInventory', {
          name: "Antibiotics",
          description: "Medicine that could help someone who is sick.",
          image: "medkit"
        });
        
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "These antibiotics might be what Nicole needs for her daughter. I should head to the school and look for them in the science lab.",
          options: [
            { text: "Continue", action: "continue" }
          ]
        });
      }
    } else if (choice === 'search_hardware') {
      // Hardware store search
      if (window.gameEvents) {
        window.gameEvents.emit('showDialog', {
          name: "Jamie",
          text: "I find a cabinet that seems to contain high-value tools, but it's locked. There might be a key somewhere.",
          options: [
            { text: "Look for key", action: "search_key" },
            { text: "Try another area", action: "continue" }
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
      
      // Also force update the position text
      if (this.playerPosText) {
        this.playerPosText.setText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`);
        this.playerPosText.setVisible(true);
      }
    }
    
    // Check for interactable objects
    this.checkInteractables();
    
    // Check for interaction key press
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.interactableObject) {
      this.handleInteraction(this.interactableObject);
    }
  }

  handlePlayerMovement() {
    // Reset velocity
    this.player.setVelocity(0);
    
    const speed = 160;
    
    // Handle movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // Update debug text
    if (this.playerPosText) {
      this.playerPosText.setText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`);
    }
  }

  checkInteractables() {
    let foundInteractable = false;
    
    // Remove old highlight if it exists
    if (this.interactHighlight) {
      this.interactHighlight.destroy();
      this.interactHighlight = null;
    }
    
    // Check each interactable
    this.interactables.getChildren().forEach(object => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        object.x, object.y
      );
      
      // If player is close enough (increased range for easier interaction)
      if (distance < 70) {
        this.interactableObject = object;
        foundInteractable = true;
        
        // Add visual highlight around interactable object
        this.interactHighlight = this.add.graphics();
        this.interactHighlight.lineStyle(2, 0xffff00);
        this.interactHighlight.strokeCircle(object.x, object.y, 25);
        
        // Add floating text "Press E" above object
        if (!this.interactText) {
          this.interactText = this.add.text(object.x, object.y - 30, 'Press E', {
            font: '14px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
          }).setOrigin(0.5);
        } else {
          this.interactText.setPosition(object.x, object.y - 30);
          this.interactText.setVisible(true);
        }
        
        // Show interaction prompt in UI
        if (window.gameEvents) {
          window.gameEvents.emit('showInteractPrompt', { name: object.name });
        }
      }
    });
    
    // If no interactable found nearby, clear the current one
    if (!foundInteractable) {
      if (this.interactableObject) {
        this.interactableObject = null;
        if (window.gameEvents) {
          window.gameEvents.emit('hideInteractPrompt');
        }
      }
      
      // Hide the text prompt
      if (this.interactText) {
        this.interactText.setVisible(false);
      }
    }
    
    // Check building doors too
    this.checkBuildingInteractions();
  }
  
  checkBuildingInteractions() {
    // Here we would check for building door interactions
    // For now, we'll just place some visible indicators near the doors
    
    // This is just for demonstration - in a full implementation
    // we would have proper door zones to check against
    const doorLocations = [
      { x: 250, y: 100, name: 'Pharmacy' },      // Pharmacy door
      { x: 675, y: 100, name: 'Hardware Store' }, // Hardware Store door
      { x: 300, y: 400, name: 'School' },        // School door
      { x: 775, y: 450, name: 'Shopping Center' } // Shopping Center door
    ];
    
    let nearDoor = false;
    
    doorLocations.forEach(door => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        door.x, door.y
      );
      
      if (distance < 70) {
        nearDoor = true;
        
        // Create a temporary door object for interaction
        const doorObj = { type: 'door', name: door.name };
        this.interactableObject = doorObj;
        
        // Add visual highlight
        if (this.interactHighlight) {
          this.interactHighlight.destroy();
        }
        
        this.interactHighlight = this.add.graphics();
        this.interactHighlight.lineStyle(2, 0x00ffff);
        this.interactHighlight.strokeRect(door.x - 20, door.y - 20, 40, 40);
        
        // Add floating text "Press E to enter" above door
        if (!this.interactText) {
          this.interactText = this.add.text(door.x, door.y - 30, 'Press E to enter', {
            font: '14px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
          }).setOrigin(0.5);
        } else {
          this.interactText.setPosition(door.x, door.y - 30);
          this.interactText.setText('Press E to enter');
          this.interactText.setVisible(true);
        }
        
        // Show interaction prompt
        if (window.gameEvents) {
          window.gameEvents.emit('showInteractPrompt', { name: door.name + ' entrance' });
        }
      }
    });
    
    // If we were near a door but not an item, and now we're not near anything
    if (!nearDoor && !this.interactableObject && this.interactText) {
      this.interactText.setVisible(false);
    }
  }
}

export default MainScene;
