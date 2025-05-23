import { describe, it } from "testing";
import { assert, assertEquals, assertFalse } from "assert";
import { mapToObject } from "../src/game_utils.ts";
import { basicMap } from "../src/maps/game_map.ts";
import {
  GameMap,
  RandomIndex,
  Role,
  Roles,
  Scenario,
  Ticket,
  Tickets,
  Transport,
} from "../src/models/types.ts";
import { ScotlandYard } from "../src/models/scotland.ts";

const setUpDefaultGame = (): [ScotlandYard, Set<string>] => {
  const players = new Set(["a", "b", "c", "d", "e", "f"]);
  return [new ScotlandYard([...players], basicMap), players];
};

const random: RandomIndex = () => 1;

describe("test playerNames", () => {
  it("should provide playerNames", () => {
    const [sy, players] = setUpDefaultGame();

    assertEquals(sy.getPlayers(), [...players]);
  });
});

describe("test assignRole", () => {
  it("should assign role", () => {
    const [sy, players] = setUpDefaultGame();
    const roles = {
      MrX: "a",
      Red: "b",
      Blue: "c",
      Green: "d",
      Yellow: "e",
      Purple: "f",
    };

    sy.assignRole(roles);

    const assignedRoles = sy.getRoles();

    assertEquals(sy.getPlayers(), [...players]);
    assertEquals(mapToObject(assignedRoles), roles);
  });

  it("should assign multiple role to player", () => {
    const players = ["test1", "test2", "test3"];

    const game = new ScotlandYard(players);
    game.assignRole();
    const expected = {
      MrX: "test1",
      Red: "test2",
      Blue: "test2",
      Green: "test2",
      Yellow: "test3",
      Purple: "test3",
    };

    assertEquals(game.getGameState("test1").roles, expected);
  });
});

describe("ticket distribution", () => {
  it("should provide detective with proper tickets", () => {
    const [sy] = setUpDefaultGame();
    const roles: Roles = { [Role.Red]: "a" };

    sy.assignRole(roles);
    sy.distributeTickets();

    const expected = {
      MrX: { Bus: 3, Taxi: 4, Metro: 3, Wild: 5, "2x": 2 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const assignedTickets = sy.getTickets();

    assertEquals(mapToObject<Tickets>(assignedTickets), expected);
  });
});

describe("assignStartingPositions", () => {
  it("should assign position based on random function", () => {
    const random: RandomIndex = () => 0;

    const players = new Set([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);

    const game = new ScotlandYard([...players], basicMap);

    game.assignRole();
    game.assignStartingPositions(random);

    const actual = game.getCurrentPosition();

    const expected = {
      MrX: 181,
      Red: 182,
      Blue: 183,
      Green: 184,
      Yellow: 185,
      Purple: 186,
    };

    assertEquals(mapToObject(actual), expected);
  });

  it("should handle if random number is above role number", () => {
    const random: RandomIndex = () => 10;

    const players = new Set([
      "test1",
      "test2",
      "test3",
      "test4",
      "test5",
      "test6",
    ]);

    const game = new ScotlandYard([...players], basicMap);

    game.assignRole();
    game.assignStartingPositions(random);

    const actual = game.getCurrentPosition();

    const expected = {
      Blue: 193,
      Green: 181,
      Purple: 185,
      Red: 192,
      Yellow: 183,
      MrX: 191,
    };

    assertEquals(mapToObject(actual), expected);
  });
});

describe("game state", () => {
  it("should provide tickets in the game state for detective", () => {
    const [sy] = setUpDefaultGame();
    const roles = {
      Red: "b",
      MrX: "a",
      Blue: "c",
      Yellow: "d",
      Purple: "e",
      Green: "f",
    };

    sy.assignRole(roles);
    sy.distributeTickets();

    const expected = {
      MrX: { "2x": 2, Bus: 3, Metro: 3, Taxi: 4, Wild: 5 },
      Red: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Blue: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Green: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Yellow: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
      Purple: { Bus: 8, Taxi: 10, Metro: 4, Wild: 0, "2x": 0 },
    };

    const { tickets } = sy.getGameState(Role.Blue);

    assertEquals(tickets, expected);
  });

  it("should provide starting positions in game state for detective", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    const expected = {
      Red: 3,
      Blue: 4,
      Green: 5,
      Yellow: 6,
      Purple: 1,
      MrX: null,
    };
    const { positions } = game.getGameState(Role.Purple);

    assertEquals(positions, expected);
  });

  it("should provide empty starting positions if starting position is not assigned", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();

    const { positions } = sy.getGameState(Role.Red);

    assertEquals(positions, {});
  });

  it("should contain current role in game state", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();

    const { currentRole } = sy.getGameState(Role.Blue);

    assertEquals(currentRole, "MrX");
  });

  it("should provide only detectives positions", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions(random);

    const { positions } = sy.getGameState("b");
    const expected = {
      MrX: null,
      Red: 183,
      Blue: 184,
      Green: 185,
      Yellow: 186,
      Purple: 187,
    };

    assertEquals(positions, expected);
  });

  it("should provide all players position for Mr.X", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions(random);

    const { positions } = sy.getGameState("a");
    const expected = {
      MrX: 182,
      Red: 183,
      Blue: 184,
      Green: 185,
      Yellow: 186,
      Purple: 187,
    };

    assertEquals(positions, expected);
  });

  it("should reveal mrX's location in a reveal second turn", () => {
    const players = ["a", "b", "c", "d", "e", "f"];
    const game = new ScotlandYard(players, basicMap, 4, [2, 3]);

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.useTicket(Ticket.Yellow, 181);
    game.useTicket(Ticket.Yellow, 182);
    game.useTicket(Ticket.Yellow, 183);
    game.useTicket(Ticket.Yellow, 184);
    game.useTicket(Ticket.Red, 185);
    game.useTicket(Ticket.Yellow, 186);

    game.useTicket(Ticket.Yellow, 100);

    const { positions, lastSeen } = game.getGameState("b");

    const expected = {
      MrX: 100,
      Red: 182,
      Blue: 183,
      Green: 184,
      Yellow: 185,
      Purple: 186,
    };

    assertEquals(positions, expected);
    assertEquals(lastSeen, 100);
  });
});

