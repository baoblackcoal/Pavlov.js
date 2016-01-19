'use strict';

var Experience = module.exports.Experience = function(state0, action0, reward0, state1) {
	this.state0 = state0;
	this.action0 = action0;
	this.reward0 = reward0;
	this.state1 = state1;
}

var experienceR = {};
var experienceP = {};

function countSteps(experience,P_,R_){

  experience.forEach(function(step,i){
	var stepReward = step.reward0/2;

    //initialization
    R_[step.state0] = R_[step.state0] || {reward:0, count:0};
	R_[step.state1] = R_[step.state1] || {reward:0, count:0};
    P_[step.state0] = P_[step.state0] || {};
    P_[step.state0][step.action0] = P_[step.state0][step.action0] || {};
	P_[step.state1] = P_[step.state1] || {};

    //increment total reward count
    R_[step.state0].reward += stepReward;
    R_[step.state0].count += 1;
	R_[step.state1].reward += stepReward;
    R_[step.state1].count += 1;
    //and visit count
     P_[step.state0][step.action0][step.state1] = P_[step.state0][step.action0][step.state1] + 1 || 1;
  });
};

function getRewardsFromCount(R_){
  var R = {};
 // console.log(R_);
  Object.keys(R_).forEach(function(state){
	//console.log("R_:", state, R_[state].reward);
	experienceR[state] = experienceR[state] || 0;
    R[state] = R_[state].reward / R_[state].count;
	experienceR[state] += R[state];
  });
//  return R;
  return experienceR;
};

function getTransProbsFromCount(P_){
  Object.keys(P_).forEach(function(state){
	  experienceP[state] = experienceP[state] || {};
    Object.keys(P_[state]).forEach(function(action){
		experienceP[state][action] = experienceP[state][action] || {};
      var visitCount = Object.keys(P_[state][action]).reduce(function(sum,state_){
        return sum + P_[state][action][state_];
      },0);
      Object.keys(P_[state][action]).forEach(function(state_){
		experienceP[state][action][state_] = experienceP[state][action][state_] || 0;
        P_[state][action][state_] = P_[state][action][state_] / visitCount;
		experienceP[state][action][state_] += P_[state][action][state_];
	  });
    });
  });
//  return P_;
	return experienceP;
};

var rewardsAndTransitions = module.exports.rewardsAndTransitions = function(experience){

  var P_ = {};
  var R_ = {};

  countSteps(experience,P_,R_);
  //observations.forEach(function(observation,i){
  //  countSteps(experience,P_,R_);
  //});

  var R = getRewardsFromCount(R_);
  var P = getTransProbsFromCount(P_);

  return [P,R];
};

function isConverged(V,V_){
  var totalDif = 0;
  var totalOld = 0;
  Object.keys(V).forEach(function(state){
    totalDif += Math.abs(V[state] - V_[state]);
    totalOld += Math.abs(V_[state]);
  });
  return (totalDif < 0.001*totalOld)
};

function copyObj(obj){
  var obj_ = {};
  Object.keys(obj).forEach(function(key){
    obj_[key] = obj[key];
  });
  return obj_;
};

function policyFormatted(P,R){
  var policy = {}
  var V = {};
  Object.keys(R).forEach(function(state){
    V[state] = 0;
  });

  var val;
  var notConverged = true;
  var notAction = true;
  while (notConverged){
    var V_ = copyObj(V);
    Object.keys(P).forEach(function(state){
      var futureVal = -Infinity;
	  notAction = true;
      Object.keys(P[state]).forEach(function(action){
		notAction = false;
        val = 0;
//        //assume uniform transition probabilities if no data is available
//        if (Object.keys(P[state][action]).length == 0){
//          var states = Object.keys(P);
//          var uniformProb = 1/states.length;
//          states.forEach(function(state_){
//            P[state][action][state_] = uniformProb;
//          });
//        }
        Object.keys(P[state][action]).forEach(function(state_){
          val += 0.9*(P[state][action][state_] * V[state_]);
        });
        if (val > futureVal){
          futureVal = val;
          policy[state] = action;
        }
        V[state] = R[state] + futureVal;
      });
	  if (notAction) V[state] = R[state] + 0.9*V[state];
    });
    notConverged = !isConverged(V,V_);
  };
  console.log("V:", V);

  return policy;
};


var policy = module.exports.policy = function(experience){
	var MDP = rewardsAndTransitions(experience);
	console.log(MDP[0]);
	return policyFormatted(MDP[0], MDP[1]);
};
