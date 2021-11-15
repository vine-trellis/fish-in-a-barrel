import { send, Actor, interpret } from "xstate";
import { createModel } from "xstate/lib/model";

const sunModel = createModel(
  {
    sunbathers: [] as Actor[],
  },
  {
    events: {
      ADD_SUNBATHER: (data: { sunbather: Actor }) => data,
      SUNRISE: () => ({}),
      SUNSET: () => ({}),
    },
  }
);

const sunMachine = sunModel.createMachine({
  id: "sun",
  context: sunModel.initialContext,
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
    inhabitants: [] as Actor[],
  },
  {
    events: {
      ADD_INHABITANT: (data: { inhabitant: Actor }) => data,
      BROADCAST: (data: { message: any }) => data,
    },
  }
);

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
        ctx.inhabitants.map((i) =>
          send({ type: evt.message.type }, { to: i.id })
        ),
    },
  },
});

const snailModel = createModel(
  {
    aquarium: {} as Actor,
  },
  { events: { NO_FOOD: () => ({}), YES_FOOD: () => ({}) } }
);

const snailMachine = snailModel.createMachine({
  id: "snail",
  context: snailModel.initialContext,
  states: {
    checkingForFood: {
      entry: send({ type: "FOOD_CHECK" }, { to: (ctx) => ctx.aquarium.id }),
      on: {
        NO_FOOD: "moving",
        YES_FOOD: "eating",
      },
    },
    eating: { after: { 100: "checkingForFood" } },
    moving: { after: { 100: "checkingForFood" } },
  },
});


function runAquarium(){
  const aquarium = interpret(aquariumMachine)
}
