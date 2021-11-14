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

-> # The Aquarium Domain <-

Aquariums are glass boxes full of aquatic organisms.

What are my favourite aquatic organisms?

- Fish
- Snail
- Shrimp
- Duckweed

---

# Actors

## Fish

Fish spend their time swimming around in search of food.
When they find food, they eat. After eating, they go back to swimming.
Fish wake up at sunrise and go to sleep at sundown.

## Snail

Snails eat algae on the glass.
If there isn't any algae where the snail is, it will move.
Snails don't ever sleep.

## Shrimp

Shrimps eat algae off of the aquarium accessories (rocks, wood, etc...).
If the Fish are eating, the shrimp will hide.

## Duckweed

Duckweed is a plant that grows along the water's surface.
Like other plants, it grows in the presence of sunlight.

---

# Fish State Machines (FSMs)

- Note that FSM typically refers to a Finite State Machine

FSMs can be defined rigorously with mathematical notation (find on Wikipedia),
but for the purpose of this talk, we will use the following version:

A finite state machine (FSM) is a collection of **States** with associated **Transitions**.
Each **Transition** from a **State** leads to a **State**.
Some **Transitions** are triggered by **Events**.

---

## Fish State Machine:

| input ╲ current state | sleeping | swimming | eating   |
| --------------------- | -------- | -------- | -------- |
| TAP_GLASS             | swimming |          |          |
| SUNRISE               | swimming |          |          |
| FEED                  |          | eating   |          |
| NO_MORE_FOOD          |          |          | swimming |
| SUNSET                |          | sleeping | sleeping |

---

-> # Actor Model <-

"Everything is an actor"

Who are my favourite actors?
- Mads Mikkelsen
- Leonardo DiCaprio

---

# Actor definition

An actor is a unit that can do the following actions concurrently:

- send messages to other actors
- spawn new actors
- decide how to respond to the next message it receives

---

## Event-driven architecture

## A quick aside about messages

# Aquarium Modelled with Actors

# Applications in other domains

---

### References

David Khourshid - Infinitely Better UIs with Finite Automata
https://www.youtube.com/watch?v=VU1NKX6Qkxc

Statecharts: a visual formalism for complex systems
