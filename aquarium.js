import { assign, spawn, send, interpret, actions, createMachine } from "xstate";
import keypress from "keypress";
import chalk from "chalk";

const EVENT = chalk.bold.blue;
const OLD_STATE = chalk.cyan;
const NEW_STATE = chalk.bold.cyanBright;
const ACTOR = chalk.bold.green;
const SEND_EVENT = chalk.bold.yellow;

keypress(process.stdin);

const { respond } = actions;

const sunMachine = createMachine({
  id: "sun",
  context: {
    sunbathers: [],
  },
  initial: "hiding",
  states: {
    shining: {
      entry: (ctx) => {
        ctx.sunbathers.forEach((l) =>
          l.send({ type: "BROADCAST", message: { type: "SUNRISE" } })
        );
      },
      on: { SET: "hiding" },
    },
    hiding: {
      entry: (ctx) => {
        ctx.sunbathers.forEach((l) =>
          l.send({ type: "BROADCAST", message: { type: "SUNSET" } })
        );
      },
      on: { RISE: "shining" },
    },
  },
  on: {
    ADD_SUNBATHER: {
      actions: assign({
        sunbathers: (ctx, evt) => [...ctx.sunbathers, spawn(evt.sunbather)],
      }),
    },
  },
});

const aquariumMachine = createMachine({
  id: "aquarium",
  context: { inhabitants: [] },
  on: {
    ADD_INHABITANT: {
      actions: assign({
        inhabitants: (ctx, evt) => [...ctx.inhabitants, spawn(evt.inhabitant)],
      }),
    },
    BROADCAST: {
      actions: (ctx, evt) =>
        ctx.inhabitants.map((i) => i.send({ ...evt.message })),
    },
    CHECK_FOR_FOOD: [
      {
        actions: respond({ type: "YES_FOOD" }),
        cond: () => Math.random() > 0.5,
      },
      { actions: respond({ type: "NO_FOOD" }) },
    ],
  },
});

const handMachine = createMachine({
  id: "hand",
  context: { aquarium: null },
  initial: "idle",
  states: {
    idle: {
      on: {
        FEED_FISH: "feedingFish",
      },
    },
    feedingFish: {
      entry: (ctx) =>
        ctx.aquarium.send({
          type: "BROADCAST",
          message: { type: "FEEDING_TIME" },
        }),
      always: "idle",
    },
  },
});

const snailMachine = createMachine({
  id: "snail",
  context: { aquarium: null },
  initial: "checkingForFood",
  states: {
    checkingForFood: {
      entry: send({ type: "CHECK_FOR_FOOD" }, { to: (ctx) => ctx.aquarium }),
      on: {
        NO_FOOD: "moving",
        YES_FOOD: "eating",
      },
    },
    eating: {
      on: { SNAIL_CHECK: "checkingForFood" },
    },
    moving: {
      on: { SNAIL_CHECK: "checkingForFood" },
    },
  },
});

const shrimpMachine = createMachine({
  id: "shrimp",
  context: {},
  initial: "alive",
  states: {
    alive: {
      initial: "foraging",
      states: {
        foraging: {
          on: { FEEDING_TIME: "hiding" },
        },
        hiding: {
          on: { NO_MORE_FOOD: "foraging" },
        },
      },
      on: { EATEN: "dead" },
    },
    dead: {
      on: { "*": { actions: respond({ type: "I_AM_DEAD" }) } },
    },
  },
});

const duckweedMachine = createMachine({
  id: "duckweed",
  context: {
    daysOfSun: 0,
    aquarium: null,
  },
  initial: "dormant",
  states: {
    dormant: {
      on: {
        SUNRISE: [
          { target: "replicating", cond: (ctx) => ctx.daysOfSun > 5 },
          { target: "growing" },
        ],
      },
    },
    growing: {
      on: {
        SUNSET: {
          actions: assign({ daysOfSun: (ctx) => ctx.daysOfSun + 1 }),
          target: "dormant",
        },
      },
    },
    replicating: {
      on: {
        SUNSET: {
          actions: [
            assign({ daysOfSun: () => 0 }),
            (ctx) => {
              return ctx.aquarium.send({
                type: "ADD_INHABITANT",
                inhabitant: interpret(
                  duckweedMachine.withContext({
                    daysOfSun: 0,
                    aquarium: ctx.aquarium,
                  })
                )
                  .onTransition((state) => stateLogger(state))
                  .start(),
              });
            },
          ],
        },
        target: "dormant",
      },
    },
  },
});

const fishMachine = createMachine({
  id: "fish",
  initial: "sleeping",
  meta: { name: "fish" },
  states: {
    sleeping: {
      on: { TAP_GLASS: "swimming", SUNRISE: "swimming" },
    },
    swimming: { on: { FEEDING_TIME: "eating", SUNSET: "sleeping" } },
    eating: { on: { NO_MORE_FOOD: "swimming", SUNSET: "sleeping" } },
  },
});

const stateLogger = (state) => {
  if (state.changed) {
    console.log(
      ACTOR(state.machine.id),
      ":",
      OLD_STATE(state.history.value),
      "+",
      EVENT(state.event.type),
      "=",
      NEW_STATE(state.value)
    );
  }
};

const eventLogger = (actor, event) => {
  console.log(
    SEND_EVENT("Sending Event:"),
    EVENT(event),
    SEND_EVENT("->"),
    ACTOR(actor)
  );
};

function runAquarium() {
  const sun = interpret(sunMachine)
    .onTransition((state) => stateLogger(state))
    .start();
  const aquarium = interpret(aquariumMachine)
    .start();
  const hand = interpret(handMachine.withContext({ aquarium }))
    .onTransition((state) => stateLogger(state))
    .start();
  const snail = interpret(snailMachine.withContext({ aquarium }))
    .onTransition((state) => stateLogger(state))
    .start();
  const shrimp = interpret(shrimpMachine)
    .onTransition((state) => stateLogger(state))
    .start();
  const duckweed = interpret(
    duckweedMachine.withContext({ daysOfSun: 0, aquarium })
  )
    .onTransition((state) => stateLogger(state))
    .start();
  const fish = interpret(fishMachine)
    .onTransition((state) => stateLogger(state))
    .start();

  // initialize our machines
  sun.send({ type: "ADD_SUNBATHER", sunbather: aquarium });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: snail });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: shrimp });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: duckweed });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: fish });

  // listen for keys
  process.stdin.on("keypress", function (ch, key) {
    if ((key && key.name == "q") || (key && key.ctrl && key.name == "c")) {
      console.log(chalk.bold.red("Exiting program"));
      process.exit();
    }
    if (key && key.name == "r") {
      eventLogger("sun", "RISE");
      sun.send({ type: "RISE" });
    }
    if (key && key.name == "s") {
      eventLogger("sun", "SET");
      sun.send({ type: "SET" });
    }
    if (key && key.name == "f") {
      eventLogger("hand", "FEED_FISH");
      hand.send({ type: "FEED_FISH" });
    }
    if (key && key.name == "c") {
      eventLogger("snail", "SNAIL_CHECK");
      snail.send({ type: "SNAIL_CHECK" });
    }
    if (key && key.name == "a") {
      console.log(
        ACTOR("aquarium inhabitants"),
        ":",
        aquarium.state.context.inhabitants.map((i) => i.machine.id)
      );
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

runAquarium();
