var pavlov = require('./pavlov_learn.js');

//var e = new Experience();
var e1 = new pavlov.Experience("B", "L", 0, "A");
var e2 = new pavlov.Experience("A", "L", 1, "Prize");
var e3 = new pavlov.Experience("B", "B", 0, "D");
var e4 = new pavlov.Experience("D", "F", 0, "B");
var e5 = new pavlov.Experience("Prize", "L", 0, "A");
var e6 = new pavlov.Experience("D", "L", 1, "Prize");
var e7 = new pavlov.Experience("D", "R", 0, "C");
var e8 = new pavlov.Experience("C", "F", 0, "A");
var e9 = new pavlov.Experience("C", "R", 0, "D");
var e10 = new pavlov.Experience("A", "R", 0, "B");

var e = [];
e.push(e1);
e.push(e2);
e.push(e3);
e.push(e4);
e.push(e5);
console.log(pavlov.policy(e));
var e = [];
//e.push(e6);
e.push(e7);
e.push(e8);
e.push(e9);
e.push(e10);

console.log(pavlov.policy(e));
/*
var obs1 = [{state:"A", action:"R"}, {state:"B", action:"B"}];
var obs2 = [{state:"A", action:"B"}, {state:"C", action:"R"}];
var obs3 = [{state:"A", action:"L"}, {state:"Prize", action:"R"}, {state:"Trap", action:"F"}];
var obs4 = [{state:"A", action:"L"}, {state:"Prize", action:"L"},{state:"Trap", action:"B"}];
var obs5 = [{state:"B",action:"B"},{state:"D",action:"L"}, {state: "C",action:"F"}, {state:"A",action:"R"}];
var obs6 = [{state:"C",action:"R"},{state:"D",action:"F"},{state:"B", action:"L"}, {state:"A", action:"L"}];

observations = [obs1,obs2,obs3,obs4,obs5,obs6];
rewards = [0,0,1,1,0,0];

console.log(pavlov.policy(observations,rewards));

// { A: 'L', B: 'L', C: 'F', Prize: 'R', Trap: 'B', D: 'L' }
*/