describe("change turn", () => {
  it("should be next player", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions(random);
    const nextPlayer = sy.changePlayer();

    assertEquals(nextPlayer, "Red");
  });

  it("should rotate the turn to the next player in circular order", () => {
    const [sy] = setUpDefaultGame();
    sy.assignRole();
    sy.distributeTickets();
    sy.assignStartingPositions(random);
    sy.changePlayer();
    sy.changePlayer();
    sy.changePlayer();
    sy.changePlayer();
    sy.changePlayer();

    const nextPlayer = sy.changePlayer();

    assertEquals(nextPlayer, "MrX");
  });
});

describe("possible stations", () => {
  it("should return possible stations if possible", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6, 7],
      routes: {
        2: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    const actual = game.possibleStations();

    const expected = [{ to: 1, tickets: [Ticket.Green, Ticket.Black] }];

    assertEquals(actual, expected);
  });

  it("should return no station if not possible", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );
    game.assignRole();
    game.assignStartingPositions(random);
    game.distributeTickets();

    const actual = game.possibleStations();

    assertEquals(actual, []);
  });

  it("should add the extra tickets for mr.x if he has black ticket", () => {
    const route = [{ to: 20, mode: Transport.Bus }];
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: { 2: route },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    const actual = game.possibleStations();
    const expected = [{ to: 20, tickets: [Ticket.Green, Ticket.Black] }];

    assertEquals(actual, expected);
  });
});

describe("positionOfDetectives", () => {
  it("should provide positions of all detectives", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    assertEquals(game.getDetectivePositions(), [3, 4, 5, 6, 1]);
  });

  it("should not provide positions of all detectives when station is not assigned", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    assertEquals(game.getDetectivePositions(), []);
  });
});

describe("getValidRoutes", () => {
  it("should return valid routes", () => {
    const players = ["test1", "test2", "test3", "test4", "test5", "test6"];
    const route = [{ to: 1, mode: Transport.Bus }];
    const fakeMap: GameMap = {
      startingPositions: [1, 2],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };
    const game = new ScotlandYard(players, fakeMap);
    game.assignRole();
    game.distributeTickets();

    assertEquals(game.validRoutes(1), route);
  });

  it("should return empty array if there is no valid route", () => {
    const players = ["test1", "test2", "test3", "test4", "test5", "test6"];

    const fakeMap: GameMap = {
      startingPositions: [1, 2],
      routes: {
        1: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(players, fakeMap);
    game.assignRole();
    game.distributeTickets();

    assertEquals(game.validRoutes(10), []);
  });
});

describe("isMrXTurn", () => {
  it("should provide true if its MrX turn", () => {
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      basicMap,
    );
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    assert(game.isMrXTurn());
  });

  it("should provide false if its not MrX turn", () => {
    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      basicMap,
    );
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    assert(game.isMrXTurn());
    game.changePlayer();

    assertFalse(game.isMrXTurn());
  });
});

