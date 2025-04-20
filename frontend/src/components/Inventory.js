import React, { useState, useEffect } from 'react';

const Inventory = ({ gameEvents }) => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const MAX_INVENTORY_SIZE = 10;

  useEffect(() => {
    if (!gameEvents) return;

    const showInventory = () => {
      setVisible(true);
    };

    const hideInventory = () => {
      setVisible(false);
    };

    const addItem = (item) => {
      if (items.length < MAX_INVENTORY_SIZE) {
        setItems(prevItems => [...prevItems, item]);
      } else {
        // Inventory full - show message
        if (window.gameEvents) {
          window.gameEvents.emit('showDialog', {
            name: "Jamie",
            text: "My inventory is full. I need to drop something first.",
            options: [
              { text: "OK", action: "continue" }
            ]
          });
        }
      }
    };

    // Subscribe to events
    gameEvents.on('showInventory', showInventory);
    gameEvents.on('hideInventory', hideInventory);
    gameEvents.on('addToInventory', addItem);

    // Clean up
    return () => {
      gameEvents.off('showInventory', showInventory);
      gameEvents.off('hideInventory', hideInventory);
      gameEvents.off('addToInventory', addItem);
    };
  }, [gameEvents, items]);

  const toggleInventory = () => {
    setVisible(!visible);
  };

  const handleItemClick = (item, index) => {
    setSelectedItem({ ...item, index });
    
    // Show item options
    if (window.gameEvents) {
      window.gameEvents.emit('showDialog', {
        name: "Item",
        text: `${item.name}: ${item.description}`,
        options: [
          { text: "Use", action: "use" },
          { text: "Drop", action: "drop" },
          { text: "Cancel", action: "cancel" }
        ]
      });
    }
  };

  const handleItemAction = (action) => {
    if (!selectedItem) return;
    
    if (action === 'drop') {
      // Remove item from inventory
      setItems(prevItems => prevItems.filter((_, i) => i !== selectedItem.index));
      setSelectedItem(null);
    } else if (action === 'use') {
      // Handle item usage based on item type
      if (selectedItem.name === 'Medkit') {
        // Heal player
        if (window.game && window.game.scene.scenes) {
          const mainScene = window.game.scene.getScene('MainScene');
          if (mainScene) {
            mainScene.health = Math.min(100, mainScene.health + 50);
            if (window.gameEvents) {
              window.gameEvents.emit('updateHealth', { health: mainScene.health });
            }
          }
        }
        
        // Remove used medkit
        setItems(prevItems => prevItems.filter((_, i) => i !== selectedItem.index));
        setSelectedItem(null);
        
        // Show message
        if (window.gameEvents) {
          window.gameEvents.emit('showDialog', {
            name: "Jamie",
            text: "I've used the medkit. I feel better now.",
            options: [
              { text: "OK", action: "continue" }
            ]
          });
        }
      }
    }
  };

  // Generate empty slots to fill grid
  const emptySlots = Array(MAX_INVENTORY_SIZE - items.length).fill(null);

  return (
    <>
      <button 
        className="inventory-button"
        onClick={toggleInventory}
      >
        Inventory
      </button>
      
      <div className={`inventory-panel ${visible ? 'active' : ''}`}>
        <h2>Inventory</h2>
        <div className="inventory-grid">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="inventory-slot"
              onClick={() => handleItemClick(item, index)}
            >
              <div className="item-image">
                {/* Placeholder for item image */}
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: '#555', 
                    borderRadius: '4px' 
                  }}
                />
              </div>
              <div className="item-name">{item.name}</div>
            </div>
          ))}
          
          {emptySlots.map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="inventory-slot empty"
            />
          ))}
        </div>
        <button 
          className="inventory-close"
          onClick={() => setVisible(false)}
        >
          ✕
        </button>
      </div>
    </>
  );
};

export default Inventory;
