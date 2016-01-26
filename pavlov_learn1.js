var pavlov_learn = pavlov_learn || { REVISION: 'ALPHA' };
var experienceR = {};
var experienceP = {};
var NoAction = "NA";

(function(global) {
  "use strict";
  var Experience = function(state0, action0, reward0, state1) {
    this.state0 = state0;
    this.action0 = action0;
    this.reward0 = reward0;
    this.state1 = state1;
  };

  var floatIs0 = function(value) {
    return Math.abs(value) < 0.0000001;
  };

  var randi = function(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
  };

  var randf = function(a, b) {
    return Math.random()*(b-a)+a;
  };

  var Brain = function(actionsDescribeAll, opt){
    opt = opt || {};
    // how many steps of the above to perform only random actions (in the beginning)?
    this.learning_steps_burnin = typeof opt.learning_steps_burnin !== 'undefined' ? opt.learning_steps_burnin : 100;
    // what epsilon value do we bottom out on? 0.0 => purely deterministic policy at end
    this.epsilon_min = typeof opt.epsilon_min !== 'undefined' ? opt.epsilon_min : 0.05;
    // gamma(¦Ã) of MDP, gamma is a crucial parameter that controls how much plan-ahead the agent does. In [0,1]
    this.gamma = typeof opt.gamma !== 'undefined' ? opt.gamma : 0.3;
    this.batch_experience_learn_size = typeof opt.batch_experience_learn_size !== 'undefined' ? opt.batch_experience_learn_size : 32;

    this.actionsDescribeAll = actionsDescribeAll;
    this.actionsNum = actionsDescribeAll.length;

    this.batchExperience = [];
    this.forwardCnt = 0;
    this.policy = {};
    this.state0 = {};
    this.state1 = {};
    this.action0 = {};
    this.V = {};
    this.reward0 = 0;
    this.age = 0;
    this.randActionCnt = 0;
    this.policyActionCnt = 0;
    experienceR = {};
    experienceP = {};
  };
  Brain.prototype = {
    experienceReset: function () {
      experienceR = {};
      experienceP = {};
    },

    learnRestart:function(){
      console.log("learnRestart!!!!!!!");
    },

    policyExecute:function(state0){
      var t = this;
      var forEachEnable = true;
      var executed = false;

      Object.keys(t.policy).forEach(function (state) {
        if (forEachEnable && t.policy[state] !== NoAction && state === state0) {
          //console.log("policy action!");
          forEachEnable = false;
          executed = true;
          t.action0 = t.policy[state0];
        }
      });

      return executed;
    },

    forward:function(state0){
      var actionI = 0;
      var policyExecuted = false;
      this.state0 = state0;
      //console.log("t.state0=", t.state0);
      this.forwardCnt++;
      this.epsilon = Math.min(1.0, Math.max(this.epsilon_min, 1.0-(this.age - this.learning_steps_burnin)/this.age));

      if (this.forwardCnt > 1) {
        if (global.randf(0,1) > this.epsilon) {
          policyExecuted = this.policyExecute(state0);
        }
      }

      if(!policyExecuted || this.action0 === NoAction) {
        //console.log("randi action!");
        this.randActionCnt++;
        actionI = global.randi(0, this.actionsNum);
        this.action0 = this.actionsDescribeAll[actionI];
      }else{
        this.policyActionCnt++;
      }
      //console.log("policyAction percent =", this.policyActionCnt/(this.policyActionCnt+this.randActionCnt)*100,"%");

      return this.action0;
    },

    backward:function(reward0, state1){
      this.reward0 = reward0;
      this.state1 = state1;
      this.age++;

      if (floatIs0(this.reward0)) this.reward0 = -0.1;
      var e = new Experience(this.state0, this.action0, this.reward0, this.state1);
      //console.log(e);
      this.batchExperience.push(e);
      if(this.batchExperience.length > this.batch_experience_learn_size) {
        this.policyLearn(this.batchExperience);
        this.batchExperience = [];
      }
    },

    countSteps: function (experience, P_, R_) {
      experience.forEach(function (step) {
        var stepReward = step.reward0 / 2;
        var state0Replace, state1Replace;
        state0Replace = step.state0;
        state1Replace = step.state1;

        if (typeof step.state0 === "object") {
          state0Replace = "{ ";
          state1Replace = "{ ";
          Object.keys(step.state0).forEach(function (i) {
            state0Replace += step.state0[i];
            state0Replace += " ";
            state1Replace += step.state1[i];
            state1Replace += " ";
          });
          state0Replace += "}";
          state1Replace += "}";
//		console.log("state0Replace:",state0Replace);
//		console.log("state1Replace:",state1Replace);
        }

        //initialization
        R_[state0Replace] = R_[state0Replace] || {reward: 0, count: 0};
        R_[state1Replace] = R_[state1Replace] || {reward: 0, count: 0};
        P_[state0Replace] = P_[state0Replace] || {};

        P_[state0Replace][step.action0] = P_[state0Replace][step.action0] || {};
        P_[state1Replace] = P_[state1Replace] || {};

        //increment total reward count
        R_[state0Replace].reward += stepReward;
        R_[state0Replace].count += 1;
        R_[state1Replace].reward += stepReward;
        R_[state1Replace].count += 1;
        //and visit count
        P_[state0Replace][step.action0][state1Replace] = P_[state0Replace][step.action0][state1Replace] + 1 || 1;
      });
    },

    getRewardsFromCount: function (R_) {
      var R = {};
      // console.log(R_);
      Object.keys(R_).forEach(function (state) {
        //console.log("R_:", state, R_[state].reward);
        experienceR[state] = experienceR[state] || 0;
        R[state] = R_[state].reward / R_[state].count;
        experienceR[state] += R[state];
      });
//  return R;
      return experienceR;
    },

    getTransProbsFromCount: function (P_) {
      Object.keys(P_).forEach(function (state) {
        experienceP[state] =  experienceP[state] || {};
        Object.keys(P_[state]).forEach(function (action) {
          experienceP[state][action] = experienceP[state][action] || {cnt:0, state1:{}};
          experienceP[state][action].cnt += Object.keys(P_[state][action]).reduce(function (sum, state_) {
            return sum + P_[state][action][state_];
          }, 0);

          Object.keys(P_[state][action]).forEach(function (state_) {
            experienceP[state][action].state1[state_] = experienceP[state][action].state1[state_] || {cnt: 0, p: 0};
            experienceP[state][action].state1[state_].cnt += P_[state][action][state_];
            experienceP[state][action].state1[state_].p = experienceP[state][action].state1[state_].cnt/experienceP[state][action].cnt;
          });
        });
      });
      console.log("experienceP", experienceP);
      return experienceP;
    },

    rewardsAndTransitions: function (experience) {
      var P_ = {};
      var R_ = {};

      this.countSteps(experience, P_, R_);
      var R = this.getRewardsFromCount(R_);
      var P = this.getTransProbsFromCount(P_);

      return [P, R];
    },

    isConverged: function (V, V_) {
      var totalDif = 0;
      var totalOld = 0;

      Object.keys(V).forEach(function (state) {
        totalDif += Math.abs(V[state] - V_[state]);
        totalOld += Math.abs(V_[state]);
      });
//  console.log("totalDif:",totalDif,"totalOld:",0.001*totalOld);

      if (floatIs0(totalDif) && floatIs0(totalOld)){
        return true;
      } else {
        return (totalDif < 0.001 * totalOld)
      }
    },

    copyObj: function (obj) {
      var obj_ = {};
      Object.keys(obj).forEach(function (key) {
        obj_[key] = obj[key];
      });
      return obj_;
    },

    policyFormatted: function (P, R) {
      var t = this;
      t.V = {};
      Object.keys(R).forEach(function (state) {
        t.V[state] = 0;
      });

      var val;
      var notConverged = true;
      var notAction = true;
      var cnt = 0;
      var futureVal;
      var state1;
      while (notConverged) {
        var V_ = this.copyObj(t.V);
        cnt++;
        Object.keys(P).forEach(function (state) {
          futureVal = -Infinity;
          notAction = true;
          Object.keys(P[state]).forEach(function (action) {
            notAction = false;
            val = 0;
            Object.keys(P[state][action].state1).forEach(function (state_) {
              val += t.gamma * (P[state][action].state1[state_].p * t.V[state_]);
              state1 = state_;
              //console.log("P: ", state, action, state_, P[state][action].state1[state_].p);
            });

            //console.log(state, action, state1, "val=", val);

            if (val > futureVal) {
              futureVal = val;
              t.policy[state] = action;
            }
            t.V[state] = R[state] + futureVal;
          });
          //console.log("---------noatciont", notAction);
          if (notAction || t.policy[state] === NoAction) {
            t.V[state] = R[state] + t.gamma * t.V[state];
            t.policy[state] = t.policy[state] || NoAction;
            //t.policy[state] = {};
          }
        });

        notConverged = !this.isConverged(t.V, V_);

        if (cnt > 1000) {
          console.log("cnt=",cnt);
          break;
        }
      }

      console.log("Loop cnt=", cnt);
      console.log("V=", t.V);
      console.log("policy=", t.policy);
      return t.policy;
    },

    policyLearn: function (experience) {
      var MDP = this.rewardsAndTransitions(experience);
      //console.log(MDP);
      return this.policyFormatted(MDP[0], MDP[1]);
    }
  };

  global.randi = randi;
  global.randf = randf;
  global.Brain = Brain;
  global.Experience = Experience;
})(pavlov_learn);


(function(lib) {
  "use strict";
  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    window.pavlov_learn = lib; // in ordinary browser attach library to window
  } else {
    module.exports = lib; // in nodejs
  }
})(pavlov_learn);