const makeGame = (map: GameMap = basicMap, round = 25, reveal = [1, 3]) => {
  const game = new ScotlandYard(
    ["1", "2", "3", "4", "5", "6"],
    map,
    round,
    reveal,
  );

  game.assignRole();
  const random: RandomIndex = () => 1;
  game.assignStartingPositions(random);
  game.distributeTickets();

  return game;
};

describe("useTicket", () => {
  it("using a valid ticket and destination should change the turn", () => {
    const game = makeGame(basicMap);

    assert(game.useTicket(Ticket.Yellow, 181));
    const expected = {
      MrX: 181,
      Red: 183,
      Blue: 184,
      Green: 185,
      Yellow: 186,
      Purple: 187,
    };

    const positions = game.getCurrentPosition();
    const gameState = game.getGameState("1");

    assertEquals(mapToObject(positions), expected);
    assertEquals(gameState.currentRole, "Red");
    assertEquals(gameState.tickets.MrX.Taxi, 3);
  });

  it("should reject move when ticket type does not match route", () => {
    const game = makeGame(basicMap);
    assertFalse(game.useTicket(Ticket.Red, 182));
  });

  it("should not allow player to use a ticket they don't own", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 1, 2, 1, 1, 1],
      routes: {
        1: [{ to: 2, mode: Transport.Ferry }],
        2: [{ to: 100, mode: Transport.Ferry }],
      },
    };

    const game = makeGame(fakeMap);
    game.changePlayer();

    assertFalse(game.useTicket(Ticket.Black, 2));
  });

  it("should not allow moving to a non-adjacent location", () => {
    const game = makeGame(basicMap);

    assertFalse(game.useTicket(Ticket.Yellow, 999));
  });
});

describe("isMrXCaught", () => {
  it("should provide true if MrX caught", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, destination); // Detective 1
    assert(game.isMrXCaught());
  });

  it("should provide true if MrX caught by second detective", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 8, mode: Transport.Taxi }],
        4: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, 8); // Detective 1
    game.useTicket(Ticket.Yellow, destination); // Detective 2
    assert(game.isMrXCaught());
  });

  it("should provide false if MrX not caught", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    game.useTicket(Ticket.Yellow, 2); // MrX
    assertFalse(game.isMrXCaught());
  });

  it("should provide false if position is not assigned", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = new ScotlandYard(["1", "2", "3", "4", "5", "6"], fakeMap);
    game.assignRole();

    assertFalse(game.isMrXCaught());
  });
});

describe("checkWinner", () => {
  it("should return true if a detective caught MrX", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
        4: [{ to: 3, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, destination); // Detective 1

    assert(game.isGameOver());
    assertEquals(game.getWinner(), "Detective");
  });

  it("should return false if detective not caught mr X", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    const destination = 2;
    game.useTicket(Ticket.Yellow, destination); // MrX
    game.useTicket(Ticket.Yellow, 6); // Detective 1

    assertFalse(game.isGameOver());
    assertEquals(game.getWinner(), null);
  });
});

describe("Increment mrX tickets", () => {
  it("should reduce the ticket use by mrX", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    game.useTicket(Ticket.Yellow, 2);
    const updatedTickets = game.getTickets().get(Role.MrX);

    const expected = { Bus: 3, Taxi: 3, Metro: 3, Wild: 5, "2x": 2 };
    assertEquals(updatedTickets, expected);
  });

  it("should reduce the ticket use by player and increment in mrX", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap);
    game.useTicket(Ticket.Yellow, 2);
    game.useTicket(Ticket.Yellow, 1);
    game.useTicket(Ticket.Yellow, 2);
    const updatedTickets = game.getTickets().get(Role.MrX);

    const expected = { Bus: 3, Taxi: 5, Metro: 3, Wild: 5, "2x": 2 };
    assertEquals(updatedTickets, expected);
  });
});

