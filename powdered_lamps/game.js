class Game {
  constructor(savedState = null) {
    // Initialize with saved state if provided
    this.lamps = savedState ? savedState.lamps : 0;
    this.requiredLamps = 9;
    this.inventory = savedState ? {...savedState.inventory} : {
      potion: 0,
      cross: 0,
      powder: 0,
      cheese: 0,
      'angel-statue': 0
    };
    this.selectedItem = null;
    this.doorPosition = {
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 140)
    };
    this.isDead = false;
    this.gameLoopRunning = false; // Start paused
    this.isInvertedMode = false;
    this.angelsSpawned = 0;
    this.isHiding = false;
    this.hasAngelStatue = false;
    this.angelStatueTimer = 60000; // 60 seconds protection
    this.lastJumpscareTime = 0;
    this.isSleeping = false;
    this.loveDemonTimer = 0;
    this.requiredLoveTime = 4000; // 4 seconds
    this.isNearLoveDemon = false;
    this.loveDemonAngry = false;
    this.lastLoveDemonText = '';
    
    this.room = document.getElementById('room');
    this.lampCounter = document.getElementById('lamp-counter');
    this.gameOver = document.getElementById('game-over');
    this.victory = document.getElementById('victory');
    this.darknessOverlay = document.getElementById('darkness-overlay');
    this.respawnScreen = document.getElementById('respawn-screen');
    
    this.player = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      speed: 5
    };
    
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false
    };

    this.playerElement = document.createElement('div');
    this.playerElement.className = 'player';
    this.room.appendChild(this.playerElement);
    
    this.isInVent = false;
    this.rats = [];
    this.health = 100;
    this.healthBar = document.getElementById('health-bar');
    this.updateHealthBar();
    
    this.visitedRooms = new Set(); // Track visited rooms
    this.currentRoomId = 0;
    
    this.lastRoomTransition = Date.now(); // Add cooldown for room transitions
    this.lastDamageTime = 0; // Add cooldown for damage
    this.damageImmunityTime = 500; // 500ms immunity after taking damage
    this.roomTransitionCooldown = 1000; // 1 second cooldown between room transitions
    
    this.insanityLevel = 0;
    this.maxInsanity = 100;
    this.lastHallucination = 0;
    this.hallucinationCooldown = 5000;
    this.insanitySound = new Audio('void_2.mp3');
    this.doorBangSound = new Audio('konkonse.mp3');
    this.doorBangSound.volume = 0.5;
    this.insanitySound.volume = 0.3;
    this.isPlayingInsanitySound = false;
    this.doorBangTimeout = null;
    this.lastDoorBang = 0;
    this.setupRoom();
    this.setupEventListeners();
    this.updateInventoryDisplay();
    this.updatePlayerPosition();
    this.setupKeyControls();
    this.setupEscMenu();
    
    // Add damage sound
    this.damageSound = new Audio('data:audio/wav;base64,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');

    // Add guiding light element
    this.guidingLight = document.getElementById('guiding-light');
    this.updateGuidingLight();

    // Add sticky note close functionality
    const closeSticky = document.querySelector('.close-sticky');
    if (closeSticky) {
      closeSticky.addEventListener('click', () => {
        document.getElementById('sticky-note').style.display = 'none';
      });
    }
    
    this.isPlayingChess = false;
    this.chessSequence = [];
    this.playerSequence = [];
    this.chessRound = 0;
    this.maxChessRounds = 3;
  }

  setupRoom() {
    if (this.isDead) return;

    // Get room element and verify it exists
    const room = document.getElementById('room');
    if (!room) {
      console.error('Room element not found');
      return;
    }

    // Clear existing room elements and rats safely
    const existingElements = document.querySelectorAll('.table, .vent, .plush, .demon, .lamp, .rat, .angel, .darkness-orb, .dark-demon, .divine-particle, .closet, .shadow-demon, .ghost, .cheese, .bed, .sleep-paralysis-demon, .angel-statue, .wall, .floor, .love-demon');
    existingElements.forEach(el => el.remove());
    this.rats = [];

    // Add walls and floor
    this.createWalls();

    // Place door at fixed position if it exists
    const door = document.getElementById('door');
    if (door && this.doorPosition) {
      door.style.left = `${this.doorPosition.x}px`;
      door.style.top = `${this.doorPosition.y}px`;
    }

    if (this.isInVent) {
      room.classList.add('vent-walls');
      this.setupVentInterior();
    } else {
      room.classList.remove('vent-walls');
      // Normal room setup
      this.createVent();
      if (Math.random() < 0.9) this.createTable();
      
      // Add plushies with higher spawn rate (40% chance), but not in first room
      if (Math.random() < 0.4 && this.currentRoomId !== 0) {
        this.createPlush();
      }
      
      // Add angel statue to rooms after the first one
      if (this.currentRoomId !== 0) {
        this.createAngelStatue();
      }
      
      // Demon spawn chance decreases with more lamps, but not in first room
      if (this.currentRoomId !== 0) {
        const demonSpawnChance = this.lamps >= 2 ? 0.15 : 0.3;
        if (Math.random() < demonSpawnChance) {
          this.createDemon();
        }
      }
      
      // Add lamp with normal chance even in first room
      if (Math.random() < 0.4) {
        this.createLamp();
      }
      
      // Add closets after first room
      if (!this.isInVent && Math.random() < 0.7 && this.currentRoomId !== 0) {
        this.createCloset();
      }

      // Add various demon types after first room
      if (this.currentRoomId !== 0) {
        if (Math.random() < 0.2) {
          this.createShadowDemon();
        }

        if (Math.random() < 0.15) {
          this.createGhost();
        }
        
        // Increased spawn rate to 80% for love demon after first room
        if (Math.random() < 0.8 && this.currentRoomId !== 0) {
          this.createLoveDemon();
        }
      }

      // Chance for cheese item after first room
      if (Math.random() < 0.2 && this.currentRoomId !== 0) {
        this.createCheeseItem();
      }
      
      // Add bed to each room except first one
      if (!this.isInVent && this.currentRoomId !== 0) {
        this.createBed();
      }
    }
    
    // Add door banging for rooms after first room if no demons present
    if (this.currentRoomId !== 0) {
      const hasDemons = document.querySelectorAll('.demon, .dark-demon, .shadow-demon, .ghost, .love-demon').length > 0;
      if (!hasDemons) {
        this.startDoorBanging();
      }
    }
  }

  setupVentInterior() {
    // Change room appearance for vent
    this.room.style.backgroundColor = '#111';
    
    // Create more rats in vents
    for (let i = 0; i < 7; i++) { 
      this.createRat();
    }

    // Create vent exit
    const ventExit = document.createElement('div');
    ventExit.className = 'vent-exit';
    ventExit.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    ventExit.style.top = `${Math.random() * (window.innerHeight - 60)}px`;
    this.room.appendChild(ventExit);
  }

  createRat() {
    const rat = document.createElement('div');
    rat.className = 'rat';
    rat.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    rat.style.top = `${Math.random() * (window.innerHeight - 30)}px`;
    
    // Add chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.className = 'rat-chat';
    chatBubble.textContent = 'IM RAT.';
    rat.appendChild(chatBubble);
    
    this.room.appendChild(rat);
    
    this.rats.push({
      element: rat,
      x: parseInt(rat.style.left),
      y: parseInt(rat.style.top),
      direction: Math.random() * Math.PI * 2
    });
    
    this.moveRat(this.rats[this.rats.length - 1]);
  }

  moveRat(rat) {
    if (this.isDead || !this.isInVent) return;

    const speed = 4; 
    
    // Change direction more frequently and track player
    if (Math.random() < 0.05) { 
      // Calculate angle to player for smarter rat movement
      const angleToPlayer = Math.atan2(this.player.y - rat.y, this.player.x - rat.x);
      // 70% chance to move toward player, 30% chance for random movement
      rat.direction = Math.random() < 0.7 ? angleToPlayer : Math.random() * Math.PI * 2;
    }
    
    // Move rat
    rat.x += Math.cos(rat.direction) * speed;
    rat.y += Math.sin(rat.direction) * speed;
    
    // Bounce off walls
    if (rat.x < 0 || rat.x > window.innerWidth - 30) rat.direction = Math.PI - rat.direction;
    if (rat.y < 0 || rat.y > window.innerHeight - 30) rat.direction = -rat.direction;
    
    // Keep rat within bounds
    rat.x = Math.max(0, Math.min(window.innerWidth - 30, rat.x));
    rat.y = Math.max(0, Math.min(window.innerHeight - 30, rat.y));
    
    rat.element.style.left = `${rat.x}px`;
    rat.element.style.top = `${rat.y}px`;
    
    // Increased damage from rats
    const distance = Math.hypot(this.player.x - (rat.x + 15), this.player.y - (rat.y + 15));
    if (distance < 30) {
      this.takeDamage(2); 
    }

    requestAnimationFrame(() => this.moveRat(rat));
  }

  takeDamage(amount) {
    const now = Date.now();
    if (now - this.lastDamageTime < this.damageImmunityTime) {
      return; // Still in immunity period
    }
    
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    this.lastDamageTime = now;
    
    // Play damage sound
    if (amount > 0) {
      this.damageSound.currentTime = 0;
      this.damageSound.play().catch(err => console.log('Audio play error:', err));
    }
    
    if (this.health <= 0 && !this.isDead) {
      const savedState = {
        lamps: this.lamps,
        inventory: {...this.inventory}
      };
      
      this.isDead = true;
      this.gameLoopRunning = false;
      this.playerElement.style.backgroundColor = '#ff0000';
      this.playerElement.style.transform = 'scale(1.5)';
      this.playerElement.style.opacity = '0';
      this.playerElement.style.transition = 'all 0.5s';
      
      // Show respawn screen only when player dies
      setTimeout(() => {
        document.getElementById('respawn-screen').classList.remove('hidden');
      }, 1000);
      
      // Save the state for respawn
      this.savedState = savedState;
    }
  }

  updateHealthBar() {
    this.healthBar.style.width = `${this.health}%`;
    this.healthBar.style.backgroundColor = `hsl(${this.health}, 70%, 50%)`;
  }

  createVent() {
    const vent = document.createElement('div');
    vent.className = 'vent';
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'vent-slot';
      vent.appendChild(slot);
    }
    vent.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    vent.style.top = `${Math.random() * (window.innerHeight - 60)}px`;
    this.room.appendChild(vent);

    // Store vent position for collision detection
    this.ventPosition = {
      x: parseInt(vent.style.left),
      y: parseInt(vent.style.top),
      width: 60,
      height: 60
    };
  }

  createTable() {
    const table = document.createElement('div');
    table.className = 'table';
    table.style.left = `${Math.random() * (window.innerWidth - 120)}px`;
    table.style.top = `${Math.random() * (window.innerHeight - 80)}px`;
    this.room.appendChild(table);

    // Always add book to table
    const book = document.createElement('div');
    book.className = 'emerald-book';
    book.addEventListener('click', () => this.openBook());
    table.appendChild(book);
  }

  openBook() {
    const bookInterface = document.createElement('div');
    bookInterface.className = 'book-interface';
  
    const exitBtn = document.createElement('button');
    exitBtn.className = 'book-exit-btn';
    exitBtn.innerHTML = '&times;';
    exitBtn.addEventListener('click', () => {
      bookInterface.remove();
      this.gameLoopRunning = true;    
      this.startGameLoop(); // Ensure game loop restarts properly
    });
  
    const pageContainer = document.createElement('div');
    pageContainer.className = 'book-pages';
  
    const pages = [
      'Untitled197.png',
      'Untitled197_20250201105029.png',
      'iloveyou.png'
    ];
  
    let currentPage = 0;
  
    const updatePage = () => {
      pageContainer.style.backgroundImage = `url(${pages[currentPage]})`;
    };
  
    const prevBtn = document.createElement('button');
    prevBtn.className = 'book-nav-btn prev-btn';
    prevBtn.textContent = '←';
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        const pageSound = new Audio('Book Page Turn Flip Sound Effect [ ezmp3.cc ].mp3');
        pageSound.volume = 0.3;
        pageSound.play();
        currentPage--;
        updatePage();
      }
    });
  
    const nextBtn = document.createElement('button');
    nextBtn.className = 'book-nav-btn next-btn';
    nextBtn.textContent = '→';
    nextBtn.addEventListener('click', () => {
      if (currentPage < pages.length - 1) {
        const pageSound = new Audio('Book Page Turn Flip Sound Effect [ ezmp3.cc ].mp3');
        pageSound.volume = 0.3;
        pageSound.play();
        currentPage++;
        updatePage();
      }
    });
  
    bookInterface.appendChild(exitBtn);
    bookInterface.appendChild(pageContainer);
    bookInterface.appendChild(prevBtn);
    bookInterface.appendChild(nextBtn);
  
    document.body.appendChild(bookInterface);
    updatePage();
  
    // Pause game loop while book is open
    this.gameLoopRunning = false;
  }

  createPlush() {
    const plush = document.createElement('div');
    plush.className = 'plush';
    plush.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    plush.style.top = `${Math.random() * (window.innerHeight - 40)}px`;
    plush.addEventListener('click', () => this.collectPlush(plush));
    this.room.appendChild(plush);
  }

  collectPlush(plush) {
    const items = ['potion', 'cross', 'powder'];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    this.inventory[randomItem]++;
    this.updateInventoryDisplay();
    plush.remove();
  }

  createDemon() {
    const demon = document.createElement('div');
    demon.className = 'demon';
    demon.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
    demon.style.top = `${Math.random() * (window.innerHeight - 80)}px`;
    
    // Reduced chess challenge chance from 70% to 30%
    if (Math.random() < 0.3) {
      this.createChessboard(demon);
    } else {
      demon.addEventListener('click', () => this.handleDemonClick(demon));
      this.moveDemon(demon);
    }
    
    this.room.appendChild(demon);
  }

  moveDemon(demon) {
    if (this.isDead) return;

    const demonPos = {
      x: parseInt(demon.style.left),
      y: parseInt(demon.style.top)
    };

    // Calculate angle to player
    const angle = Math.atan2(this.player.y - demonPos.y, this.player.x - demonPos.x);
    // Reduced speed from 4 to 3.2 (20% slower)
    const speed = 3.2;
    
    const newX = demonPos.x + Math.cos(angle) * speed;
    const newY = demonPos.y + Math.sin(angle) * speed;
    
    demon.style.left = `${Math.max(0, Math.min(window.innerWidth - 50, newX))}px`;
    demon.style.top = `${Math.max(0, Math.min(window.innerHeight - 80, newY))}px`;

    const distanceToPlayer = Math.hypot(this.player.x - newX, this.player.y - newY);
    
    if (distanceToPlayer < 50 && !this.isHiding) {
      this.triggerJumpscare();
      this.takeDamage(25);
    }

    requestAnimationFrame(() => this.moveDemon(demon));
  }

  createChessboard(demon) {
    const chessContainer = document.createElement('div');
    chessContainer.className = 'chess-container';
    
    const challengeText = document.createElement('div');
    challengeText.className = 'chess-text';
    challengeText.textContent = 'I bet I could beat you in chess...';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'chess-buttons';
    
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept Challenge';
    acceptButton.addEventListener('click', () => this.startChessGame(demon, chessContainer));
    
    const declineButton = document.createElement('button');
    declineButton.textContent = 'Decline';
    declineButton.addEventListener('click', () => {
      chessContainer.remove();
      demon.addEventListener('click', () => this.handleDemonClick(demon));
      this.moveDemon(demon);
    });
    
    buttonContainer.appendChild(acceptButton);
    buttonContainer.appendChild(declineButton);
    
    chessContainer.appendChild(challengeText);
    chessContainer.appendChild(buttonContainer);
    
    demon.appendChild(chessContainer);
  }

  startChessGame(demon, challengeContainer) {
    this.isPlayingChess = true;
    this.gameLoopRunning = false;
    this.chessRound = 0;
    
    // Create chess game interface
    const gameInterface = document.createElement('div');
    gameInterface.className = 'chess-game';
    
    const instructions = document.createElement('div');
    instructions.className = 'chess-instructions';
    instructions.textContent = 'Predict my next move...';
    
    const moves = ['♟️', '♞', '♝', '♜', '♛'];
    const moveButtons = document.createElement('div');
    moveButtons.className = 'chess-moves';
    
    moves.forEach(move => {
      const button = document.createElement('button');
      button.textContent = move;
      button.addEventListener('click', () => this.makeChessMove(move, demon, gameInterface));
      moveButtons.appendChild(button);
    });
    
    const progress = document.createElement('div');
    progress.className = 'chess-progress';
    progress.textContent = `Round: ${this.chessRound + 1}/${this.maxChessRounds}`;
    
    gameInterface.appendChild(instructions);
    gameInterface.appendChild(moveButtons);
    gameInterface.appendChild(progress);
    
    challengeContainer.remove();
    document.body.appendChild(gameInterface);
    
    // Generate demon's sequence
    this.chessSequence = Array(this.maxChessRounds).fill(0)
      .map(() => moves[Math.floor(Math.random() * moves.length)]);
  }

  makeChessMove(move, demon, gameInterface) {
    this.playerSequence.push(move);
    const currentRound = this.playerSequence.length - 1;
    
    if (move === this.chessSequence[currentRound]) {
      if (this.playerSequence.length === this.maxChessRounds) {
        // Player wins
        gameInterface.innerHTML = '<div class="chess-victory">You have bested me...</div>';
        setTimeout(() => {
          gameInterface.remove();
          demon.remove();
          this.isPlayingChess = false;
          this.gameLoopRunning = true;
          this.gameLoop();
        }, 2000);
      } else {
        // Next round
        this.chessRound++;
        gameInterface.querySelector('.chess-progress').textContent = 
          `Round: ${this.chessRound + 1}/${this.maxChessRounds}`;
      }
    } else {
      // Player loses
      gameInterface.innerHTML = '<div class="chess-defeat">Checkmate...</div>';
      setTimeout(() => {
        gameInterface.remove();
        this.triggerJumpscare();
        this.takeDamage(100);
        demon.remove();
        this.isPlayingChess = false;
        this.gameLoopRunning = true;
        this.gameLoop();
      }, 2000);
    }
  }

  handleDemonClick(demon) {
    if (this.isDead) return;
    
    if (this.selectedItem === 'angel-statue' && this.inventory['angel-statue'] > 0) {
      this.inventory['angel-statue']--;
      this.hasAngelStatue = true;
      demon.remove();
      
      // Create divine particles
      const demonPos = demon.getBoundingClientRect();
      this.createDivineParticles(demonPos.x, demonPos.y);
      
      // Start protection timer
      setTimeout(() => {
        this.hasAngelStatue = false;
      }, this.angelStatueTimer);
      
      this.updateInventoryDisplay();
    } else if (this.selectedItem === 'cross' && this.inventory.cross > 0) {
      this.inventory.cross--;
      demon.remove();
      this.updateInventoryDisplay();
    } else if (this.selectedItem === 'potion' && this.inventory.potion > 0) {
      // New potion functionality: heals player
      this.inventory.potion--;
      this.health = Math.min(100, this.health + 30); // Heal 30 HP
      this.updateHealthBar();
      this.updateInventoryDisplay();
    } else if (this.selectedItem === 'powder' && this.inventory.powder > 0) {
      this.inventory.powder--;
      demon.classList.add('repelled');
      
      setTimeout(() => {
        if (demon && demon.parentElement) {
          demon.classList.remove('repelled');
        }
      }, 3000);
      
      this.updateInventoryDisplay();
    }
  }

  createLamp() {
    const lamp = document.createElement('div');
    lamp.className = 'lamp';
    
    // Random position for lamp
    lamp.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    lamp.style.top = `${Math.random() * (window.innerHeight - 30)}px`;
    
    lamp.addEventListener('click', () => this.collectLamp(lamp));
    this.room.appendChild(lamp);
  }

  collectLamp(lamp) {
    this.lamps++;
    this.updateLampCounter();
    lamp.remove();
    
    // Adjust darkness based on collected lamps
    const visibility = 100 + (this.lamps * 20);
    this.darknessOverlay.style.background = 
      `radial-gradient(circle at ${this.player.x}px ${this.player.y}px, 
       transparent ${visibility}px, 
       rgba(0, 0, 0, 0.95) ${visibility + 100}px)`;

    if (this.lamps >= this.requiredLamps) {
      this.showVictory();
    }
  }

  updateLampCounter() {
    this.lampCounter.textContent = `Lamps: ${this.lamps}/${this.requiredLamps}`;
  }

  updateInventoryDisplay() {
    const slots = document.querySelectorAll('.hotbar-slot');
    slots.forEach(slot => {
      const itemType = slot.dataset.item;
      const count = slot.querySelector('.item-count');
      if (count) {
        count.textContent = this.inventory[itemType];
      }
    });
  }

  selectItem(itemType) {
    const slots = document.querySelectorAll('.hotbar-slot');
    slots.forEach(slot => slot.classList.remove('selected'));
    if (this.selectedItem === itemType) {
      this.selectedItem = null;
    } else {
      this.selectedItem = itemType;
      const selectedSlot = document.querySelector(`[data-item="${itemType}"]`);
      if (selectedSlot) selectedSlot.classList.add('selected');
    }
  }

  setupEventListeners() {
    const door = document.getElementById('door');
    door.addEventListener('click', () => this.enterNewRoom());
  }

  generateNewDoorPosition() {
    return {
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 140)
    };
  }

  enterNewRoom() {
    const now = Date.now();
    if (now - this.lastRoomTransition < this.roomTransitionCooldown) {
      return; // Still in cooldown
    }
    this.lastRoomTransition = now;

    if (this.lamps >= this.requiredLamps) {
      this.showVictory();
      return;
    }

    this.currentRoomId++;
    if (this.visitedRooms.has(this.currentRoomId)) {
      // Generate a new unique room ID if this one is already visited
      while (this.visitedRooms.has(this.currentRoomId)) {
        this.currentRoomId++;
      }
    }
    this.visitedRooms.add(this.currentRoomId);

    // Fade transition
    this.room.style.backgroundColor = '#000';
    setTimeout(() => {
      // Remove existing elements
      document.querySelectorAll('.lamp, .table, .vent, .plush, .demon, .love-text-box, .love-progress').forEach(el => el.remove());
      
      // Reset room
      this.room.style.backgroundColor = '#1a1a1a';
      this.doorPosition = this.generateNewDoorPosition();
      
      // Update door position
      const door = document.getElementById('door');
      door.style.left = `${this.doorPosition.x}px`;
      door.style.top = `${this.doorPosition.y}px`;

      // Setup new room
      this.setupRoom();

      // Teleport player to center of new room
      this.player.x = window.innerWidth / 2;
      this.player.y = window.innerHeight / 2;
      this.updatePlayerPosition();
    }, 500);
  }

  showVictory() {
    // Create golden door with special glow effect
    const goldenDoor = document.createElement('div');
    goldenDoor.className = 'golden-door';
    goldenDoor.style.left = `${this.doorPosition.x}px`;
    goldenDoor.style.top = `${this.doorPosition.y}px`;
    
    // Add click handler to redirect to Divine Orbs game
    goldenDoor.addEventListener('click', () => {
      window.location.href = 'https://websim.ai/@ruko/divine-orbs';
    });
    
    this.room.appendChild(goldenDoor);

    // Remove normal door
    const normalDoor = document.getElementById('door');
    if (normalDoor) normalDoor.remove();
  }

  setupInvertedRoom() {
    if (this.isDead) return;

    // Clear existing elements
    const existingElements = document.querySelectorAll('.table, .vent, .plush, .demon, .lamp, .angel, .darkness-orb, .dark-demon, .divine-particle');
    existingElements.forEach(el => el.remove());

    this.room.classList.add('inverted-mode');

    // Create divine particles
    for (let i = 0; i < 20; i++) {
      this.createDivineParticle();
    }

    // Higher chance for dark demons in inverted mode (30%)
    if (Math.random() < 0.3) {
      this.createDarkDemon();
    }

    // Angels are now stronger but rarer (5% chance)
    if (Math.random() < 0.05) {
      this.createAngel();
      this.angelsSpawned++;
    }

    // More darkness orbs to collect
    if (Math.random() < 0.6) {
      for (let i = 0; i < 2; i++) {
        this.createDarknessOrb();
      }
    }
  }

  createDivineParticle() {
    const particle = document.createElement('div');
    particle.className = 'divine-particle';
    particle.style.left = `${Math.random() * window.innerWidth}px`;
    particle.style.top = `${Math.random() * window.innerHeight}px`;
    particle.style.animationDelay = `${Math.random() * 4}s`;
    this.room.appendChild(particle);
  }

  createDarkDemon() {
    const demon = document.createElement('div');
    demon.className = 'dark-demon';
    demon.style.left = `${Math.random() * (window.innerWidth - 70)}px`;
    demon.style.top = `${Math.random() * (window.innerHeight - 120)}px`;
    
    this.moveDarkDemon(demon);
    
    this.room.appendChild(demon);
  }

  moveDarkDemon(demon) {
    if (this.isDead) return;

    const demonPos = {
      x: parseInt(demon.style.left),
      y: parseInt(demon.style.top)
    };

    // Dark demons are faster but now 20% slower than before
    const angle = Math.atan2(this.player.y - demonPos.y, this.player.x - demonPos.x);
    // Reduced speed from 8 to 6.4 (20% slower)
    const speed = 6.4;
    
    const newX = demonPos.x + Math.cos(angle) * speed;
    const newY = demonPos.y + Math.sin(angle) * speed;
    
    demon.style.left = `${Math.max(0, Math.min(window.innerWidth - 70, newX))}px`;
    demon.style.top = `${Math.max(0, Math.min(window.innerHeight - 120, newY))}px`;

    // Check for player collision
    const collisionDistance = Math.hypot(this.player.x - (newX + 35), this.player.y - (newY + 60));
    if (collisionDistance < 50) {
      // Dark demons deal more damage
      this.takeDamage(15);
    }

    requestAnimationFrame(() => this.moveDarkDemon(demon));
  }

  createAngel() {
    const angel = document.createElement('div');
    angel.className = 'angel';
    angel.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    angel.style.top = `${Math.random() * (window.innerHeight - 100)}px`;
    
    // Angels now actively protect against dark demons
    this.moveAngel(angel);
    
    this.room.appendChild(angel);
  }

  moveAngel(angel) {
    if (this.isDead) return;

    const angelPos = {
      x: parseInt(angel.style.left),
      y: parseInt(angel.style.top)
    };

    // Angels now move more strategically
    const nearbyDemons = document.querySelectorAll('.dark-demon');
    let targetX = this.player.x;
    let targetY = this.player.y;

    // If there are nearby demons, intercept them
    nearbyDemons.forEach(demon => {
      const demonRect = demon.getBoundingClientRect();
      const demonDistance = Math.hypot(demonRect.x - this.player.x, demonRect.y - this.player.y);
      if (demonDistance < 300) {
        targetX = demonRect.x;
        targetY = demonRect.y;
      }
    });

    const angle = Math.atan2(targetY - angelPos.y, targetX - angelPos.x);
    // Reduced speed from 5 to 4 (20% slower)
    const speed = 4;

    const newX = angelPos.x + Math.cos(angle) * speed;
    const newY = angelPos.y + Math.sin(angle) * speed;

    angel.style.left = `${Math.max(0, Math.min(window.innerWidth - 60, newX))}px`;
    angel.style.top = `${Math.max(0, Math.min(window.innerHeight - 100, newY))}px`;

    // Angels now repel nearby dark demons
    nearbyDemons.forEach(demon => {
      const demonRect = demon.getBoundingClientRect();
      const distance = Math.hypot(newX - demonRect.x, newY - demonRect.y);
      if (distance < 150) {
        demon.style.opacity = '0.5';
        demon.style.filter = 'brightness(0.5)';
      }
    });

    requestAnimationFrame(() => this.moveAngel(angel));
  }

  createDarknessOrb() {
    const orb = document.createElement('div');
    orb.className = 'darkness-orb';
    orb.style.left = `${Math.random() * (window.innerWidth - 30)}px`;
    orb.style.top = `${Math.random() * (window.innerHeight - 30)}px`;
    orb.addEventListener('click', () => this.collectDarknessOrb(orb));
    this.room.appendChild(orb);
  }

  collectDarknessOrb(orb) {
    this.lamps++;
    this.updateLampCounter();
    orb.remove();
  
    // Adjust light based on collected orbs
    const darkness = 100 + (this.lamps * 20);
    this.darknessOverlay.style.background = 
      `radial-gradient(circle at ${this.player.x}px ${this.player.y}px, 
       rgba(255,255,255,0.95) ${darkness}px, 
       transparent ${darkness + 100}px)`;

    if (this.lamps >= this.requiredLamps) {
      this.showFinalVictory();
    }
  }

  showFinalVictory() {
    const victory = document.getElementById('victory');
    victory.querySelector('h1').textContent = 'Divine Victory!';
    victory.querySelector('p').textContent = 'You have conquered both light and darkness, bringing true balance to the realm!';
    victory.classList.remove('hidden');
    
    // Create celebratory divine particles
    for (let i = 0; i < 50; i++) {
      this.createDivineParticle();
    }
  }

  setupKeyControls() {
    window.addEventListener('keydown', (e) => {
      if (this.isDead) return;
      
      const key = e.key.toLowerCase();
      if (this.keys.hasOwnProperty(key)) {
        e.preventDefault(); // Prevent default scrolling behavior
        this.keys[key] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (this.keys.hasOwnProperty(key)) {
        e.preventDefault(); // Prevent default scrolling behavior
        this.keys[key] = false;
      }
    });

    // Start the game loop for smooth movement
    this.startGameLoop();
  }

  gameLoop() {
    if (!this.isDead && this.gameLoopRunning) {
      this.updatePlayerMovement();
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  startGameLoop() {
    if (!this.gameLoopRunning) {
      this.gameLoopRunning = true;
      this.gameLoop();
    }
  }

  pauseGameLoop() {
    this.gameLoopRunning = false;
  }

  updatePlayerMovement() {
    let dx = 0;
    let dy = 0;

    // Calculate direction based on pressed keys
    if (this.keys.w) dy -= this.player.speed;
    if (this.keys.s) dy += this.player.speed;
    if (this.keys.a) dx -= this.player.speed;
    if (this.keys.d) dx += this.player.speed;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const normalizer = Math.sqrt(2) / 2;
      dx *= normalizer;
      dy *= normalizer;
    }

    // Update player position with new coordinates
    this.player.x += dx;
    this.player.y += dy;

    // Keep player within bounds
    this.player.x = Math.max(30, Math.min(window.innerWidth - 30, this.player.x));
    this.player.y = Math.max(30, Math.min(window.innerHeight - 30, this.player.y));

    this.updatePlayerPosition();
    
    // Update darkness overlay to follow player
    if (!this.isInvertedMode) {
      this.darknessOverlay.style.background = 
        `radial-gradient(circle at ${this.player.x}px ${this.player.y}px, 
         transparent ${100 + (this.lamps * 20)}px, 
         rgba(0, 0, 0, 0.95) ${200 + (this.lamps * 20)}px)`;
    } else {
      this.darknessOverlay.style.background = 
        `radial-gradient(circle at ${this.player.x}px ${this.player.y}px, 
         rgba(255,255,255,0.95) ${100 + (this.lamps * 20)}px, 
         transparent ${200 + (this.lamps * 20)}px)`;
    }
    
    // Check for door collision
    const doorRect = {
      x: this.doorPosition.x,
      y: this.doorPosition.y,
      width: 80,
      height: 140
    };

    if (this.checkCollision(
      {x: this.player.x, y: this.player.y, width: 30, height: 30},
      doorRect
    )) {
      this.enterNewRoom();
    }

    // Check for vent collision when not in vent
    if (!this.isInVent && this.ventPosition) {
      if (this.checkCollision(
        {x: this.player.x, y: this.player.y, width: 30, height: 30},
        this.ventPosition
      )) {
        this.enterVent();
      }
    }

    // Check for vent exit collision when in vent
    if (this.isInVent) {
      const ventExit = document.querySelector('.vent-exit');
      if (ventExit) {
        const exitRect = ventExit.getBoundingClientRect();
        if (this.checkCollision(
          {x: this.player.x, y: this.player.y, width: 30, height: 30},
          {x: exitRect.left, y: exitRect.top, width: exitRect.width, height: exitRect.height}
        )) {
          this.exitVent();
        }
      }
    }
    
    // Calculate light level at player position
    const lightRadius = 100 + (this.lamps * 20);
    const nearbyLamps = document.querySelectorAll('.lamp');
    let inLight = false;

    nearbyLamps.forEach(lamp => {
      const lampRect = lamp.getBoundingClientRect();
      const distance = Math.hypot(
        this.player.x - (lampRect.left + lampRect.width/2),
        this.player.y - (lampRect.top + lampRect.height/2)
      );
      if (distance < lightRadius) {
        inLight = true;
      }
    });

    // Update insanity based on darkness - much slower increase
    if (!inLight) {
      // Increase insanity by a very small amount (will take ~2 hours to reach max)
      // 100 (max insanity) / (2 hours * 60 minutes * 60 seconds * 60 FPS) ≈ 0.000231
      this.insanityLevel = Math.min(this.maxInsanity, this.insanityLevel + 0.000231);
      
      if (!this.isPlayingInsanitySound && this.insanityLevel > 50) {
        this.isPlayingInsanitySound = true;
        this.insanitySound.loop = true;
        this.insanitySound.play();
      }
    } else {
      // Recovery is still 2x faster than buildup
      this.insanityLevel = Math.max(0, this.insanityLevel - 0.000462);
      if (this.isPlayingInsanitySound && this.insanityLevel < 50) {
        this.isPlayingInsanitySound = false;
        this.insanitySound.pause();
        this.insanitySound.currentTime = 0;
      }
    }

    // Apply insanity effects only when significant
    if (this.insanityLevel > 30) {
      this.room.style.animation = 'insanityBlur 2s infinite';
      const intensity = Math.min(1, this.insanityLevel / 100);
      this.room.style.filter = `sepia(${intensity}) hue-rotate(-${intensity * 20}deg)`;
      
      // Random hallucinations become more frequent with higher insanity
      const now = Date.now();
      if (now - this.lastHallucination > this.hallucinationCooldown && 
          Math.random() < (this.insanityLevel / 500)) { // Much rarer hallucinations
        this.triggerHallucination();
        this.lastHallucination = now;
      }
    } else {
      this.room.style.animation = '';
      this.room.style.filter = '';
    }
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  enterVent() {
    this.isInVent = true;
    this.setupRoom();
  }

  exitVent() {
    this.isInVent = false;
    this.setupRoom();
  }

  updatePlayerPosition() {
    this.playerElement.style.left = `${this.player.x - 15}px`;
    this.playerElement.style.top = `${this.player.y - 15}px`;
  }

  respawn() {
    if (!this.savedState) return;

    // Hide respawn screen
    document.getElementById('respawn-screen').classList.add('hidden');

    // Reset game state
    this.isDead = false;
    this.gameLoopRunning = true;
    this.health = 100;
    this.lamps = this.savedState.lamps;
    this.inventory = {...this.savedState.inventory};
    this.isInVent = false;
    
    // Reset player position
    this.player.x = window.innerWidth / 2;
    this.player.y = window.innerHeight / 2;
    
    // Reset door position
    this.doorPosition = {
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 140)
    };

    // Get and verify DOM elements
    const room = document.getElementById('room');
    if (!room) {
      console.error('Room element not found');
      return;
    }

    const door = document.getElementById('door');
    if (door) {
      door.style.left = `${this.doorPosition.x}px`;
      door.style.top = `${this.doorPosition.y}px`;
    }

    // Reset or create player element
    if (!this.playerElement || !this.playerElement.parentElement) {
      this.playerElement = document.createElement('div');
      this.playerElement.className = 'player';
      room.appendChild(this.playerElement);
    }
    
    this.playerElement.style = '';
    this.playerElement.className = 'player';

    // Reset darkness overlay
    if (this.darknessOverlay) {
      this.darknessOverlay.style.background = `radial-gradient(circle at 50% 50%, transparent ${100 + (this.lamps * 20)}px, rgba(0, 0, 0, 0.95) ${200 + (this.lamps * 20)}px)`;
    }
    
    // Update UI elements
    this.updateHealthBar();
    this.updateLampCounter();
    this.updateInventoryDisplay();
    
    // Clear existing elements before setting up room
    const existingElements = document.querySelectorAll('.table, .vent, .plush, .demon, .lamp, .rat, .golden-door, .angel, .darkness-orb, .dark-demon, .divine-particle');
    existingElements.forEach(el => el.remove());
    
    // Setup new room
    this.setupRoom();
    
    // Update player position
    this.updatePlayerPosition();
    
    // Restart game loop
    this.gameLoop();
  }

  reset() {
    this.lamps = 0;
    this.isDead = false;
    this.inventory = {
      potion: 0,
      cross: 0,
      powder: 0,
      cheese: 0,
      'angel-statue': 0
    };
    this.selectedItem = null;
    this.doorPosition = {
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 140)
    };
    
    // Update door position
    const door = document.getElementById('door');
    door.style.left = `${this.doorPosition.x}px`;
    door.style.top = `${this.doorPosition.y}px`;
    
    this.updateLampCounter();
    this.updateInventoryDisplay();
    
    // Clear all existing room elements
    document.querySelectorAll('.table, .vent, .plush, .demon, .lamp, .golden-door').forEach(el => el.remove());
    
    // Hide game over and victory screens
    this.gameOver.classList.add('hidden');
    this.victory.classList.add('hidden');
    
    // Reset darkness overlay
    this.darknessOverlay.style.background = 
      'radial-gradient(circle at 50% 50%, transparent 100px, rgba(0, 0, 0, 0.95) 200px)';
    
    // Reset player position
    this.player.x = window.innerWidth / 2;
    this.player.y = window.innerHeight / 2;
    this.updatePlayerPosition();
    
    // Reset the room
    this.setupRoom();
    
    // Reset hotbar selection
    document.querySelectorAll('.hotbar-slot').forEach(slot => slot.classList.remove('selected'));
    
    // Restart game loop if it was stopped
    if (!this.gameLoopRunning) {
      this.gameLoopRunning = true;
      this.gameLoop();
    }
    
    this.isInVent = false;
    this.health = 100;
    this.updateHealthBar();
    document.getElementById('esc-menu').classList.remove('active');
    this.gameLoopRunning = false;
  }

  createAngelStatue() {
    const statue = document.createElement('div');
    statue.className = 'angel-statue';
    statue.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    statue.style.top = `${Math.random() * (window.innerHeight - 100)}px`;
    
    statue.addEventListener('click', () => this.collectAngelStatue(statue));
    this.room.appendChild(statue);
  }

  collectAngelStatue(statue) {
    this.inventory['angel-statue']++;
    this.updateInventoryDisplay();
    statue.remove();
    
    // Create divine particles effect
    this.createDivineParticles(parseInt(statue.style.left), parseInt(statue.style.top));
  }

  createCloset() {
    const closet = document.createElement('div');
    closet.className = 'closet';
    closet.style.left = `${Math.random() * (window.innerWidth - 70)}px`;
    closet.style.top = `${Math.random() * (window.innerHeight - 120)}px`;
    
    closet.addEventListener('click', () => {
      if (!this.isHiding) {
        this.hideInCloset(closet);
      } else {
        this.exitCloset();
      }
    });
    
    this.room.appendChild(closet);
  }

  hideInCloset(closet) {
    this.isHiding = true;
    closet.classList.add('hiding');
    this.playerElement.style.opacity = '0';
    this.player.x = parseInt(closet.style.left) + 35;
    this.player.y = parseInt(closet.style.top) + 60;
  }

  exitCloset() {
    this.isHiding = false;
    document.querySelector('.closet.hiding')?.classList.remove('hiding');
    this.playerElement.style.opacity = '1';
  }

  createCheeseItem() {
    const cheese = document.createElement('div');
    cheese.style.position = 'absolute';
    cheese.style.width = '20px';
    cheese.style.height = '20px';
    cheese.style.backgroundColor = '#ffd700';
    cheese.style.borderRadius = '50%';
    cheese.style.cursor = 'pointer';
    
    cheese.style.left = `${Math.random() * (window.innerWidth - 20)}px`;
    cheese.style.top = `${Math.random() * (window.innerHeight - 20)}px`;
    
    cheese.addEventListener('click', () => {
      this.inventory.cheese++;
      this.updateInventoryDisplay();
      cheese.remove();
    });
    
    this.room.appendChild(cheese);
  }

  createShadowDemon() {
    const demon = document.createElement('div');
    demon.className = 'shadow-demon';
    demon.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
    demon.style.top = `${Math.random() * (window.innerHeight - 100)}px`;
    
    this.moveShadowDemon(demon);
    this.room.appendChild(demon);
  }

  moveShadowDemon(demon) {
    if (this.isDead) return;

    const pos = {
      x: parseInt(demon.style.left),
      y: parseInt(demon.style.top)
    };

    if (!this.isHiding) {
      const angle = Math.atan2(this.player.y - pos.y, this.player.x - pos.x);
      // Reduced speed from 3 to 2.4 (20% slower)
      const speed = 2.4;
      
      const newX = pos.x + Math.cos(angle) * speed;
      const newY = pos.y + Math.sin(angle) * speed;
      
      demon.style.left = `${Math.max(0, Math.min(window.innerWidth - 60, newX))}px`;
      demon.style.top = `${Math.max(0, Math.min(window.innerHeight - 100, newY))}px`;

      const distanceToPlayer = Math.hypot(this.player.x - newX, this.player.y - newY);
      
      if (distanceToPlayer < 50 && !this.isHiding) {
        this.triggerJumpscare();
        this.takeDamage(20);
      }
    }

    requestAnimationFrame(() => this.moveShadowDemon(demon));
  }

  createGhost() {
    const ghost = document.createElement('div');
    ghost.className = 'ghost';
    ghost.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    ghost.style.top = `${Math.random() * (window.innerHeight - 60)}px`;
    
    this.moveGhost(ghost);
    this.room.appendChild(ghost);
  }

  moveGhost(ghost) {
    if (this.isDead) return;

    const pos = {
      x: parseInt(ghost.style.left),
      y: parseInt(ghost.style.top)
    };

    if (!this.isHiding && !this.isSleeping) {
      const angle = Math.atan2(this.player.y - pos.y, this.player.x - pos.x);
      // Reduced speed from 3.5 to 2.8 (20% slower)
      const speed = 2.8;
      
      const newX = pos.x + Math.cos(angle) * speed;
      const newY = pos.y + Math.sin(angle) * speed;
      
      ghost.style.left = `${Math.max(0, Math.min(window.innerWidth - 40, newX))}px`;
      ghost.style.top = `${Math.max(0, Math.min(window.innerHeight - 60, newY))}px`;

      const distanceToPlayer = Math.hypot(this.player.x - newX, this.player.y - newY);
      
      if (distanceToPlayer < 40 && !this.isHiding) {
        this.triggerJumpscare();
        this.takeDamage(15);
      }
    }

    requestAnimationFrame(() => this.moveGhost(ghost));
  }

  triggerJumpscare() {
    const now = Date.now();
    if (now - this.lastJumpscareTime < 5000) return; // Prevent jumpscare spam
    
    this.lastJumpscareTime = now;
    
    const jumpscare = document.createElement('div');
    jumpscare.className = 'jumpscare';
    document.body.appendChild(jumpscare);
    
    // Play the provided jumpscare sound
    const jumpscareSound = new Audio('Jumpscare Sound Effect [ ezmp3.cc ].mp3');
    jumpscareSound.volume = 0.7; // Increased from 0.3 to 0.7
    jumpscareSound.play();
    
    // Remove jumpscare after animation
    setTimeout(() => {
      jumpscare.remove();
    }, 4000);
  }

  createBed() {
    const bed = document.createElement('div');
    bed.className = 'bed';
    bed.style.left = `${Math.random() * (window.innerWidth - 120)}px`;
    bed.style.top = `${Math.random() * (window.innerHeight - 80)}px`;
    
    bed.addEventListener('click', () => {
      if (!this.isSleeping) {
        this.sleep(bed);
      } else {
        this.wakeUp();
      }
    });
    
    this.room.appendChild(bed);
  }

  sleep(bed) {
    this.isSleeping = true;
    this.room.classList.add('sleeping');
    this.playerElement.style.opacity = '0.5';
    
    // Create sleep paralysis demon
    const demon = document.createElement('div');
    demon.className = 'sleep-paralysis-demon';
    demon.style.left = `${this.player.x - 50}px`;
    demon.style.top = `${this.player.y - 75}px`;
    this.room.appendChild(demon);
    
    // Slowly approach player
    const approachInterval = setInterval(() => {
      if (!this.isSleeping) {
        clearInterval(approachInterval);
        return;
      }
      
      const scale = parseFloat(demon.style.transform.match(/scale\((.*?)\)/)?.[1] || 1);
      demon.style.transform = `scale(${scale + 0.1})`;
      
      if (scale > 2) {
        this.triggerJumpscare();
        this.wakeUp();
        this.takeDamage(30);
      }
    }, 1000);
  }

  wakeUp() {
    this.isSleeping = false;
    this.room.classList.remove('sleeping');
    this.playerElement.style.opacity = '1';
    document.querySelector('.sleep-paralysis-demon')?.remove();
  }

  createDivineParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'divine-particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      this.room.appendChild(particle);
      
      setTimeout(() => particle.remove(), 4000);
    }
  }

  createWalls() {
    const room = document.getElementById('room');
    
    // Create floor first (at bottom layer)
    const floor = document.createElement('div');
    floor.className = 'floor';
    room.appendChild(floor);
    
    // Create walls
    const walls = ['top', 'bottom', 'left', 'right'];
    walls.forEach(position => {
      const wall = document.createElement('div');
      wall.className = `wall ${position}`;
      room.appendChild(wall);
    });

    // Add windows on left and right walls if not in vent, with random placement
    if (!this.isInVent) {
      // Randomly decide which walls get windows (max 2)
      const wallsToAddWindows = ['left', 'right']
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 1); // Random 1 or 2 windows

      wallsToAddWindows.forEach(wall => {
        const windowTop = Math.random() * (window.innerHeight - 240);
        const windowElement = document.createElement('div');
        windowElement.className = `window ${wall}-wall`;
        windowElement.style.top = `${windowTop}px`;
        
        // Add window panes
        for (let i = 0; i < 4; i++) {
          const pane = document.createElement('div');
          pane.className = 'window-pane';
          windowElement.appendChild(pane);
        }
        
        room.appendChild(windowElement);
      });
    }
  }

  updateGuidingLight() {
    if (this.isDead) return;

    // Calculate direction to nearest lamp or objective
    let nearestTarget = null;
    let shortestDistance = Infinity;

    // Find nearest lamp
    document.querySelectorAll('.lamp').forEach(lamp => {
      const lampRect = lamp.getBoundingClientRect();
      const distance = Math.hypot(
        this.player.x - (lampRect.left + lampRect.width/2),
        this.player.y - (lampRect.top + lampRect.height/2)
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestTarget = {x: lampRect.left + lampRect.width/2, y: lampRect.top + lampRect.height/2};
      }
    });

    // If no lamps, point to door
    if (!nearestTarget) {
      const door = document.getElementById('door');
      const doorRect = door.getBoundingClientRect();
      nearestTarget = {
        x: doorRect.left + doorRect.width/2,
        y: doorRect.top + doorRect.height/2
      };
    }

    if (nearestTarget) {
      // Calculate angle to target
      const angle = Math.atan2(nearestTarget.y - this.player.y, nearestTarget.x - this.player.x);
      
      // Position light 50px away from player in direction of target
      const offsetX = Math.cos(angle) * 50;
      const offsetY = Math.sin(angle) * 50;
      
      this.guidingLight.style.left = `${this.player.x + offsetX - 50}px`;
      this.guidingLight.style.top = `${this.player.y + offsetY - 50}px`;
    }

    requestAnimationFrame(() => this.updateGuidingLight());
  }

  createLoveDemon() {
    const demon = document.createElement('div');
    demon.className = 'love-demon';
    demon.style.left = `${Math.random() * (window.innerWidth - 120)}px`;
    demon.style.top = `${Math.random() * (window.innerHeight - 160)}px`;

    // Create text box and progress bar
    const textBox = document.createElement('div');
    textBox.className = 'love-text-box';
    textBox.style.display = 'none';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'love-progress';
    progressContainer.style.display = 'none';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'love-progress-bar';
    progressContainer.appendChild(progressBar);

    this.room.appendChild(demon);
    this.room.appendChild(textBox);
    this.room.appendChild(progressContainer);

    this.updateLoveDemon(demon, textBox, progressContainer, progressBar);
  }

  updateLoveDemon(demon, textBox, progressContainer, progressBar) {
    if (this.isDead) return;

    const demonRect = demon.getBoundingClientRect();
    const playerCenter = {
      x: this.player.x,
      y: this.player.y
    };

    const demonCenter = {
      x: demonRect.left + demonRect.width / 2,
      y: demonRect.top + demonRect.height / 2
    };

    const distance = Math.hypot(
      playerCenter.x - demonCenter.x,
      playerCenter.y - demonCenter.y
    );

    // Update UI positions
    textBox.style.left = `${demonCenter.x}px`;
    textBox.style.top = `${demonRect.top}px`;
    progressContainer.style.left = `${demonCenter.x}px`;
    progressContainer.style.top = `${demonRect.top}px`;

    const isPlayerWatching = distance < 200;
  
    if (isPlayerWatching && !this.loveDemonAngry) {
      if (!this.isNearLoveDemon) {
        this.isNearLoveDemon = true;
        this.loveDemonTimer = Date.now();
        textBox.textContent = '...?';
        textBox.style.display = 'block';
        progressContainer.style.display = 'none';
        
        // Add delay before showing progress bar
        setTimeout(() => {
          if (this.isNearLoveDemon && textBox.parentElement) {
            textBox.textContent = '... care to stay with me?';
            progressContainer.style.display = 'block';
          }
        }, 1000);
      }

      const timeSpent = Date.now() - this.loveDemonTimer;
      if (timeSpent >= this.requiredLoveTime) {
        textBox.textContent = '... (≧◡≦) ✿';
        progressContainer.style.display = 'none';
        setTimeout(() => {
          if (textBox.parentElement && demon.parentElement) {
            textBox.remove();
            progressContainer.remove();
            demon.remove();
          }
        }, 1500);
        return;
      } else if (progressContainer.style.display !== 'none') {
        const progress = Math.min(100, (timeSpent / this.requiredLoveTime) * 100);
        progressBar.style.width = `${progress}%`;
      }
    } else if (!isPlayerWatching && !this.loveDemonAngry) {
      if (this.isNearLoveDemon) {
        this.isNearLoveDemon = false;
        this.loveDemonTimer = 0;
        progressContainer.style.display = 'none';
        textBox.style.display = 'block';
        textBox.textContent = '...💔';
        
        // Add delay before chasing
        setTimeout(() => {
          if (demon && demon.parentElement) {
            this.loveDemonAngry = true;
            demon.classList.add('angry');
          }
        }, 1000);
      }
    }

    if (this.loveDemonAngry && !isPlayerWatching) {
      const angle = Math.atan2(playerCenter.y - demonCenter.y, playerCenter.x - demonCenter.x);
      const speed = 3.2;
      
      const newX = parseInt(demon.style.left) + Math.cos(angle) * speed;
      const newY = parseInt(demon.style.top) + Math.sin(angle) * speed;
      
      demon.style.left = `${Math.max(0, Math.min(window.innerWidth - 120, newX))}px`;
      demon.style.top = `${Math.max(0, Math.min(window.innerHeight - 160, newY))}px`;
      textBox.style.display = 'block';
      textBox.textContent = 'FXXK YOU!';

      if (distance < 50) {
        this.triggerJumpscare();
        this.takeDamage(35);
      }
    }

    requestAnimationFrame(() => this.updateLoveDemon(demon, textBox, progressContainer, progressBar));
  }

  setupEscMenu() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const escMenu = document.getElementById('esc-menu');
        if (escMenu.classList.contains('active')) {
          this.resumeGame();
        } else {
          this.pauseGame();
        }
      }
    });
  }

  pauseGame() {
    this.gameLoopRunning = false;
    this.insanitySound.pause();
    this.doorBangSound.pause();
    document.getElementById('esc-menu').classList.add('active');
  }

  resumeGame() {
    document.getElementById('esc-menu').classList.remove('active');
    if (this.isPlayingInsanitySound) {
      this.insanitySound.play();
    }
    this.gameLoopRunning = true;
    this.gameLoop();
  }

  triggerHallucination() {
    if (Math.random() < 0.3) {
      // Visual hallucination
      const fake = document.createElement('div');
      fake.className = 'jumpscare';
      fake.style.opacity = '0.3';
      document.body.appendChild(fake);
      setTimeout(() => fake.remove(), 200);
    }
  }

  startDoorBanging() {
    const now = Date.now();
    if (now - this.lastDoorBang < 10000) return; // Prevent spam
    
    this.lastDoorBang = now;
    const door = document.getElementById('door');
    door.style.animation = 'doorBang 0.2s infinite';
    this.doorBangSound.currentTime = 0;
    this.doorBangSound.play();

    setTimeout(() => {
      door.style.animation = '';
      // Spawn random demon after banging
      const demonTypes = [
        () => this.createDemon(),
        () => this.createShadowDemon(),
        () => this.createGhost()
      ];
      const randomDemon = demonTypes[Math.floor(Math.random() * demonTypes.length)];
      randomDemon();
    }, 4000);
  }
}

let game = new Game();

window.restartGame = function() {
  game = new Game();
};

window.respawnPlayer = function() {
  if (game) {
    game.respawn();
  }
};

// Add hotbar item selection
document.querySelectorAll('.hotbar-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    if (!game.isDead) {
      game.selectItem(slot.dataset.item);
    }
  });
});

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(styleSheet);