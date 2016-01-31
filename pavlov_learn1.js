var pavlov_learn = pavlov_learn || {REVISION: 'ALPHA'};
var experienceR = {};
var experienceP = {};
var NoAction = "NA";
var temporal = 2;

(function (global) {
  "use strict";
  var Experience = function (state0, action0, reward0, state1) {
    this.state0 = state0;
    this.action0 = action0;
    this.reward0 = reward0;
    this.state1 = state1;
  };

  var single_memory = function (state_name, state) {
    //first, min, max, 4 middle of min to max, past 4 from now, other past 4 state value and now state, past 4 state new, past 4 reward new
    this.first = state[state_name];
    this.min = state[state_name];
    this.max = state[state_name];
    this.misc = {middle: [], past: [], state_new: [], reward_new: [], other_state: {}};
    for (var i = 0; i < temporal; i++) {
      this.misc.middle[i] = state[state_name];
      this.misc.past[i] = state[state_name];
      this.misc.state_new[i] = "0";
      this.misc.reward_new[i] = "0";
    }
    var t = this;
    Object.keys(state).forEach(function (state_name_) {
      if (state_name_ !== state_name) {
        t.misc.other_state[state_name_] = state[state_name_];
      }
    });
  };

  var float_is_0 = function (value) {
    return Math.abs(value) < 0.0000001;
  };

  var randi = function (a, b) {
    return Math.floor(Math.random() * (b - a) + a);
  };

  var randf = function (a, b) {
    return Math.random() * (b - a) + a;
  };
  var compare_self_state_value = function (state_value, now_state_value) {
    if (now_state_value === state_value) {
      return "=";
    } else if (now_state_value > state_value) {
      return ">";
    } else if (now_state_value < state_value) {
      return "<";
    }
    console.log("error compare:", typeof state_value, typeof now_state_value);

    return "error!";
  };
  var compare_other_state_value = function (now_state_value, before_state_value, other_state_value) {
    if (now_state_value === other_state_value) {
      return "=";
    } else if (Math.abs(now_state_value - other_state_value) > Math.abs(before_state_value - other_state_value)) {
      return "(";
    } else if (Math.abs(now_state_value - other_state_value) < Math.abs(before_state_value - other_state_value)) {
      return ")";
    } else if (Math.abs(now_state_value - other_state_value) === Math.abs(before_state_value - other_state_value)) {
      return "|";
    }
    console.log("error compare_other_state_value:", Math.abs(now_state_value - other_state_value), Math.abs(before_state_value - other_state_value));

    return "error!";
  };

  var memory = function () {
    this.memory_all = {};
  };
  memory.prototype = {
    initial: function (state) {
      var t = this;
      Object.keys(state).forEach(function (state_name) {
        t.memory_all[state_name] = t.memory_all[state_name] || new single_memory(state_name, state);
      });
      console.log("memory_all", t.memory_all);
      return this.state_to_memory_state(state, true);
    },

    single_assign: function (state_name, state) {
      //first, min, max, 4 middle of min to max, past 4 from now, other past 4 state value and now state, past 4 state new, past 4 reward new
      var t = this;
      //this.first = state[state_name];
      var now_value = state[state_name];
      //if (t.memory_all[state_name].min > now_value) t.memory_all[state_name].min = now_value;
      //if (t.memory_all[state_name].max < now_value) t.memory_all[state_name].max = now_value;
      t.memory_all[state_name].min = "0";
      t.memory_all[state_name].max = "0";
      //this.misc = {middle: [], past: [], state_new: [], reward_new: [], other_state: {}};
      t.memory_all[state_name].misc.past.push(now_value);
      if (t.memory_all[state_name].misc.past.length > temporal) t.memory_all[state_name].misc.past.shift();
      t.memory_all[state_name].misc.state_new.push("0");
      if (t.memory_all[state_name].misc.state_new.length > temporal) t.memory_all[state_name].misc.state_new.shift();
      t.memory_all[state_name].misc.reward_new.push("0");
      if (t.memory_all[state_name].misc.reward_new.length > temporal) t.memory_all[state_name].misc.reward_new.shift();
      for (var i = 0; i < temporal; i++) {
        //t.memory_all[state_name].misc.middle[i] = ((t.memory_all[state_name].max - t.memory_all[state_name].min) / (temporal + 1) * (i + 1)).toString();
        //t.memory_all[state_name].misc.middle[i] = (Math.floor(t.memory_all[state_name].misc.middle[i])).toString();
        t.memory_all[state_name].misc.middle[i] = "0"
      }
      Object.keys(state).forEach(function (state_name_) {
        if (state_name_ !== state_name) {
          t.memory_all[state_name].misc.other_state[state_name_] = state[state_name_];
          //if(t.memory_all[state_name].misc.other_state[state_name_].length > temporal+1) t.memory_all[state_name].misc.other_state[state_name_].shift();
          //t.misc.other_state[state_name_] = t.misc.other_state[state_name_] || [];
          //for (var i = 0; i < temporal + 1; i++) {
          //  t.misc.other_state[state_name_].push(state[state_name_]);
          //}
        }
      });
    },

    state_to_memory_state: function (state, init) {
      //state = {adc: 1, dac: 2};
      var t = this;
      //var state_now = {adc: 3, dac: 2};
      var now_value;

      //Object.keys(state).forEach(function (state_name) {
      //  memory_all[state_name] = memory_all[state_name] || new single_memory_state(state_name, state);
      //});
      //console.log(memory_all);

      var memory_state = {};
      var i;
      var key;
      Object.keys(t.memory_all).forEach(function (state_name) {
        //console.log(state_name, ":");
        if (!init) t.single_assign(state_name, state);
        now_value = state[state_name];

        //console.log("now_value:", now_value);

        Object.keys(t.memory_all[state_name]).forEach(function (name) {
          if (name === "misc") {
            Object.keys(t.memory_all[state_name][name]).forEach(function (misc_name) {
              if (misc_name === "other_state") {
                Object.keys(t.memory_all[state_name][name][misc_name]).forEach(function (state_name_) {
                  key = state_name + "_" + name + "_" + misc_name + "_" + state_name_;
                  if (state_name === "real_adc_value" && state_name_ === "target_adc_value") {
                    memory_state[key] = compare_other_state_value(t.memory_all[state_name][name]["past"][temporal - 1], t.memory_all[state_name][name]["past"][temporal - 2], t.memory_all[state_name][name][misc_name][state_name_]);
                  } else {
                    memory_state[key] = "=";
                  }

                  //console.log(key, compare_other_state_value(t.memory_all[state_name][name]["past"][temporal-1], t.memory_all[state_name][name]["past"][temporal-2], t.memory_all[state_name][name][misc_name][state_name_]));
                });
              } else {
                for (i = 0; i < temporal; i++) {
                  key = state_name + "_" + name + "_" + misc_name + "_" + i;
                  //memory_state[key] = compare_self_state_value(t.memory_all[state_name][name][misc_name][i], now_value);
                  memory_state[key] = "=";
                  //console.log(key, t.memory_all[state_name][name][misc_name][i], now_value, compare_self_state_value(t.memory_all[state_name][name][misc_name][i], now_value));
                }
              }
            });
          }
          else {
            key = state_name + "_" + name;
            //memory_state[key] = compare_self_state_value(t.memory_all[state_name][name], now_value);
            memory_state[key] = "=";
            //console.log(key,t.memory_all[state_name][name], now_value, compare_self_state_value(t.memory_all[state_name][name], now_value));
          }
        });
      });
      //console.log("===================");
      //console.log(memory_state);

      return memory_state;
    }
  };


  var Brain = function (actionsDescribeAll, opt) {
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
    this.memory = new memory();
  };
  Brain.prototype = {
    experienceReset: function () {
      experienceR = {};
      experienceP = {};
    },

    learnRestart: function () {
      console.log("learnRestart!!!!!!!");
    },

    policyExecute: function (state0) {
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

    forward: function (state0) {
      var actionI = 0;
      var policyExecuted = false;
      this.state0 = state0;
      //console.log("t.state0=", t.state0);
      this.forwardCnt++;
      this.epsilon = Math.min(1.0, Math.max(this.epsilon_min, 1.0 - (this.age - this.learning_steps_burnin) / this.age));

      if (this.forwardCnt > 1) {
        state0 = this.memory.state_to_memory_state(state0, false);
        if (global.randf(0, 1) > this.epsilon) {
          policyExecuted = this.policyExecute(state0);
        }
      } else {
        console.log("initial");
        state0 = this.memory.initial(state0);
      }
      this.state0 = state0;

      if (!policyExecuted || this.action0 === NoAction) {
        //console.log("randi action!");
        this.randActionCnt++;
        actionI = global.randi(0, this.actionsNum);
        this.action0 = this.actionsDescribeAll[actionI];
      } else {
        this.policyActionCnt++;
      }
      //console.log("policyAction percent =", this.policyActionCnt/(this.policyActionCnt+this.randActionCnt)*100,"%");

      return this.action0;
    },

    backward: function (reward0, state1) {
      this.reward0 = reward0;
      this.state1 = this.memory.state_to_memory_state(state1, false);
      this.age++;

      if (float_is_0(this.reward0)) this.reward0 = -0.1;
      var e = new Experience(this.state0, this.action0, this.reward0, this.state1);
      //console.log(e);
      this.batchExperience.push(e);
      if (this.batchExperience.length >= this.batch_experience_learn_size) {
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
          state0Replace = "[";
          state1Replace = "[";
          Object.keys(step.state0).forEach(function (i) {
            state0Replace += step.state0[i];
            //state0Replace += " ";
            state1Replace += step.state1[i];
            //state1Replace += " ";
          });
          state0Replace += "]";
          state1Replace += "]";
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
          experienceP[state][action] = experienceP[state][action] || {cnt: 0, state1: {}};
          experienceP[state][action].cnt += Object.keys(P_[state][action]).reduce(function (sum, state_) {
            return sum + P_[state][action][state_];
          }, 0);

          Object.keys(P_[state][action]).forEach(function (state_) {
            experienceP[state][action].state1[state_] = experienceP[state][action].state1[state_] || {cnt: 0, p: 0};
            experienceP[state][action].state1[state_].cnt += P_[state][action][state_];
            experienceP[state][action].state1[state_].p = experienceP[state][action].state1[state_].cnt / experienceP[state][action].cnt;
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

      if (float_is_0(totalDif) && float_is_0(totalOld)) {
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
          console.log("cnt=", cnt);
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
  global.memory = memory;
})(pavlov_learn);


(function (lib) {
  "use strict";
  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    window.pavlov_learn = lib; // in ordinary browser attach library to window
  } else {
    module.exports = lib; // in nodejs
  }
})(pavlov_learn);
