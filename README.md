%title: Shooting fish in a barrel
%author: Daniel Lee
%date: 2021-11-13

-> # Shooting fish in a barrel <-

-> This presentation explains the basics of the: <-
-> _Actor Model_, <-
-> _Finite State Machines_, <- 
-> and _Event-Driven Architecture_ <-
-> while touching on _Domain Driven Design_. <- 

---

## Setup
```bash
npm install 
```

# The Aquarium Domain

Aquariums are glass boxes full of aquatic organisms.

What are my favourite aquatic organisms?
- Fish
- Snail
- Shrimp
- Duckweed

# Actors

## Fish

Fish spend their time swimming around in search of food. 
When they find food, they eat. After eating, they go to sleep.

## Snail

Snails eat algae on the glass. If there isn't any algae where the snail is, it will move.

## Shrimp

Shrimps eat algae off of the aquarium accessories (rocks, wood, etc...). If the Fish are eating, the shrimp will hide

## Duckweed

Duckweed is a plant that grows along the water's surface. Like other plants, it grows in the presence of sunlight.

---

# Fish State Machines (FSMs)

* Note that FSM typically refers to a Finite State Machine


FSMs can be defined rigorously with mathematical notation (find on Wikipedia), but for the purpose of this talk, we will use the following version:

A finite state machine (FSM) is a collection of **States** with associated **Transitions**. Each **Transition** from a **State** leads to a **State**. Some **Transitions** are triggered by **Events**.

## Fish State Machine:

  ┌──────────┐
  │ sleeping │
  └────┬─────┘
       │
       ▼
  ┌────────────┐
  │  swimming  │
  └────┬───────┘
       │
       ▼
  ┌──────────┐
  │  eating  │
  └──────────┘

---

# Actor Model
## Actor definition
## Event-driven architecture
## A quick aside about messages


# Aquarium Modelled with Actors

# Applications in other domains

---

### References

David Khourshid - Infinitely Better UIs with Finite Automata
https://www.youtube.com/watch?v=VU1NKX6Qkxc

Statecharts: a visual formalism for complex systems
https://www.sciencedirect.com/science/article/pii/0167642387900359/pdf?md5=86d7815b349b738c8ed12b3fdecf4c71&pid=1-s2.0-0167642387900359-main.pdf
