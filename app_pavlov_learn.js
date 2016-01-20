var pavlov = require('./pavlov_learn.js');


//背包问题
//物品：A B C
//重量：28 12 12
//价值：30 20 20
//约束：重量不能大于30
//目标：价值最大
pavlov.experienceReset();


var e1 = new pavlov.Experience("B", "L", 0, "A");
var e2 = new pavlov.Experience("A", "L", 1, "Prize");
var e3 = new pavlov.Experience("B", "B", 0, "D");
var e4 = new pavlov.Experience("D", "F", 0, "B");
var e5 = new pavlov.Experience("Prize", "L", 0, "A");
//var e6 = new pavlov.Experience("D", "L", 1, "Prize");
var e7 = new pavlov.Experience("D", "R", 0, "C");
var e8 = new pavlov.Experience("C", "F", 0, "A");
var e9 = new pavlov.Experience("C", "R", 0, "D");
var e10 = new pavlov.Experience("A", "R", 0, "B");

var e1 = new pavlov.Experience("B", "L", 0, "A");

pavlov.experienceReset();
var e = [];
e.push(e1);
e.push(e2);
e.push(e3);
e.push(e4);
e.push(e5);
console.log(pavlov.policy(e));
var e = [];
//e.push(e6);
e.push(e1);
e.push(e2);
e.push(e3);
e.push(e4);
e.push(e5);
e.push(e7);
e.push(e8);
e.push(e9);
e.push(e10);
console.log(pavlov.policy(e));

/*
pavlov.experienceReset();
var e1 = new pavlov.Experience({a:1, b:1}, 1, 0, {a:2, b:2});
var e2 = new pavlov.Experience({a:2, b:2}, 1, 1, {a:3, b:3});
var e3 = new pavlov.Experience({a:3, b:3}, -1, 1, {a:2, b:2});
var e = [];
e.push(e1);
e.push(e2);
e.push(e3);
var p = pavlov.policy(e)
console.log(p);
*/

/*
//闭环校正
//动作 1 -1 2 -2
//状态 1 2 3 4
//目标要达到3
function state0ActionToState1(state0, action){
	var state1 = 0;
	
	state1 = state0 + action;
//	if (action == -1)
//		state1 = state0 - 1;
//	else if (action == 1)
//		state1 = state0 + 1;
	
	if (state1 < 1)
		state1 = 1;
	if (state1 > 4)
		state1 = 4;
	
	if (state1 == 3)
		rewards = 1;
	else
		rewards = 0;
	
	return [rewards, state1];
}

var State1 = 0;
ret = state0ActionToState1(2, 1)
console.log(ret[0], ret[1]);
var state0 = 1, action =1;

state0 = 1, action =2;
ret = state0ActionToState1(state0, action)
var e1 = new pavlov.Experience(state0, action, ret[0], ret[1]);
state0 = 1, action =1;
ret = state0ActionToState1(state0, action)
var e2 = new pavlov.Experience(state0, action, ret[0], ret[1]);
state0 = 3, action =2;
ret = state0ActionToState1(state0, action)
var e3 = new pavlov.Experience(state0, action, ret[0], ret[1]);
state0 = 4, action =1;
ret = state0ActionToState1(state0, action)
var e4 = new pavlov.Experience(state0, action, ret[0], ret[1]);
state0 = 4, action =-1;
ret = state0ActionToState1(state0, action)
var e5 = new pavlov.Experience(state0, action, ret[0], ret[1]);
state0 = 3, action =-2;
ret = state0ActionToState1(state0, action)
var e6 = new pavlov.Experience(state0, action, ret[0], ret[1]);
//console.log(e1);

var e = [];
e.push(e1);
e.push(e2);
e.push(e3);
e.push(e4);
e.push(e5);
e.push(e6);
console.log(pavlov.policy(e));
 */