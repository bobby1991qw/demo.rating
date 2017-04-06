class Arc {
    constructor(ctx, radius = 100, radian = Math.PI / 2, rotation = 0) {
        this.ctx = ctx;
        this.radius = radius;
        this.radian = radian;
        this.show = true;
        this.rotation = rotation;
    }

    draw(ctx = this.ctx) {
        const { radius, radian, show, rotation } = this;

        if (show) {
            const CENTER_X = ctx.canvas.width / 2;
            const CENTER_Y = ctx.canvas.height / 2;
            const startRadian = rotation;
            const endRadian = startRadian - radian;
            const startX = radius * Math.cos(startRadian);
            const startY = radius * Math.sin(startRadian);
            const endX = radius * Math.cos(endRadian);
            const endY = radius * Math.sin(endRadian);
            const line = ctx.createLinearGradient(startX, startY, endX, endY);
            const circle = ctx.createRadialGradient(startX, startY, 1, startX, startY, 3);

            line.addColorStop(0, 'rgba(88,229,255,0.8)');
            line.addColorStop(1, 'rgba(255,255,255,0)');
            circle.addColorStop(0, 'rgba(255,255,255,0.7)');
            circle.addColorStop(0.1, 'rgba(88,229,255,1)');
            circle.addColorStop(1, 'rgba(88,229,255,0.8)');

            ctx.save();
            ctx.lineWidth = 2;
            ctx.strokeStyle = line;
            ctx.translate(CENTER_X, CENTER_Y);
            ctx.beginPath();
            ctx.arc(0, 0, radius, rotation, rotation - radian, true);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = circle;
            ctx.arc(startX, startY, 2, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }
}

export default Arc;