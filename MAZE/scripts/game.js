/**
 * MAZE Game - Main React Component
 * A faithful digital adaptation of Christopher Manson's MAZE puzzle book
 */

const { useState, useEffect, useRef } = React;

const MAZEGame = () => {
  // Game State
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const [currentRoom, setCurrentRoom] = useState('Directions');
  const [visitedRooms, setVisitedRooms] = useState(new Set(['Directions']));
  const [moveCount, setMoveCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints] = useState(5);
  const [gameWon, setGameWon] = useState(false);
  const [showRevisitPrompt, setShowRevisitPrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Display State
  const [displayText, setDisplayText] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [validNextRooms, setValidNextRooms] = useState([]);
  const [lastMessage, setLastMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'error', 'hint', 'success'

  // Refs
  const typewriterRef = useRef(new window.TypewriterEngine({ charDelay: 40 }));
  const textViewportRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const commandInputRef = useRef(null);

  // Load game data
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const response = await fetch('assets/results.json');
        const data = await response.json();
        setGameData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  // Initialize game display when room changes or data loads
  useEffect(() => {
    if (!gameData) return;

    const displayRoom = async () => {
      const room = gameData[currentRoom];
      if (!room) return;

      setValidNextRooms(room.nextRooms || []);

      // Construct display text
      const fullText = room.paragraphs.map(p => `> ${p}`).join('\n\n');
      const textBefore = displayText;
      const newTextWithSeparator = displayText ? displayText + '\n\n' + fullText : fullText;

      // Animate the text by gradually updating state
      setIsAnimating(true);
      setIsFastForwarding(false);
      await new Promise((resolve) => {
        let charIndex = 0;

        const animateChar = () => {
          if (isFastForwarding) {
            // Skip to end immediately
            setDisplayText(newTextWithSeparator);
            setIsAnimating(false);
            resolve();
            return;
          }

          if (charIndex <= fullText.length) {
            setDisplayText(textBefore ? textBefore + '\n\n' + fullText.substring(0, charIndex) : fullText.substring(0, charIndex));
            charIndex++;
            animationTimeoutRef.current = setTimeout(animateChar, 40);
          } else {
            // Ensure final state is set
            setDisplayText(newTextWithSeparator);
            setIsAnimating(false);
            resolve();
          }
        };

        animateChar();
      });

      // Check for victory
      if (currentRoom === 'Room-45' && gameWon === false) {
        setGameWon(true);
      }
    };

    displayRoom();
  }, [currentRoom, gameData, gameWon]);

  // Auto-scroll text viewport when content changes
  useEffect(() => {
    if (textViewportRef.current) {
      // Use setTimeout to ensure scroll happens after DOM update
      setTimeout(() => {
        textViewportRef.current.scrollTop = textViewportRef.current.scrollHeight;
      }, 0);
    }
  }, [displayText]);

  // Handle splash screen interaction
  useEffect(() => {
    if (!showSplash || !gameData) return;

    const handleStart = () => {
      setShowSplash(false);
      commandInputRef.current?.focus();
    };

    window.addEventListener('keydown', handleStart);
    window.addEventListener('click', handleStart);

    return () => {
      window.removeEventListener('keydown', handleStart);
      window.removeEventListener('click', handleStart);
    };
  }, [showSplash, gameData]);

  // Handle command parsing and execution
  const executeCommand = (input) => {
    if (!gameData) return;

    const trimmed = input.trim().toUpperCase();

    if (!trimmed) {
      setCommandInput('');
      return;
    }

    // CLEAR command
    if (trimmed === 'CLEAR') {
      setDisplayText('');
      setCommandInput('');
      return;
    }

    // HELP command
    if (trimmed === 'HELP') {
      const helpText =
        'COMMANDS:\n' +
        '> GO [room-number] - Navigate to a room\n' +
        '> HINT - Get a helpful hint\n' +
        '> STATUS - Show game status\n' +
        '> CLEAR - Clear screen\n' +
        '> HELP - Show this message\n\n' +
        'Example: GO 21';
      setDisplayText(displayText ? displayText + '\n\n' + helpText : helpText);
      setCommandInput('');
      return;
    }

    // STATUS command
    if (trimmed === 'STATUS') {
      const roomsExplored = visitedRooms.size;
      const totalRooms = Object.keys(gameData).length;
      const statusText =
        `CURRENT ROOM: ${currentRoom}\n` +
        `MOVES: ${moveCount}\n` +
        `HINTS USED: ${hintsUsed}/${maxHints}\n` +
        `ROOMS EXPLORED: ${roomsExplored}/${totalRooms}`;
      setDisplayText(displayText ? displayText + '\n\n' + statusText : statusText);
      setCommandInput('');
      return;
    }

    // HINT command
    if (trimmed === 'HINT') {
      if (hintsUsed >= maxHints) {
        const msg = 'No more hints available!';
        setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
      } else {
        const msg = 'Use the HELP command to see available commands.';
        setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
        setHintsUsed(hintsUsed + 1);
      }
      setCommandInput('');
      return;
    }

    // GO command (with or without room number)
    if (trimmed === 'GO' || trimmed.startsWith('GO ')) {
      let targetRoom = '';
      
      // If bare GO with only one accessible room, navigate to it
      if (trimmed === 'GO' && validNextRooms.length === 1) {
        targetRoom = validNextRooms[0];
      } else if (trimmed.startsWith('GO ')) {
        targetRoom = trimmed.slice(3).trim();
      } else if (trimmed === 'GO') {
        const msg = 'You must specify a room. Use HELP for commands.';
        setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
        setCommandInput('');
        return;
      }

      if (!targetRoom) {
        const msg = 'You must specify a room. Use HELP for commands.';
        setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
        setCommandInput('');
        return;
      }

      const roomKey = targetRoom.length <= 2 ? `Room-${targetRoom.padStart(2, '0')}` : targetRoom;

      // Check if room exists in valid nextRooms
      if (validNextRooms.includes(roomKey)) {
        // Check if already visited (show prompt)
        if (visitedRooms.has(roomKey)) {
          setShowRevisitPrompt(true);
          setPendingNavigation(roomKey);
          setCommandInput('');
          return;
        }

        // Navigate to room
        navigateToRoom(roomKey);
      } else if (gameData[roomKey]) {
        // Room exists but not accessible from here
        const attemptedNum = targetRoom.includes('Room-') ? targetRoom.slice(5) : targetRoom;
        const msg = `There is no door to Room-${attemptedNum} from here.`;
        setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
      } else {
        // Room doesn't exist
        const msg = `'${trimmed}' is not something you can do here.`;
        setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
      }
      setCommandInput('');
      return;
    }

    // Unknown command
    const msg = `'${input.trim()}' is not something you can do here.`;
    setDisplayText(displayText ? displayText + '\n\n' + msg : msg);
    setCommandInput('');
  };

  // Navigate to a room
  const navigateToRoom = (roomKey) => {
    // Update game state
    const newVisited = new Set(visitedRooms);
    newVisited.add(roomKey);
    setVisitedRooms(newVisited);
    setCurrentRoom(roomKey);
    setMoveCount(moveCount + 1);

    // Clear state
    setShowRevisitPrompt(false);
    setPendingNavigation(null);
  };

  // Handle door button click
  const handleDoorClick = (roomKey) => {
    if (visitedRooms.has(roomKey)) {
      setShowRevisitPrompt(true);
      setPendingNavigation(roomKey);
    } else {
      navigateToRoom(roomKey);
    }
  };

  // Handle keyboard input
  const handleKeyDown = (e) => {
    // Fast-forward animation with Shift key
    if (e.shiftKey && isAnimating) {
      setIsFastForwarding(true);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Handle revisit prompt YES/NO
      if (showRevisitPrompt) {
        if (commandInput.trim().toUpperCase() === 'YES') {
          confirmRevisit();
          setCommandInput('');
        } else if (commandInput.trim().toUpperCase() === 'NO') {
          setShowRevisitPrompt(false);
          setPendingNavigation(null);
          setCommandInput('');
        }
      } else {
        executeCommand(commandInput);
      }
    } else if (e.key === ' ' && isAnimating) {
      // Spacebar skips animation entirely
      e.preventDefault();
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setIsFastForwarding(true);
    }
  };

  // Confirm revisit navigation
  const confirmRevisit = () => {
    if (pendingNavigation) {
      navigateToRoom(pendingNavigation);
    }
  };

  // Victory screen
  if (gameWon) {
    return (
      <div className="terminal-container">
        <div className="victory-screen">
          <h1>YOU HAVE REACHED THE CENTER</h1>
          <p>Congratulations! You have solved the MAZE.</p>

          <div className="stats">
            <div className="stat-item">
              Moves: <span className="stat-value">{moveCount}</span>
            </div>
            <div className="stat-item">
              Hints Used: <span className="stat-value">{hintsUsed}</span>
            </div>
            <div className="stat-item">
              Rooms Explored: <span className="stat-value">{visitedRooms.size}</span>
            </div>
          </div>

          <p style={{ marginTop: '40px', fontSize: 'clamp(12px, 1.8vw, 16px)', color: '#00DD00' }}>
            Now find the riddle hidden in Room 45...
          </p>

          <button
            className="command-button"
            onClick={() => {
              setGameWon(false);
              setCurrentRoom('Directions');
              setVisitedRooms(new Set(['Directions']));
              setMoveCount(0);
              setHintsUsed(0);
              setDisplayText('');
            }}
            style={{ marginTop: '30px' }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="terminal-container">
        <div className="loading">Loading MAZE...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="terminal-container">
        <div style={{ color: '#FF0000' }}>ERROR: {error}</div>
      </div>
    );
  }

  if (!gameData) {
    return null;
  }

  const currentRoomData = gameData[currentRoom];
  const isDead = !currentRoomData.nextRooms || currentRoomData.nextRooms.length === 0;

  // Splash Screen
  if (showSplash) {
    return (
      <div className="terminal-container">
        <div className="splash-screen">
          <div className="splash-content">
            <h1>MAZE</h1>
            <p>A Puzzle Game</p>
            <p style={{ marginTop: '40px', fontSize: '14px', lineHeight: '1.6' }}>
              An interactive digital adaptation of<br/>
              Christopher Manson's legendary MAZE puzzle book
            </p>
            <p style={{ marginTop: '50px', fontSize: '12px', opacity: '0.8' }}>
              Press any key or click to begin...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Game UI
  return (
    <div className="terminal-container">
      {/* Panels wrapper for 50-50 split */}
      <div className="panels-wrapper">
        {/* Image Viewport - Left 50% */}
        <div className="image-viewport">
          <img
            src={`assets/${currentRoom}.jpg`}
            alt={`MAZE: ${currentRoom}`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Console Container - Right 50% */}
        <div className="console-container">
          {/* Text Viewport */}
          <div className="text-viewport" ref={textViewportRef}>
            {displayText}
          </div>
        </div>
      </div>

      {/* Command Section - Full width at bottom */}
      <div className="command-section">
        {/* Revisit Confirmation */}
        {showRevisitPrompt && (
          <div
            style={{
              border: '1px solid #00FF00',
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: '#001100'
            }}
          >
            <div style={{ marginBottom: '8px' }}>You have already visited this room. Enter anyway? (YES/NO)</div>
          </div>
        )}

        {/* Command Input */}
        <div className="command-input-area">
          <span className="command-prompt">&gt;</span>
          <input
            ref={commandInputRef}
            type="text"
            className="command-input"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

// Render app
console.log('MAZE Game Loading - NEW LAYOUT VERSION');
ReactDOM.render(<MAZEGame />, document.getElementById('root'));
