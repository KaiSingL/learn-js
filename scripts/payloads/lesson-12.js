export default {
  id: 12,
  intro:
    "An iterator is the smallest possible protocol: an object with a next method returning { value, done }. Everything called iteration — generators, for...of, spread — compiles down to that method being called until done. Writing the machine by hand shows there is nothing hidden: a closure remembers the position, and Symbol.iterator is the door loop syntax knocks on.",
  concepts: [
    {
      heading: "An iterator is an object with a next method",
      text: "The whole protocol is one method: next() returns { value, done }. value is the current item; done signals the end. Any object with such a next is an iterator — no special class required.",
      purpose: "Watch a hand-written next deliver 0, then 1, then done.",
      code: `var it = {
  index: 0,
  next: function () {
    if (this.index < 2) {
      this.index = this.index + 1;
      return { value: this.index - 1, done: false };
    }
    return { value: undefined, done: true };
  }
};

console.log(it.next()); // -> { value: 0, done: false }
console.log(it.next()); // -> { value: 1, done: false }
console.log(it.next()); // -> { value: undefined, done: true }`,
    },
    {
      heading: "State lives in a closure between calls",
      text: "Between next() calls the iterator must remember where it was. The hand-written way is a closure: the factory creates the state variables, and next reads and writes them. Each factory call produces an independent machine.",
      purpose: "Watch two iterators keep separate positions.",
      code: `function makeIterator() {
  var position = 0;
  return {
    next: function () {
      position = position + 1;
      return { value: position, done: false };
    }
  };
}

var a = makeIterator();
var b = makeIterator();
a.next();
a.next();
console.log(a.next().value); // -> 3 — a's own position
console.log(b.next().value); // -> 1 — b never touched`,
      check: {
        q: "What remembers an iterator's position between .next() calls?",
        options: [
          "The closure — next reads and writes the factory's variables",
          "The engine suspends the function",
          "A cursor stored on the object's prototype",
          "Nothing — each call restarts",
        ],
        answer: 0,
        why: "position lives in makeIterator's scope; every next() call updates it. A generator's suspended frame replaces the closure, but the remembering job is identical.",
      },
    },
    {
      heading: "function* is sugar for the same machine",
      text: "function* and yield do nothing the hand-written machine cannot: the engine rewrites the body into a state machine, and calling the generator returns exactly such an iterator. .next() runs the body to the next yield, then suspends — the sugar exists so you never write the resume bookkeeping.",
      purpose: "Watch the generator produce the same result shape, with no hand-written state.",
      code: `function* numbers() {
  yield 0;
  yield 1;
}

var it = numbers();
console.log(it.next()); // -> { value: 0, done: false }
console.log(it.next()); // -> { value: 1, done: false }
console.log(it.next()); // -> { value: undefined, done: true }`,
    },
    {
      heading: "Symbol.iterator makes an object for...of-able",
      text: "for...of asks one question: does the object have a method under the well-known key Symbol.iterator? That method must return an iterator — returning this if the object is one itself. It is the only bridge between your objects and loop syntax.",
      purpose: "Watch for...of's lookup key handed to a hand-built iterator.",
      code: `var counter = {
  count: 0,
  next: function () {
    this.count = this.count + 1;
    if (this.count <= 3) {
      return { value: this.count, done: false };
    }
    return { value: undefined, done: true };
  }
};
counter[Symbol.iterator] = function () {
  return this; // the object itself is the iterator
};

// for...of looks up exactly this key, then calls next until done:
var iter = counter[Symbol.iterator]();
console.log(iter.next().value); // -> 1
console.log(iter.next().value); // -> 2
// for (var n of counter) would now collect 1, 2, 3`,
    },
    {
      heading: "An infinite iterator never reaches done",
      text: "Nothing in the protocol requires done: an id generator can hand out values forever. The consumer decides when to stop pulling — which is why infinite generators are safe as long as nothing walks them blindly.",
      purpose: "Watch three pulls from a machine that never says done.",
      code: `function idGenerator() {
  var n = 0;
  return {
    next: function () {
      n = n + 1;
      return { value: n, done: false }; // done never arrives
    }
  };
}

var ids = idGenerator();
console.log(ids.next().value); // -> 1
console.log(ids.next().value); // -> 2
console.log(ids.next().value); // -> 3`,
    },
  ],
  quizTags: [
    "An iterator is an object with a next method",
    "function* is sugar for the same machine",
    "An iterator is an object with a next method",
    "Symbol.iterator makes an object for...of-able",
  ],
  extraQuiz: [
    {
      q: "What lesson 2 mechanism lets the manual iterator remember its position between .next() calls?",
      options: [
        "A closure over the factory's state variables",
        "A global variable",
        "The object's prototype",
        "localStorage",
      ],
      answer: 0,
      why: "makeIterator's scope holds position; each next() closes over it and updates it. The same binding survival as the lesson 2 counter.",
      tests: "Closures keep the binding alive",
    },
    {
      q: "var twin = it; (it is an iterator). twin.next() — what happens to it's position?",
      options: [
        "It advances too — = copied the reference; one iterator, two names",
        "Nothing — twin got a copy",
        "The position resets",
        "An error — iterators cannot be aliased",
      ],
      answer: 0,
      why: "The iterator is an object, so = copied the reference. twin.next() and it.next() pull from the same position — two names cannot make two machines.",
      tests: "= copies the reference for objects and arrays",
    },
  ],
};
