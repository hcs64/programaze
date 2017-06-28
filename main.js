(function(){

'use strict';
const cnv = document.getElementById('cnv');
cnv.width = cnv.offsetWidth;
cnv.height = cnv.offsetHeight;
let ctx = cnv.getContext('2d');

if (window.devicePixelRatio) {
  const dpr = window.devicePixelRatio;
  const width = cnv.width;
  const height = cnv.height

  cnv.width = width * dpr;
  cnv.height = height * dpr;
  ctx.scale(dpr, dpr);
}

const move = MOVE();

let startTime = null;

const stretch = [{t: 0, x: 1},
                 {t: 150, x: 2.2, f: MOVE.quadin},
                 {t: 300, x: 1},];
const crawl = [{t: 0, x: 0},
               {t: 150, x: 0, f: MOVE.quadin},
               {t: 300, x: 1.2}];

const transform01 = [{t: 0, x: 0}, {t: 250, x: 1}];
const transform10 = [{t: 0, x: 1}, {t: 250, x: 0}];

let transformAnim;

const lerp = function (x0, x1, t) {
  return x0 + (x1 - x0) * t;
};


const drawGrid = function (grid, progress) {
  const gridX = 100, gridY = 100, gridW = 20, gridH = 20;
  const zeroW = gridW * .6, zeroH = gridH * .6;
  const oneW = gridW * .2, oneH = gridH * .6;
  const zeroInnerW = gridW * .3, zeroInnerH = gridH * .3;
  for (let j = 0; j < grid.length; j ++) {
    for (let i = 0; i < grid[j].length; i ++) {
      const x = gridX + i * gridW;
      const y = gridY + j * gridH;
      if (grid[j][i] === 1) {
        const x0 = x + (gridW - oneW)/2;
        const y0 = y + (gridH - oneH)/2;
        const w0 = oneW;
        const h0 = oneH;

        const x1 = x;
        const y1 = y;
        const w1 = gridW;
        const h1 = gridH;

        const xN = lerp(x0, x1, progress);
        const yN = lerp(y0, y1, progress);
        const wN = lerp(w0, w1, progress);
        const hN = lerp(h0, h1, progress);

        const vN = Math.floor(lerp(255, 128, progress));
        ctx.fillStyle = `rgb(${vN},${vN},${vN})`;
        ctx.fillRect(xN, yN, wN, hN);

        if (progress > 0) {
          const v = Math.floor(lerp(255, 64, progress));
          ctx.strokeStyle = `rgb(${v},${v},${v})`;

          ctx.strokeRect(xN, yN, wN, hN);
        }
      } else {
        if (progress < 1) {
          {
            const x0 = x + (gridW - zeroW)/2;
            const y0 = y + (gridH - zeroH)/2;
            const w0 = zeroW;
            const h0 = zeroH;

            const x1 = x + gridW/2;
            const y1 = y + gridH/2;
            const w1 = 0;
            const h1 = 0;

            const xN = lerp(x0, x1, progress);
            const yN = lerp(y0, y1, progress);
            const wN = lerp(w0, w1, progress);
            const hN = lerp(h0, h1, progress);
            ctx.fillStyle = 'white';
            ctx.fillRect(xN, yN, wN, hN)
          }
          {
            const x0 = x + (gridW - zeroInnerW)/2;
            const y0 = y + (gridH - zeroInnerH)/2;
            const w0 = zeroInnerW;
            const h0 = zeroInnerH;

            const x1 = x + gridW/2;
            const y1 = y + gridH/2;
            const w1 = 0;
            const h1 = 0;

            const xN = lerp(x0, x1, progress);
            const yN = lerp(y0, y1, progress);
            const wN = lerp(w0, w1, progress);
            const hN = lerp(h0, h1, progress);
            ctx.fillStyle = 'black';
            ctx.fillRect(xN, yN, wN, hN);
          }
        }
      }
    }
  }
};  

let toggle = false;
const draw = function (t) {
  if (typeof transformAnim !== 'object') {
    //stretchAnim = move.setupAnim(stretch, t, 0);
    //crawlAnim = move.setupAnim(crawl, t, 0);
    if (toggle) {
      transformAnim = move.setupAnim(transform10, t, 0);
    } else {
      transformAnim = move.setupAnim(transform01, t, 0);
    }
    toggle = !toggle;
  }

  /*
  const size = 20;
  const s = move.animAt(stretchAnim, t);
  const w = s * size;
  const h = size * size / w;
  const x = xpos + size * move.animAt(crawlAnim, t);
  */
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  /*
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 100 + size / 2);
  ctx.lineTo(x + w/2, 100 + size / 2 - h/2);
  ctx.lineTo(x + w, 100 + size/2);
  ctx.lineTo(x + w/2, 100 + size / 2 + h/2);
  ctx.closePath();
  ctx.stroke();
  */

  /*
  ctx.fillStyle = 'orange';
  ctx.fillRect(x, 100 + size/2-h/2, w, h);
  */

  const grid = [[1,1,1,1,1,1],
                [1,1,1,0,1,1],
                [1,0,0,0,0,1],
                [1,1,1,0,1,1],
                [1,1,1,1,1,1]];

  const progress = move.animAt(transformAnim, t);
  drawGrid(grid, progress);

  /*
  ctx.fillStyle = '#808080';
  ctx.strokeStyle = '#404040';
  for (let j = 0; j < grid.length; j ++) {
    for (let i = 0; i < grid[j].length; i ++) {
      if (grid[j][i] === 1) {
        ctx.fillRect(x+w*i, y+h*j, w, h);
      }
      ctx.strokeRect(x+w*i, y+h*j, w, h);
    }
  }
  */

  if (move.isAnimDone(transformAnim, t)) {
    //stretchAnim = undefined;
    //crawlAnim = undefined;
    //xpos += size * 1.2;
    //window.requestAnimationFrame(draw);
    transformAnim = undefined;
  } else {
    window.requestAnimationFrame(draw);
  }
};

window.addEventListener('keydown', function () {
  window.requestAnimationFrame(draw);
});

})();
