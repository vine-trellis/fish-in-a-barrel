import { assign, spawn, send, interpret, actions } from "xstate";
import { createModel } from "xstate/lib/model.js";

const { respond } = actions;
const sunModel = createModel(
  {
    sunbathers: [],
  },
  {
    events: {
      ADD_SUNBATHER: ({ sunbather }) => sunbather,
      SUNRISE: () => ({}),
      SUNSET: () => ({}),
    },
  }
);

const sunMachine = sunModel.createMachine({
  id: "sun",
  context: sunModel.initialContext,
  initial: "hiding",
  states: {
    shining: {
      on: { SUNSET: "hiding" },
    },
    hiding: {
      on: { SUNRISE: "shining" },
    },
  },
  on: {
    ADD_SUNBATHER: {
      actions: sunModel.assign({
        sunbathers: (ctx, evt) => [...ctx.sunbathers, evt.sunbather],
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
        inhabitants: (ctx, evt) => [...ctx.inhabitants, evt.inhabitant],
      }),
    },
    BROADCAST: {
      actions: (ctx, evt) =>
        ctx.inhabitants.map((i) => i.send({ type: evt.message.type })),
    },
    CHECK_FOR_FOOD: {
      actions: respond({ type: foodDecider() }),
    },
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
    eating: { after: { 100: "checkingForFood" } },
    moving: { after: { 100: "checkingForFood" } },
  },
});

function runAquarium() {
  const sun = interpret(sunMachine)
    .onTransition((state) => console.log(state.machine.id, state.value))
    .start();
  const aquarium = interpret(aquariumMachine)
    .onTransition((state) => console.log(state.machine.id, state.event.type))
    .start();
  const snail = interpret(snailMachine.withContext({ aquarium }))
    .onTransition((state) =>
      console.log(state.machine.id, state.value, state.event.type)
    )
    .start();

  sun.send({ type: "ADD_SUNBATHER", sunbather: aquarium });
  aquarium.send({ type: "ADD_INHABITANT", inhabitant: snail });
  snail.send({ type: "SET_AQUARIUM", aquarium });
}
runAquarium();
