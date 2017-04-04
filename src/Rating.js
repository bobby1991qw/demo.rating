import Rect from './Rect';
import Task from './Task';

class Rating {
    constructor(canvas, opts) {
        const defaultOpts = {
            width: '100%',
            height: '500px',
            rectNum: 99,
            rotationRadius: 130
        };

        this.data = {
            canvas,
            ctx: canvas.getContext('2d'),
            options: { ...defaultOpts, ...opts },
            rects: []
        }
    }

    resize() {
        const { options, canvas } = this.data;
        const { width, height } = options;
        const widthProcesser = validPx(width) || validPercent(width);
        const heightProcesser = validPx(height) || validPercent(height);

        widthProcesser && widthProcesser(canvas, 'width', width);
        heightProcesser && heightProcesser(canvas, 'height', height);

        return this;
    }

    createDial() {
        const { options, ctx, canvas, rects } = this.data;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const { rectNum, rotationRadius } = options;
        const colors = ['#ff0000', '#00ff00', '#0000ff'];
        const colorProcesser = colorProcesserFactory(colors);
        let radian = -7 * Math.PI / 6;

        const MAX_RADIAN = 4 * Math.PI / 3;
        const RADIAN_UNIT = MAX_RADIAN / rectNum;
        const CENTER_X = canvasWidth / 2;
        const CENTER_Y = canvasHeight / 2;

        for (let i = 0; i <= rectNum; i++) {
            const x = CENTER_X + rotationRadius * Math.cos(radian);
            const y = CENTER_Y + rotationRadius * Math.sin(radian);
            const r = new Rect(ctx, { x, y: y + 100, color: 'rgba(255,255,255,0.3)', width: 2, height: 20, rotation: radian + Math.PI / 2 });
            colorProcesser.excute(r, i, rectNum);
            r.opacity = 0;

            rects.push(r);
            radian += RADIAN_UNIT;
        }

        return this;
    }

    drawBackground() {
        const BACKGROUND_COLOR = '#3b2369';
        const { ctx, canvas } = this.data;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const grad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, 80);

        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.35)');

        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        return this;
    }

    fadeIn() {
        let duration = 90;
        let currentTime = undefined;
        let prevTime = +new Date();
        let dt = undefined;
        const self = this;
        const { rects, ctx, canvas, options } = this.data;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const CENTER_X = canvasWidth / 2;
        const CENTER_Y = canvasHeight / 2;
        const ROTATION_SCALE_RADIUS = options.rotationRadius + 20;
        let { rotationRadius } = options;
        let accelerationRadius = undefined;
        let radiusScale = 1;

        (function drawFrame() {
            if (duration > 0) {
                currentTime = +new Date();
                dt = currentTime - prevTime;
                const d = Math.round(dt / 10);

                accelerationRadius = (ROTATION_SCALE_RADIUS - rotationRadius) * 0.0001;
                radiusScale += accelerationRadius;
                rotationRadius *= radiusScale;

                if (dt <= 40) {
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                    self.drawBackground();

                    rects.forEach(r => {
                        r.x = CENTER_X + rotationRadius * Math.cos(r.rotation - Math.PI / 2);
                        r.y = CENTER_Y + rotationRadius * Math.sin(r.rotation - Math.PI / 2);
                        r.opacity += d / 90;

                        r.scale(radiusScale, radiusScale).draw();
                    });

                    duration -= d;
                    prevTime = currentTime;
                }

                window.requestAnimationFrame(drawFrame);
            } else {
                Task.resolve();
            }
        })();
    }

    drawText(score) {
        const { ctx, canvas } = this.data;
        const CENTER_X = canvas.width / 2;
        const CENTER_Y = canvas.height / 2;

        ctx.save();
        ctx.font = '80px Microsoft Yahei';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        const textInfo = ctx.measureText(score);
        ctx.fillText(score, CENTER_X - textInfo.width / 2, CENTER_Y + 40);
        ctx.restore();
    }
    

    rate(score) {
        let duration = 0;
        let prevTime = +new Date();
        let currTime = undefined;
        let dt = 0;

        const { ctx, canvas, rects, options } = this.data;
        const { rectNum } = options;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const self = this;
        const scoreIndex = Math.round(rectNum * score / 100);

        (function drawFrame() {
            if (duration < 100) {
                currTime = +new Date();
                dt = currTime - prevTime;
                prevTime = currTime;

                if (dt < 30) {
                    const d = parseInt(dt / 10);

                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                    self.drawBackground();
                    self.drawText(Math.min(duration, score));

                    rects.forEach((r, i) => {
                        if (i <= Math.min(duration, scoreIndex)) {
                            r.fill();
                        } else {
                            r.unFill();
                        }

                        r.draw();
                    });

                    duration += d;
                }
            } else {
                Task.resolve();
            }

            window.requestAnimationFrame(drawFrame);
        })();
    }

    start() {
        const self = this;
        this.resize()
            .drawBackground()
            .createDial();

        Task
            .add(() => {
                self.fadeIn();
            })
            .add(() => {
                self.rate(78);
            })
            .start();
    }
}

function colorProcesserFactory(colors) {
    const processer = {};
    const l = processer.length = colors.length - 1;

    processer.excute = (rect, index, rectLength) => {
        for (let i = 0; i < l; i++) {
            if (processer[i](rect, index, rectLength)) {
                break;
            }
        }
    }

    for (let i = 0; i < l; i++) {
        const currColorPrimary = getColorPrimary(colors[i]);
        const nextColorPrimary = getColorPrimary(colors[i + 1]);

        processer[i] = (rect, index, rectLength) => {
            if (index <= (rectLength / l * (i + 1))) {
                const COLOR_R = (nextColorPrimary.r - currColorPrimary.r) / rectLength;
                const COLOR_G = (nextColorPrimary.g - currColorPrimary.g) / rectLength;
                const COLOR_B = (nextColorPrimary.b - currColorPrimary.b) / rectLength;

                rect.filledColor = `rgb(${currColorPrimary.r + Math.round(index * COLOR_R)},${currColorPrimary.g + Math.round(index * COLOR_G)},${currColorPrimary.b + Math.round(index * COLOR_B)})`;

                return true;
            } else {
                return false;
            }

        }
    }

    return processer;
}

function getColorPrimary(color) {
    color = parseInt(color.substr(1), 16);

    return {
        r: color >> 16 & 0xff,
        g: color >> 8 & 0xff,
        b: color & 0xff
    }
}

function validPx(str) {
    const p = /^\d+(.\d+)?(px)?$/;

    return p.test(str) && resizePx;
}

function resizePx(ele, type, value) {
    ele[type] = parseInt(value);
}

function validPercent(str) {
    const p = /^\d+(.\d+)?%$/;

    return p.test(str) && resizePercent;
}

function resizePercent(ele, type, value) {
    const parent = ele.parentElement;
    const bounding = parent.getBoundingClientRect();

    ele[type] = bounding[type] * parseInt(value) / 100;
}

export default Rating;