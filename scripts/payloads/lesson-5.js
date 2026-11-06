export default {
  id: 5,
  intro:
    "A class is syntax sugar for two plain moves: a constructor function that fills this, and methods assigned to its prototype so every instance shares one copy. new runs those moves; the prototype chain lets one constructor reuse another's. None of it is hidden — all of it can be written by hand.",
  concepts: [
    {
      heading: "new builds the object in four steps",
      text: "new Dog(\"Rex\") creates a fresh object, links it to Dog.prototype, calls Dog with this set to that object, and — unless the constructor returns its own object — hands the new object back. Everything the constructor writes on this lands on the fresh object.",
      purpose: "Watch the constructor's this become the returned instance.",
      code: `function Dog(name) {
  // new made the object and set this to it:
  this.name = name;
  this.tricks = [];
}

var rex = new Dog("Rex");
console.log(rex.name);   // -> Rex
console.log(rex.tricks); // -> [] — the constructor built this one
console.log(typeof rex); // -> object`,
      check: {
        q: "What does new Dog(\"Rex\") do before running the constructor body?",
        options: [
          "Creates an empty object linked to Dog.prototype and sets this to it",
          "Copies Dog.prototype onto the new object",
          "Calls Dog once to warm it up",
          "Creates a string with the name",
        ],
        answer: 0,
        why: "Four steps: fresh object, prototype link, constructor call with this bound, and the object returned. The body's writes on this land on that fresh object.",
      },
    },
    {
      heading: "Prototype methods are shared, not copied",
      text: "A method assigned to Dog.prototype exists once. Instances do not own it — reaching rex.bark walks the prototype link and finds it on the prototype. hasOwnProperty makes the split visible: name is on rex, bark is not.",
      purpose: "Watch the instance own its data but borrow its method.",
      code: `function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function () {
  return "Woof " + this.name;
};

var rex = new Dog("Rex");
console.log(rex.bark()); // -> Woof Rex — found through the prototype link
console.log(rex.hasOwnProperty("name")); // -> true — own property
console.log(rex.hasOwnProperty("bark")); // -> false — lives on the prototype`,
    },
    {
      heading: "Inheritance: link prototypes, then repair the constructor",
      text: "Student inherits by calling the parent constructor for its own state (Person.call(this, name)) and replacing its prototype with an object linked to the parent's (Object.create(Person.prototype)). The constructor property is then repaired, because replacing the prototype destroyed it.",
      purpose: "Watch a Student answer both a Person call and its own, through one chain.",
      code: `function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  return "Hi, " + this.name;
};

function Student(name, subject) {
  Person.call(this, name); // parent state, with this = the new student
  this.subject = subject;
}
Student.prototype = Object.create(Person.prototype); // link the chain
Student.prototype.constructor = Student; // repair the broken pointer
Student.prototype.study = function () {
  return this.name + " studies " + this.subject;
};

var s = new Student("Mira", "math");
console.log(s.sayHi()); // -> Hi, Mira — found up the chain
console.log(s.study()); // -> Mira studies math`,
      check: {
        q: "Why repair Student.prototype.constructor after Object.create?",
        options: [
          "Replacing the prototype removed the constructor property, so it points at Person",
          "Object.create requires a constructor to work",
          "The repair gives Student new methods",
          "Without it, new Student returns a Person",
        ],
        answer: 0,
        why: "Student.prototype = Object.create(...) wiped the old prototype, including its constructor pointer. Setting it back keeps Student.prototype.constructor answering Student.",
      },
    },
    {
      heading: "instanceof walks the same chain",
      text: "instanceof does not compare constructors — it checks whether the constructor's prototype appears somewhere in the object's prototype chain. A Student is an instance of both Student and Person because both prototypes sit on one chain.",
      purpose: "Watch one object satisfy three instanceof checks through a single chain.",
      code: `function Person(name) {
  this.name = name;
}
function Student(name, subject) {
  Person.call(this, name);
  this.subject = subject;
}
Student.prototype = Object.create(Person.prototype);

var s = new Student("Mira", "math");
console.log(s instanceof Student); // -> true — direct link
console.log(s instanceof Person); // -> true — Person.prototype is up the chain
console.log(s instanceof Object); // -> true — the chain ends there`,
      check: {
        q: "Why is s instanceof Person true even though Student built s?",
        options: [
          "Student.prototype links to Person.prototype, so the chain passes through it",
          "Person.call copied Person's methods onto s",
          "instanceof compares constructor names",
          "Student extends Person internally",
        ],
        answer: 0,
        why: "instanceof walks s's prototype chain looking for Person.prototype. Object.create(Person.prototype) placed exactly that object one step up the chain.",
      },
    },
    {
      heading: "Methods that return this enable chaining",
      text: "A prototype method that returns this hands the same instance back to the next call, so calls chain on one line. this is the instance — returning it is returning the object the method just worked on.",
      purpose: "Watch two chained calls operate on the same dog.",
      code: `function Dog(name) {
  this.name = name;
  this.tricks = [];
}

Dog.prototype.learn = function (trick) {
  this.tricks[this.tricks.length] = trick;
  return this; // hand the same instance back
};

var rex = new Dog("Rex");
console.log(rex.learn("sit").learn("roll").tricks.length); // -> 2`,
    },
  ],
  quizTags: [
    "new builds the object in four steps",
    "Prototype methods are shared, not copied",
    "Prototype methods are shared, not copied",
  ],
  extraQuiz: [
    {
      q: "var alias = rex; alias.name = \"Ace\"; What is rex.name?",
      options: [
        "Ace — = copied the reference, so one object has two names",
        "Rex — alias received a copy",
        "undefined — the rename broke rex",
        "Ace, but only until rex.bark() runs",
      ],
      answer: 0,
      why: "rex is an object, so = copied its reference into alias. Renaming through alias renamed the instance itself — the prototype plays no role in that.",
      tests: "= copies the reference for objects and arrays",
    },
    {
      q: "Dog.prototype.bark = function () { ... }; — what kind of value is stored on the prototype?",
      options: [
        "A function — prototypes store callable properties like any object",
        "A class definition",
        "A copy of the method per future instance",
        "A special method type the engine treats differently",
      ],
      answer: 0,
      why: "Prototype methods are function values stored under keys — exactly like add.description stored a string. The prototype is just an object carrying callable properties.",
      tests: "A function is a callable object",
    },
  ],
};
