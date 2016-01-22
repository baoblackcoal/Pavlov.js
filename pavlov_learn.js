var pavlov_learn = pavlov_learn || { REVISION: 'ALPHA' };
var experienceR = {};
var experienceP = {};

(function(global) {
  "use strict";
  var Experience = function(state0, action0, reward0, state1) {
    this.state0 = state0;
    this.action0 = action0;
    this.reward0 = reward0;
    this.state1 = state1;
  };

  var randi = function(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
  };
  var randf = function(a, b) {
    return Math.random()*(b-a)+a;
  };

  var Brain = function(actionsNum, actionsAll){
    this.actionsNum = actionsNum;
    this.actionsALl = actionsAll;
    this.forwardCnt = 0;
    this.policy = {};
    this.state0 = {};
    this.state1 = {};
    this.action0 = {};
    this.reward0 = 0;
    this.learnEnable = false;
  };
  Brain.prototype = {
    experienceReset: function () {
      experienceR = {};
      experienceP = {};
    },

    learnRestart:function(){
      console.log("learnRestart!!!!!!!");
      this.learnEnable = false;
    },

    forward:function(state0){
      var actionI = 0;
      var t = this;
      var forEachEnable = true;
      var randAction = true;
      t.state0 = state0;

      this.forwardCnt++;
      if (this.forwardCnt > 1) {
        if (randf(0,1) < 0.1) {
          Object.keys(t.policy).forEach(function (state) {
            if (forEachEnable && state === state0) {
              console.log("policy action!");
              forEachEnable = false;
              randAction = false;
              t.action0 = t.policy[state];
            }
          });
        }
      }

      if(randAction) {
        console.log("randi action!");
        actionI = global.randi(0, this.actionsNum);
        t.action0 = this.actionsALl[actionI];
      }

      return actionI;
    },

    backward:function(reward0, state1){
      this.reward0 = reward0;
      this.state1 = state1;

      if(this.learnEnable && this.forwardCnt > 1){
        var e = new Experience(this.state0, this.action0, this.reward0, this.state1);
        //console.log("e:", e);
        this.policyLearn([e]);
      }

      this.learnEnable = true;
    },

    countSteps: function (experience, P_, R_) {
      experience.forEach(function (step, i) {
        var stepReward = step.reward0 / 2;
        var state0Replace, state1Replace;
        state0Replace = step.state0;
        state1Replace = step.state1;

        if (typeof step.state0 === "object") {
          state0Replace = "{ ", state1Replace = "{ ";
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
        experienceP[state] = experienceP[state] || {};
        Object.keys(P_[state]).forEach(function (action) {
          experienceP[state][action] = experienceP[state][action] || {};
          var visitCount = Object.keys(P_[state][action]).reduce(function (sum, state_) {
            return sum + P_[state][action][state_];
          }, 0);
          Object.keys(P_[state][action]).forEach(function (state_) {
            experienceP[state][action][state_] = experienceP[state][action][state_] || 0;
            P_[state][action][state_] = P_[state][action][state_] / visitCount;
            experienceP[state][action][state_] += P_[state][action][state_];
//		console.log(experienceP);
          });
        });
      });
//  return P_;
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
      var ret;

      Object.keys(V).forEach(function (state) {
        totalDif += Math.abs(V[state] - V_[state]);
        totalOld += Math.abs(V_[state]);
      });
//  console.log("totalDif:",totalDif,"totalOld:",0.001*totalOld);

      if (Math.abs(totalDif) < 0.00001 && Math.abs(totalOld) < 0.00001){
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
      var V = {};
      Object.keys(R).forEach(function (state) {
        V[state] = 0;
      });

      var val;
      var notConverged = true;
      var notAction = true;
      var cnt = 0;
      var futureVal;
      var r = 0.333;
      while (notConverged) {
        var V_ = this.copyObj(V);
        cnt++;
        Object.keys(P).forEach(function (state) {
          futureVal = -Infinity;
          notAction = true;
          Object.keys(P[state]).forEach(function (action) {
            val = 0;
            Object.keys(P[state][action]).forEach(function (state_) {
              val += r * (P[state][action][state_] * V[state_]);
            });

            //console.log("val=", val);

            if (val > futureVal) {
              futureVal = val;
              t.policy[state] = action;
            }
            V[state] = R[state] + futureVal;
          });
          if (notAction) {
            V[state] = R[state] + r * V[state];
            t.policy[state] = t.policy[state] || "NULL";
          }
        });

        notConverged = !this.isConverged(V, V_);

        if (cnt > 100) {
          console.log("cnt=",cnt);
          break;
        }
      }

      console.log("Loop cnt=", cnt);
      console.log("V=", V);
      console.log("policy=", t.policy);
      return t.policy;
    },

    policyLearn: function (experience) {
      var MDP = this.rewardsAndTransitions(experience);
      console.log(MDP);
      return this.policyFormatted(MDP[0], MDP[1]);
    }
  };

  global.randi = randi;
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
