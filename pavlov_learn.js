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
  }

  var Brain = function(){};
  Brain.prototype = {
    experienceReset: function () {
      experienceR = {};
      experienceP = {};
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
      Object.keys(V).forEach(function (state) {
        totalDif += Math.abs(V[state] - V_[state]);
        totalOld += Math.abs(V_[state]);
      });
//  console.log("totalDif:",totalDif,"totalOld:",0.001*totalOld);
      return (totalDif < 0.001 * totalOld)
    },

    copyObj: function (obj) {
      var obj_ = {};
      Object.keys(obj).forEach(function (key) {
        obj_[key] = obj[key];
      });
      return obj_;
    },

    policyFormatted: function (P, R) {
      var policy = {};
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
              policy[state] = action;
            }
            V[state] = R[state] + futureVal;
          });
          if (notAction) {
            V[state] = R[state] + r * V[state];
            policy[state] = policy[state] || "NULL";
          }
        });

        notConverged = !this.isConverged(V, V_);

//	if (cnt > 10) {
//		console.log("cnt=",cnt);
//		break;
//	}
      }

      console.log("V=", V);
      console.log("Loop cnt=", cnt);

      return policy;
    },
    policy: function (experience) {
      var MDP = this.rewardsAndTransitions(experience);
      //console.log(MDP[0]);
      return this.policyFormatted(MDP[0], MDP[1]);
    }
  };

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