describe("declareWinner", () => {
  it("should declare Detective as winner when MrX is captured", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 2, mode: Transport.Taxi }],
        4: [{ to: 3, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap, 1);

    const destination = 2;
    game.useTicket(Ticket.Yellow, destination);
    game.useTicket(Ticket.Yellow, destination);

    assertEquals(game.declareWinner(), "Detective");
  });

  it("should declare Detective as winner when MrX is trapped till his turn", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [],
        3: [{ to: 2, mode: Transport.Taxi }],
        4: [{ to: 3, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap, 5);

    assertEquals(game.declareWinner(), "Detective");
  });

  it("should declare Mr.X as winner when he escapes for one turn", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [{ to: 3, mode: Transport.Taxi }],
        5: [{ to: 4, mode: Transport.Taxi }],
        6: [{ to: 5, mode: Transport.Taxi }],
        7: [{ to: 6, mode: Transport.Taxi }],
        2: [{ to: 10, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap, 1);

    game.useTicket(Ticket.Yellow, 2); // MrX
    game.useTicket(Ticket.Yellow, 1); // Detective 1
    game.useTicket(Ticket.Yellow, 3); // Detective 2
    game.useTicket(Ticket.Yellow, 4); // Detective 3
    game.useTicket(Ticket.Yellow, 5); // Detective 4
    game.useTicket(Ticket.Yellow, 6); // Detective 5

    assertEquals(game.declareWinner(), "MrX");
  });

  it("should declare Mr.X as winner when detectives can't move", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
      },
    };

    const game = makeGame(fakeMap, 4);

    game.useTicket(Ticket.Yellow, 2);

    assertEquals(game.declareWinner(), "MrX");
  });
});

describe("has black Tickets", () => {
  it("should return true if the player has black tickets", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6, 7],
      routes: {
        2: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    assert(game.hasBlackTickets());
  });
  it("should return false if the player has blak tickets", () => {
    const fakeMap: GameMap = {
      startingPositions: [1, 2, 3, 4, 5, 6, 7],
      routes: {
        2: [{ to: 1, mode: Transport.Bus }],
      },
    };

    const game = new ScotlandYard(
      ["test1", "test2", "test3", "test4", "test5", "test6"],
      fakeMap,
    );

    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    game.changePlayer();
    assertFalse(game.hasBlackTickets());
  });
});

describe("should save travel history", () => {
  it("should update Mrx's travel log if i am Mr.X", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    game.useTicket(Ticket.Yellow, 181);

    const { transport } = game.getGameState("1");

    assertEquals(transport, [Ticket.Yellow]);
  });

  it("should update Mrx's travel log even if i am detective", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    game.useTicket(Ticket.Green, 181);

    const { transport } = game.getGameState("1");

    assertEquals(transport, [Ticket.Green]);
  });
});

describe("use 2X ticket", () => {
  it("should not change turn if using 2x", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.enable2X();
    game.useTicket(Ticket.Yellow, 195);

    const state = game.getGameState("2");
    assertEquals(state.currentRole, Role.MrX);
    assertEquals(state.tickets[Role.MrX]["2x"], 1);
  });

  it("should change turn after using 2x", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.useTicket(Ticket.Yellow, 195);
    game.useTicket(Ticket.Yellow, 181);

    const state = game.getGameState("2");
    assertEquals(state.currentRole, Role.Red);
  });

  it("should not be able to use 2x consicutively", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.useTicket(Ticket.Yellow, 195);
    const actual = game.useTicket(Ticket.Yellow, 181);

    assertFalse(actual);
  });

  it("should not give 2x option is i am using 2x", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.enable2X();
    game.useTicket(Ticket.Yellow, 195);
    const actual = game.possibleStations();

    const expected = [{ to: 181, tickets: [Ticket.Yellow, Ticket.Black] }];

    assertEquals(actual, expected);
  });

  it("should not enable 2x mode even if tried twice", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.enable2X();
    game.enable2X();

    assertFalse(game.enable2X());
  });

  it("should reveal and play 2x if it is time to reaveal", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    game.enable2X();
    game.useTicket(Ticket.Yellow, 195);

    assertEquals(game.getGameState("2").lastSeen, 195);
    game.useTicket(Ticket.Yellow, 181);

    game.useTicket(Ticket.Yellow, 181);
    assertEquals(game.getGameState("2").currentRole, Role.Red);
  });

  it("should be game over if before last round mrX plays 2x", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [
          { to: 3, mode: Transport.Taxi },
          { to: 3, mode: Transport.Ferry },
        ],
        5: [{ to: 4, mode: Transport.Taxi }],
        6: [{ to: 5, mode: Transport.Taxi }],
        7: [{ to: 6, mode: Transport.Taxi }],
        2: [{ to: 100, mode: Transport.Metro }],
      },
    };

    const game = makeGame(fakeMap, 1);
    assert(game.enable2X());

    assert(game.useTicket(Ticket.Yellow, 2));
    assert(game.useTicket(Ticket.Black, 100));

    assertEquals(game.declareWinner(), "MrX");
  });

  it("should be game over if last round is 2x and all players played", () => {
    const fakeMap: GameMap = {
      startingPositions: [2, 1, 3, 4, 5, 6, 7],
      routes: {
        1: [{ to: 2, mode: Transport.Taxi }],
        3: [{ to: 1, mode: Transport.Taxi }],
        4: [
          { to: 3, mode: Transport.Taxi },
          { to: 3, mode: Transport.Ferry },
        ],
        5: [{ to: 4, mode: Transport.Taxi }],
        6: [{ to: 5, mode: Transport.Taxi }],
        7: [{ to: 6, mode: Transport.Taxi }],
        2: [{ to: 100, mode: Transport.Metro }],
        100: [{ to: 10, mode: Transport.Metro }],
      },
    };

    const game = makeGame(fakeMap, 2);
    assert(game.enable2X());

    assert(game.useTicket(Ticket.Yellow, 2));
    assert(game.useTicket(Ticket.Black, 100));

    assert(game.useTicket(Ticket.Yellow, 1));
    assert(game.useTicket(Ticket.Yellow, 3));
    assert(game.useTicket(Ticket.Yellow, 4));
    assert(game.useTicket(Ticket.Yellow, 5));
    assert(game.useTicket(Ticket.Yellow, 6));

    assertEquals(game.declareWinner(), "MrX");
  });
});

