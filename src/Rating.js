import Rect from './Rect';
import Arc from './Arc';

class Rating {
    constructor(canvas, opts) {
        const defaultOpts = {
            width: '100%',
            height: '500px',
            rectNum: 60,
            rotationRadius: 70
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
        const colors = ['#ff3a3a', '#0000ff', '#8aff95'];
        const colorProcesser = colorProcesserFactory(colors, rectNum);
        let radian = -5 * Math.PI / 4;

        const MAX_RADIAN = 1.5 * Math.PI;
        const RADIAN_UNIT = MAX_RADIAN / rectNum;
        const CENTER_X = canvasWidth / 2;
        const CENTER_Y = canvasHeight / 2;

        for (let i = 0; i <= rectNum; i++) {
            const x = CENTER_X + rotationRadius * Math.cos(radian);
            const y = CENTER_Y + rotationRadius * Math.sin(radian);
            const r = new Rect(ctx, { x, y: y + 100, color: 'rgba(255,255,255,0.3)', width: 3, height: 15, rotation: radian + Math.PI / 2 });
            colorProcesser.excute(r, i);
            r.opacity = 0;

            rects.push(r);
            radian += RADIAN_UNIT;
        }


        return this;
    }

    start() {
        this.resize()
            .createDial()
            .render();
    }

    render() {
        const self = this;

        this
            .fadeIn()
            .on('change', function () {
                const { position, duration } = this;

                if (position >= duration) {
                    self.rate(100);
                }
            });
    }

    fadeIn() {
        const { Tween, Ease, Timeline } = window.createjs;
        const { rects, canvas, options } = this.data;
        const { rectNum, rotationRadius } = options;
        const CENTER_X = canvas.width / 2;
        const CENTER_Y = canvas.height / 2;
        const endRotationRadius = rotationRadius * 1.5;
        const animateQueue = [];

        rects.forEach(r => {
            const x = CENTER_X + endRotationRadius * Math.cos(r.rotation - Math.PI / 2);
            const y = CENTER_Y + endRotationRadius * Math.sin(r.rotation - Math.PI / 2);
            const opacityChange = new Tween.get(r).wait(400).to({ opacity: 1 }, 500, Ease.linear);
            const scaleChange = new Tween.get(r).wait(400).to({ x, y }, 500, Ease.backOut);
            animateQueue.push(opacityChange);
            animateQueue.push(scaleChange);
        });

        const animate = new Timeline(animateQueue);

        animate.on('change', () => {
            this.drawBackground()
            rects.forEach(r => r.draw());
        });

        return animate;
    }

    rate(score) {
        let text = { score: 0 };
        const totalTime = 700;
        const animateQueue = [];
        const startRotation = -5.1 * Math.PI / 4;
        const { Tween, Ease, Timeline } = window.createjs;
        const { rects, options, ctx } = this.data;
        const { rectNum, rotationRadius } = options;
        const scoreRectIndex = Math.round(score / 100 * rectNum);
        const light = new Arc(ctx, rotationRadius * 1.64, Math.PI / 4, startRotation);

        const textChange = new Tween.get(text).to({ score }, totalTime, Ease.linear);
        animateQueue.push(textChange);

        const lightChangeHandler = () => {
            const rotation = light.rotation % (2 * Math.PI);

            if (rotation < (1.5 * Math.PI / 4)) {
                light.show = true;
            } else {
                light.show = false;
            }
        };
        const lightChange = new Tween.get(light, { onChange: lightChangeHandler }).to({ rotation: 3 * Math.PI / 4 }, totalTime / 1.3, Ease.linear);

        const filledRects = rects.filter((r, i) => i <= scoreRectIndex);
        const timeUnit = totalTime / filledRects.length;

        filledRects.forEach((r, i) => {
            const rectChange = new Tween.get(r).wait(timeUnit * i).to({ filled: true }, timeUnit, Ease.linear);
            animateQueue.push(rectChange);
        });

        const animate = new Timeline(animateQueue);

        animate.on('change', () => {
            this
                .drawBackground()
                .drawText(Math.round(text.score))
                .drawRate();

            light.draw();
        });

        return animate;
    }

    drawBackground() {
        const BACKGROUND_COLOR = '#3b2369';
        const { ctx, canvas } = this.data;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const grad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, Math.min(canvasWidth, canvasHeight) / 3);

        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.35)');

        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        return this;
    }

    drawText(score) {
        const { ctx, canvas } = this.data;
        const CENTER_X = canvas.width / 2;
        const CENTER_Y = canvas.height / 2;

        ctx.save();
        ctx.font = '60px Microsoft Yahei';
        ctx.fillStyle = 'rgba(255,255,255,1)';
        const textInfo = ctx.measureText(score);
        ctx.fillText(score, CENTER_X - textInfo.width / 2, CENTER_Y + 40);
        ctx.restore();

        return this;
    }

    drawRate() {
        const { rects } = this.data;

        rects.forEach(r => r.draw());
    }

    drawLight(duration) {
        const { ctx, options } = this.data;
        const { rotationRadius } = options;
        const light = new Arc(ctx, rotationRadius + 20, Math.PI / 9);

        light.rotation = (3.75 * Math.PI * duration / 100) % (2 * Math.PI);
        light.draw();

        return this;
    }
}

function colorProcesserFactory(colors, rectLength) {
    const processer = {};
    const realColors = [getColorPrimary(colors[0])];

    colors.forEach((c, i, colorArray) => {
        if (i !== colorArray.length - 1) {
            const currColor = getColorPrimary(c);
            const nextColor = getColorPrimary(colorArray[i + 1]);

            realColors.push({
                r: (currColor.r + nextColor.r) / 2,
                g: (currColor.g + nextColor.g) / 2,
                b: (currColor.b + nextColor.b) / 2
            });
        }
    });

    realColors.push(getColorPrimary(colors[colors.length - 1]));

    const l = processer.length = realColors.length;

    processer.excute = (rect, index, rectLength) => {
        for (let i = 0; i < l - 1; i++) {
            if (processer[i](rect, index, rectLength)) {
                break;
            }
        }
    }

    for (let i = 0; i < l - 1; i++) {
        const currColorPrimary = realColors[i];
        const nextColorPrimary = realColors[i + 1];
        const rl = i === 0 || i === realColors.length - 2 ? rectLength / l : 2 * rectLength / l;
        const COLOR_R = (nextColorPrimary.r - currColorPrimary.r) / rl;
        const COLOR_G = (nextColorPrimary.g - currColorPrimary.g) / rl;
        const COLOR_B = (nextColorPrimary.b - currColorPrimary.b) / rl;
        let startColorR = currColorPrimary.r;
        let startColorG = currColorPrimary.g;
        let startColorB = currColorPrimary.b;

        processer[i] = (rect, index) => {
            if (index <= parseInt((rectLength / l) * (1 + 2 * i))) {
                rect.filledColor = `rgb(${Math.round(startColorR += COLOR_R)},${Math.round(startColorG += COLOR_G)},${Math.round(startColorB += COLOR_B)})`;

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

window.Rating = Rating;

export default Rating;
