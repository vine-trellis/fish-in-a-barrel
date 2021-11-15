import { assign, spawn, send, interpret, actions, createMachine } from "xstate";
import { createModel } from "xstate/lib/model.js";

const { respond } = actions;

const sunMachine = createMachine({
  id: "sun",
  context: {
    sunbathers: [],
  },
  initial: "hiding",
  states: {
    shining: {
      entry: (ctx) =>
        ctx.sunbathers.map((sb) =>
          send({ type: "BROADCAST", message: { type: "SUNRISE" } }, { to: sb })
        ),
      after: { 3000: "hiding" },
      on: { SET: "hiding" },
    },
    hiding: {
      entry: (ctx) =>
        ctx.sunbathers.map((sb) =>
          send({ type: "BROADCAST", message: { type: "SUNSET" } }, { to: sb })
        ),
      after: { 3000: "shining" },
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

const aquariumModel = createModel(
  {
    inhabitants: [],
  },
  {
    events: {
      ADD_INHABITANT: (data) => data,
      BROADCAST: (data) => data,
      CHECK_FOR_FOOD: () => {},
    },
  }
);

const foodDecider = () => (Math.random() > 0.5 ? "YES_FOOD" : "NO_FOOD");

const aquariumMachine = aquariumModel.createMachine({
  id: "aquarium",
  context: aquariumModel.initialContext,
  on: {
    ADD_INHABITANT: {
      actions: aquariumModel.assign({
        inhabitants: (ctx, evt) => [...ctx.inhabitants, spawn(evt.inhabitant)],
      }),
    },
    BROADCAST: {
      actions: (ctx, evt) =>
        ctx.inhabitants.map((i) => send({ type: evt.message.type }, { to: i })),
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

const snailModel = createModel(
  {
    aquarium: null,
  },
  { events: { NO_FOOD: () => ({}), YES_FOOD: () => ({}) } }
);

const snailMachine = snailModel.createMachine({
  id: "snail",
  context: snailModel.initialContext,
  initial: "init",
  states: {
    init: {
      on: {
        SET_AQUARIUM: {
          target: "checkingForFood",
          actions: assign({ aquarium: (_ctx, evt) => spawn(evt.aquarium) }),
        },
      },
    },
    checkingForFood: {
      entry: send({ type: "CHECK_FOR_FOOD" }, { to: (ctx) => ctx.aquarium }),
      on: {
        NO_FOOD: "moving",
        YES_FOOD: "eating",
      },
    },
    eating: { after: { 1000: "checkingForFood" } },
    moving: { after: { 100: "checkingForFood" } },
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
          { target: "replicating", cond: (ctx) => ctx.daysOfSun > 2 },
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
          actions: [assign({ daysOfSun: () => 0 })],
          target: "dormant",
        },
      },
    },
  },
});

const fishMachine = createMachine({
  id: "fish",
  initial: "sleeping",
  states: {
    sleeping: {
      on: { TAP_GLASS: "swimming", SUNRISE: "swimming" },
    },
    swimming: { on: { FEEDING_TIME: "eating", SUNSET: "sleeping" } },
    eating: { on: { NO_MORE_FOOD: "swimming", SUNSET: "sleeping" } },
  },
});

function runAquarium() {
  const sun = interpret(sunMachine)
    .onTransition((state) =>
      console.log(state.machine.id, state.value, state.event.type)
    )
    .start();
  const aquarium = interpret(aquariumMachine)
    .onTransition((state) => console.log(state.machine.id, state.event.type))
    .start();
  const snail = interpret(snailMachine)
    .onTransition((state) =>
      console.log(state.machine.id, state.value, state.event.type)
    )
    .start();
  const shrimp = interpret(shrimpMachine)
    .onTransition((state) =>
      console.log(state.machine.id, state.value, state.event.type)
    )
    .start();
  const duckweed = interpret(duckweedMachine)
    .onTransition((state) =>
      console.log(state.machine.id, state.value, state.event.type)
    )
    .start();
  const fish = interpret(fishMachine)
    .onTransition((state) =>
      console.log(state.machine.id, state.value, state.event.type)
    )
    .start();

  sun.send({ type: "ADD_SUNBATHER", sunbather: aquarium });
  console.log(sun.state.context);
  //aquarium.send({ type: "ADD_INHABITANT", inhabitant: snail });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: shrimp });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: duckweed });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: fish });
  sun.send({ type: "RISE" });
  //snail.send({ type: "SET_AQUARIUM", aquarium });
}

runAquarium();