describe("can accept 2x", () => {
  it("should accept 2x card if not using", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);

    assert(game.enable2X());
  });

  it("should not accept 2x card if using", () => {
    const game = makeGame();
    game.assignRole();
    game.distributeTickets();
    game.assignStartingPositions(random);
    game.enable2X();

    game.useTicket(Ticket.Yellow, 195);

    assertFalse(game.enable2X());
  });
});

describe("ScotlandYard - loadScenario", () => {
  it("should load a valid scenario correctly", () => {
    const scenario: Scenario = {
      players: ["Player1", "Player2", "Player3"],
      turn: 5,
      currentPositions: {
        MrX: 100,
        Red: 101,
        Blue: 102,
        Green: 103,
        Yellow: 104,
        Purple: 105,
      },
      tickets: {
        MrX: { Bus: 5, Taxi: 5, Metro: 5, Wild: 5, "2x": 2 },
        Red: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Blue: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Green: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Yellow: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Purple: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      },
      currentRole: Role.MrX,
      currentTurn: 1,
      logs: [{ to: 100, mode: Ticket.Black }],
    };

    const game = ScotlandYard.loadScenario(scenario);

    assertEquals(game.getCurrentPosition().get(Role.MrX), 100);
    assertEquals(game.getCurrentPosition().get(Role.Red), 101);
    assertEquals(game.getCurrentPosition().get(Role.Blue), 102);

    assertEquals(game.getTickets().get(Role.MrX)?.Bus, 5);
    assertEquals(game.getTickets().get(Role.Red)?.Taxi, 3);

    assertEquals(game.getCurrentRole(), Role.MrX);
    assertEquals(game.getCurrentTurn(), 1);

    assertEquals(game.getMrXHistoryLog(), [{ to: 100, mode: Ticket.Black }]);
  });

  it("should handle missing optional fields gracefully", () => {
    const partialScenario: Scenario = {
      players: ["Player1", "Player2", "Player3"],
      turn: 5,
      currentPositions: {
        MrX: 100,
        Red: 101,
        Blue: 102,
        Green: 103,
        Yellow: 104,
        Purple: 105,
      },
      tickets: {
        MrX: { Bus: 5, Taxi: 5, Metro: 5, Wild: 5, "2x": 2 },
        Red: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Blue: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Green: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Yellow: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
        Purple: { Bus: 3, Taxi: 3, Metro: 3, Wild: 0, "2x": 0 },
      },
      currentRole: Role.MrX,
      currentTurn: 0,
      logs: [],
    };

    const game = ScotlandYard.loadScenario(partialScenario);

    assertEquals(game.getCurrentPosition().get(Role.MrX), 100);

    assertEquals(game.getMrXHistoryLog(), []);
  });
});
