Learn Js Course

### Course Spec

**Purpose:** Teach JavaScript by only showing what the engine actually executes. No transpiled shortcuts.

**Audience:** Developers tired of `=>`, `{ }` tricks, and magic who want to see prototypes, closures, and `this` for real.

**Philosophy:** If you can't write it with `function`, `var`, `for`, `if`, `new`, and `prototype`, you don't understand it yet.

### 1. Rule of Thumb - The No-Sugar Ruleset

**FORBIDDEN:**
`=>` arrow functions, `` `${}` `` template literals, `class` / `extends`, destructuring `var {a}=obj`, spread `...`, default params `function f(a=5)`, shorthand property `{a}`, shorthand method `{ say(){} }`, `++ -- += -=`, `?.` optional chaining, `??` nullish coalescing, `for...of` / `for...in`, `async/await`, `import/export`, `Array.map/filter` as black boxes

**ALLOWED - The Real Primitives:**
`var`, `function`, `if`, `else`, `for(;;)`, `while`, `return`, `new`, `this`, `prototype`, `Object.create`, `Function.prototype.call / apply / bind`, `typeof`, `===`

**Rule for every example:**
Instead of `let name = ${first} ${last}`, write `var name = first + " " + last`
Instead of `i++`, write `i = i + 1`

### 2. Lessons - 10 parts

**Lesson 1: Variables, Types & Truthiness**
Goal: primitives vs objects
Real code: `var obj = new Object(); obj.x = 1; var arr = new Array();`
Exercise: Create an object with `new Object()` and add 3 properties manually

**Lesson 2: Functions Are Objects**
Goal: function is a callable object
Real code: `var add = function(a,b){ return a + b; }; var greet = function(name){ if(name===undefined){name="stranger"} return "Hello "+name; }`
Exercise: Write a function factory without default params

**Lesson 3: Objects & Prototypes - The Real Class**
Goal: Replace `class`
Real code:
```javascript
var Dog = function(name){ this.name = name; };
Dog.prototype.bark = function(){ return "Woof "+this.name; };
var d = new Dog("Rex");
```
Exercise: Build `Cat` with `meow` on prototype

**Lesson 4: this, call, apply, bind**
Goal: Binding is explicit
Real: `var greet = function(){ return this.name; }; greet.call({name:"Kai"})`
Exercise: Borrow a method from one object to another with `call`

**Lesson 5: Scope, Hoisting & Closure**
Goal: `var` hoisting + closure
Real: `var makeCounter = function(){ var count=0; return function(){ count=count+1; return count; }; };`
Exercise: Build a private variable counter

**Lesson 6: Arrays Without Magic**
Goal: No map/filter, do it manually
Real: `for(i=0;i<arr.length;i=i+1){ copy[i]=arr[i]; }`
Exercise: Re-implement `map` manually with a for loop

**Lesson 7: Async Without Sugar**
Goal: Raw callbacks and Promises
Real: `var p = new Promise(function(resolve,reject){ resolve("done"); }); p.then(function(v){ console.log(v); });`
Exercise: Chain two Promises without `async/await`

**Lesson 8: Prototype Chain Deep Dive**
Goal: Walk the chain
Real: `var child = Object.create(parent); child.hasOwnProperty("x")`
Exercise: Build 3-level inheritance with `Object.create`

**Lesson 9: Modules Without import**
Goal: IIFE module pattern
Real: `var Module = (function(){ var privateVar=0; return { get:function(){return privateVar;}};})();`
Exercise: Create a module with private state

**Lesson 10: Building Real Things**
Goal: EventEmitter from scratch
Real: Prototype with `on` and `emit` storing arrays of functions
Final Project: Build a tiny EventEmitter and a DOM helper without shortcuts

### 3. Cheatsheet - Sugar -> Real

| Sugar you see | Real code you write | Why it matters |
|---|---|---|
| `a => a+1` | `function(a){ return a+1; }` | Arrow hides `this` and `arguments` |
| `` `Hi ${n}` `` | `"Hi "+n` | Template hides concatenation |
| `f(a=5)` | `if(a===undefined){a=5}` | Default hides explicit check |
| `var {x}=obj` | `var x=obj.x` | Destructuring hides property access |
| `[...a]` | manual for loop copy | Spread hides loop |
| `{x}` | `{x:x}` | Shorthand hides key:value |
| `class A extends B` | `function A(){}; A.prototype=Object.create(B.prototype)` | Class hides prototype chain |
| `a++` / `a+=1` | `a = a + 1` | Shorthand hides assignment |
| `for(x of arr)` | `for(i=0;i<arr.length;i=i+1)` | for...of hides index logic |
| `arr.map(fn)` | for loop + push | map hides loop |
| `obj?.a` | `if(obj!==null && obj!==undefined){obj.a}` | ?. hides null check |
| `a ?? b` | `if(a!==null && a!==undefined){a} else {b}` | ?? hides check |
| `async/await` | `new Promise` + `.then` | async hides Promise |
