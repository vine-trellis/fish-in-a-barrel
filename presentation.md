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

-> # About me <-

name            Daniel Lee
email           daniel@techintern.io
degree          Systems Design Engineering, BASc
job             CTO, Co-founder @ Techintern.io    
languages       [English, Python, Javascript]
fun fact        Went on exchange to Japan in University

fav font        Cozette
fav food        Pizza
fav cat         Cleo
fav fish        Nurse Shark

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

# Aquarium Modelled with Actors

Fortunately, for this presentation, FSMs and the Actor model
work well together.

Next, a diagram of how the Aquarium could be modelled with Actors.
Then, a code example of how the Aquarium could be implemented.

---

-> ## Diagram of Aquarium System <-

```
                                            ┌──────┐
                                         ┌─►│ Fish │
                                         │  └──────┘
                                         │
            ┌─────┐                      │  ┌────────┐
            │ Sun ├────┐                 ├─►│ Shrimp │
            └─────┘    │  ┌──────────┐   │  └────────┘
                       ├─►│ Aquarium ├───┤        
            ┌───────┐  │  └──────────┘   │  ┌───────┐
            │ Hand  ├──┘        ▲        ├─►│ Snail ├────┐
            └───────┘           │        │  └───────┘    │
                                │        │               │
                                │        │  ┌──────────┐ │
                                │        └─►│ Duckweed ├─┤
                                │           └──────────┘ │
                                │                        │
                                └────────────────────────┘

```

---

## Event-driven architecture

The actors in the Aquarium pass messages to one another,
and process messages as the primary means of work.

This event emitting and receiving pattern helps keep code organized,
and most importantly *easy to reason about*.


---

## A quick aside about messages

An example of event driven architecture is the *message queue* or *message broker*.

Message queues come in many flavours, 
but typically they are *internal* or *external*.

*Internal* message queues could be event buses that manage the behaviour of
a single service.

*External* messages queues are typically used to transport messages between
different services.

---

# Applications in other domains

Though today we talked about an Aquarium, and a few other concepts:

- Finite State Machines
- Actor Model
- Event-driven Architecture

Although it's unlikely your future work will involve fish,
the above concepts lend themselves readily to many other domains and projects.

Even if the popular frameworks and languages change, 
being *reliable*, *explainable*, and *flexible* will never go stale!


---

-> ## Flask web server <-
For instance, a web server exposing an API may be laid out as follows:
```


                                   ┌──────────────┐
                                   │              │
                                   │ ┌──────────┐ │
    ┌───────┐                      │ │ Handler0 │ │
    │ Flask ├──┐                   │ └──────────┘ │     ┌──────────┐
    └───────┘  │  ┌────────────┐   │      .       ├────►│          │
               ├─►│ MessageBus ├──►│      .       │     │ Postgres │
    ┌───────┐  │  └────────────┘   │      .       │◄────┤          │
    │ Redis ├──┘                   │ ┌──────────┐ │     └──────────┘
    └───────┘                      │ │ HandlerN │ │
        ▲                          │ └──────────┘ │
        │                          │              │
        │                          └───────┬──────┘
        │                                  │
        └──────────────────────────────────┘

```
---

-> Looking for an internship? <-
-> *www.techintern.io* <-


-> We also have full-time opportunities <-

---

-> Thank you <-


