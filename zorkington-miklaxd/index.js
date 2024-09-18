
  // Helper function to simulate user input
  function ask(prompt) {
    return new Promise(resolve => {
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
  
      rl.question(prompt, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }
  

  class Room {
    constructor(description, connections, inventory, puzzle) {
      this.description = description;
      this.connections = connections;
      this.inventory = inventory || [];
      this.puzzle = puzzle || null;
    }
  
    displayDescription() {
      console.log(this.description);
    }
  
    solvePuzzle(password) {
      if (this.puzzle && this.puzzle.isSolved(password)) {
        console.log(this.puzzle.successMessage);
        return true;
      } else {
        console.log(this.puzzle.failureMessage);
        return false;
      }
    }
  }
  
  class Puzzle {
    constructor(correctPassword, successMessage, failureMessage) {
      this.correctPassword = correctPassword;
      this.successMessage = successMessage;
      this.failureMessage = failureMessage;
    }
  
    isSolved(password) {
      return password === this.correctPassword;
    }
  }
  
  class Player {
    constructor() {
      this.inventory = [];
    }
  
    displayInventory() {
      if (this.inventory.length === 0) {
        console.log("You are not carrying anything.");
      } else {
        console.log("You are carrying:");
        this.inventory.forEach(item => console.log(item));
      }
    }
  }


  
  // Define rooms
  const startingRoomPuzzle = new Puzzle(
    "12345",
    "Success! The door opens. You enter the foyer and the door shuts behind you.",
    "Bzzzzt! The door is still locked."
  );

  const mainStreet = new Room(
    "182 Main St.\nYou are standing on Main Street between Church and South Winooski. There is a door here. A keypad sits on the handle. On the door is a handwritten sign.",
    ["foyer"],
    [],
    startingRoomPuzzle
  );
  
  const foyer = new Room(
    "You are in a foyer. Or maybe it's an antechamber. Or a vestibule. Or an entryway. Or an atrium. Or a narthex. But let's forget all that fancy vocabulary, and just call it a foyer. Anyways, it's definitely not a mudroom. A copy of the local paper lies in a corner.",
    ["mainStreet","bedroom","bathroom","kitchen"],
    ["paper"]
  );

  const bedroom = new Room(
    "You are in the bedroom, It's so cozy in here. You can't help but start to feel sleepy. You see a nice looking blanket in the corner. Might be nice for later in case you get cold.",
    ["foyer","bathroom"],
    ["blanket"]
  );

  const bathroom = new Room(
    "You are in the bathroom. You spot a porcelain throne that looks like it's been awaiting your arrival for centuries. Surely you can't let it down now, right? You spot a plunger to the side. Best to prepare for the worst.", 
    ["foyer", "bedroom"],
    ["plunger"]
  );

  const kitchen = new Room(
    "You entered the kitchen. You're feeling a bit peckish... You spot some Doritos on the counter. Score! They're even the sweet chili ones...",
    ["foyer"],
    ["Doritos"]
  );

  const basement = new Room(
    "You make your way into the basement. It's unfinished and the concrete floor feels cold on your toes. You don't like this place... There's a conveniently placed flashlight at the foot of the stairs.",
    ["foyer"],
    ["flashlight"]
  );

  
  // beginning here
  let currentRoom = mainStreet;
  let currentPlayer = new Player();
  const rooms = {"mainStreet": mainStreet, "foyer": foyer};
  
  // Command handling loop
  async function gameLoop() {
    let answer = "";
    while (answer.toLowerCase() !== "exit") {
      // console.log("inside game loop", answer, JSON.stringify(currentRoom));
      currentRoom.displayDescription();
      answer = await ask(">_ ");
      await handleCommand(answer);
    }
  }
  
  // Function to handle user commands
  async function handleCommand(command) {
    // console.log("handle command start");
    const [action, target] = command.toLowerCase().split(" ");
  
    switch (action) {
    case "read":
        if (target === "sign" && currentRoom === mainStreet) {
          console.log("The sign says 'Welcome to Burlington Code Academy! Come on up to the third floor. If the door is locked, use the code 12345.'");
        } else {
          console.log(`There is no ${target} to read here.`);
        }
        break;
        
    case "take":
        if (currentRoom.inventory.includes(target)) {
          currentRoom.inventory = currentRoom.inventory.filter(item => item !== target);
          currentPlayer.inventory.push(target);
          console.log(`You pick up the ${target}.`);
        } else {
          console.log(`You can't take the ${target}. That would be selfish. How will other students find their way?`);
        }
        break;

    case "drop":
      if (target && currentPlayer.inventory.includes(target)) { 
        currentPlayer.inventory = currentPlayer.inventory.filter(item => item !== target);
        currentRoom.inventory.push(target);
        console.log(`You drop the ${target}.`);
      } else {
        console.log(`You can't drop ${target}. It's not in your inventory.`);
      }
      break;

    case "open":
        if (target === "door" && currentRoom === mainStreet) {
            console.log("The door is locked. There is a keypad on the door handle.");
        } else {
            console.log(`There is no ${target} to open here.`);
        }
        break;
    case "inventory":
        currentPlayer.displayInventory();
        break;
    case "i":
        currentPlayer.displayInventory();
        break;
   
    case "enter":
      if (target === "code" && currentRoom.puzzle) {
          const password = await ask("Enter the code: ");
          if (currentRoom.solvePuzzle(password)) {
            // Move to the next room
            const nextRoomName = currentRoom.connections[0]; 
            currentRoom = rooms[nextRoomName];
            console.log(`You are now in ${nextRoomName}.`);
          }
      } else {
          console.log(`You can't enter ${target}.`);
      }
      return;

    default:
      console.log(`Sorry, I don't know how to ${action}.`);
      
    }
  }
  

  // Game start! 
  gameLoop();
  

