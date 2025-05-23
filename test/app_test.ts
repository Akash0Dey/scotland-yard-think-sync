import { createApp } from "../src/app.ts";
import { describe, it } from "testing";
import { assertEquals } from "assert";
import { PlayerRegistry } from "../src/models/players.ts";
import { Rooms } from "../src/models/rooms.ts";
import { Bindings } from "../src/models/types.ts";
import { GameController } from "../src/models/game_controller.ts";

describe("ensure Authentication", () => {
  it("should get redirected to the login page because player is not logined", async () => {
    const bindings: Bindings = {
      playerRegistry: new PlayerRegistry(),
      rooms: new Rooms(),
      controller: new GameController(),
    };
    const app = createApp(bindings);
    const res = await app.request("/");

    assertEquals(res.status, 303);
    assertEquals(res.headers.get("location"), "/login");
  });

  it("should land the user on lobby page if logged in", async () => {
    const playerRegistry = new PlayerRegistry();
    playerRegistry.createPlayer("Shalini");

    const bindings: Bindings = {
      playerRegistry,
      rooms: new Rooms(),
      controller: new GameController(),
    };

    const app = createApp(bindings);
    const req = new Request("http://localhost/", {
      headers: {
        cookie: `playerId=Shalini`,
      },
    });

    const res = await app.request(req);
    await res.text();

    assertEquals(res.status, 200);
  });
});
