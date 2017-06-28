MOVE = function () {
'use strict';

const setupAnim = function (keyframes, startT, startX, loops = 1) {
  const anim = {kf: []};

  keyframes.forEach(function (kf) {
    anim.kf.push({t: kf.t + startT, x: kf.x + startX, f: kf.f});
  });
  anim.firstT = anim.kf[0].t;
  anim.lastT = anim.kf[anim.kf.length-1].t;
  anim.loops = loops;

  return anim;
};

const addAnim = function (anim, keyframes, delay = 0) {
  if (anim.loops !== 1) {
    throw 'don\'t combine with loops';
  }
  keyframes.forEach(function ({t,x}) {
    anim.kf.push({t: t + delay + anim.lastT, x});
  });
  anim.lastT = anim.kf[anim.kf.length-1].t;
  
  return anim;
};

const animAt = function (anim, t) {
  if (t > anim.lastT) {
    if (anim.loops !== 1) {
      const loopCnt = Math.floor((t - anim.firstT)/(anim.lastT - anim.firstT));
      if (anim.loops !== -1 && loopCnt >= anim.loops) {
        t = anim.lastT;
      } else {
        t -= loopCnt * (anim.lastT - anim.firstT);
      }
    }
  }

  let i;
  for (i = 0; i < anim.kf.length; i++) {
    if (anim.kf[i].t >= t) {
      break;
    }
  }

  if (i === anim.kf.length) {
    return anim.kf[anim.kf.length - 1].x;
  }

  if (i === 0) {
    return anim.kf[0].x;
  }

  const k0 = anim.kf[i-1];
  const k1 = anim.kf[i];
  let innerT = (t - k0.t) / (k1.t - k0.t);
  if (k1.f) {
    innerT = k1.f(innerT);
  }
  return innerT * (k1.x - k0.x) + k0.x;
};

const blendWithBy = function (anim0, anim1, blendAnim, t) {
  const p1 = animAt(blendAnim, t);
  const p0 = 1 - p1;
  return animAt(anim0, t) * p0 + animAt(anim1, t) * p1;
};

const isAnimDone = function (anim, t) {
  if (anim.loops === -1) {
    return false;
  }

  const loopCnt = Math.floor((t - anim.firstT) / (anim.lastT - anim.firstT));
  return loopCnt >= anim.loops;
};

return {
  setupAnim,
  addAnim,
  animAt,
  blendWithBy,
  isAnimDone,
};
};

MOVE.quadin = function (t) {
  return (t*t);
};
MOVE.quadout = function (t) {
  return t*(2-t);
};
MOVE.quadinout = function (t) {
  if (t < 0.5) {
    return 2*t*t;
  } else {
    return -1 + 2*t*(2 - t);
  }
};
