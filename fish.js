let fish_machine = {
  sleeping: {
    TAP_GLASS: "swimming",
  },
  eating: {
    NO_MORE_FOOD: "sleeping",
  },
  swimming: {
    FEED: "eating",
  },
};

const transition = (state, action) => {
  const new_state = fish_machine[state][action];
  console.log(`${state} + ${action} = ${new_state}`);
  return new_state;
};

const initialState = "sleeping";

let state = initialState;
console.log(`initial state: ${state}`);
state = transition(state, "TAP_GLASS");
state = transition(state, "FEED");
state = transition(state, "NO_MORE_FOOD");
