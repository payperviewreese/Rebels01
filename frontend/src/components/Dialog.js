import React, { useState, useEffect } from 'react';

const Dialog = ({ gameEvents }) => {
  const [visible, setVisible] = useState(false);
  const [dialog, setDialog] = useState({
    name: '',
    text: '',
    options: []
  });

  useEffect(() => {
    if (!gameEvents) return;

    const showDialog = (dialogData) => {
      setDialog(dialogData);
      setVisible(true);
    };

    const hideDialog = () => {
      setVisible(false);
    };

    // Subscribe to events
    gameEvents.on('showDialog', showDialog);
    gameEvents.on('hideDialog', hideDialog);

    // Clean up
    return () => {
      gameEvents.off('showDialog', showDialog);
      gameEvents.off('hideDialog', hideDialog);
    };
  }, [gameEvents]);

  const handleOptionClick = (option) => {
    if (window.game && window.game.scene.scenes) {
      const mainScene = window.game.scene.getScene('MainScene');
      if (mainScene) {
        mainScene.processDialogChoice(option.action, mainScene.interactableObject);
      }
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={`dialog-container ${visible ? 'active' : ''}`}>
      {dialog.name && <div className="dialog-name">{dialog.name}</div>}
      <div className="dialog-content">{dialog.text}</div>
      {dialog.options && dialog.options.length > 0 && (
        <div className="dialog-options">
          {dialog.options.map((option, index) => (
            <div 
              key={index} 
              className="dialog-option"
              onClick={() => handleOptionClick(option)}
            >
              {option.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dialog;
