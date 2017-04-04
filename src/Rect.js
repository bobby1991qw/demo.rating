class Rect {
    constructor(ctx, { x = 0, y = 0, width = 2, height = 10, color = '#fff', filledColor = '#fff', rotation = 0 }) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.filledColor = filledColor;
        this.rotation = rotation;
        this.scaleX = 1;
        this.scaleY = 1;
        this.opacity = 1;
        this.filled = false;
    }

    draw(ctx = this.ctx) {
        const { color, filledColor, filled, x, y, width, height, rotation, scaleX, scaleY, opacity } = this;

        ctx.save();
        ctx.strokeStyle = filled ? filledColor : color;
        ctx.lineWidth = width;
        ctx.lineCap="square";
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scaleX, scaleY);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();        
    }

    fill() {
        this.filled = true;
    }

    unFill() {
        this.filled = false;
    }

    translate(offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;

        return this;
    }

    scale(scaleX, scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;

        return this;
    }
}

export default Rect;