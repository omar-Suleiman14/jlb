import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("string") character: string = "";
  @type("string") anim: string = "";
  @type("boolean") flipX: boolean = false;
}

export class Heart extends Schema {
  @type("boolean") collected: boolean = false;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Heart }) hearts = new MapSchema<Heart>();
}
