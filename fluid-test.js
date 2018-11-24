var gravity = 0.05;
var atomFieldSize = 30;
var atomForce = 0.1;
var bounceFactor = 0.5;
var numParticles = 500;

$(function() {

    // Set Up Canvas
    var gui = {};
    gui.canvas = document.getElementById("fluid-test");
    gui.canvas.width = gui.width = 200;
    gui.canvas.height = gui.height = 400;
    gui.bgcolor = "#000000";
    gui.ctx = gui.canvas.getContext("2d");

    // Set up buffer
    gui.buffer = document.createElement('canvas');
    gui.buffer.width = gui.width;
    gui.buffer.height = gui.height;
    gui.bufferctx = gui.buffer.getContext("2d");
    gui.bufferctx.fillStyle = gui.bgcolor;

    // Initialize Graphics
    gui.ctx.fillStyle = gui.bgcolor;
    gui.ctx.fillRect(0, 0, 500, 500);
    gui.bufferpixel = generatePixel(gui.bufferctx);

    particles = [];
    // for (var i = 0; i < numParticles; i++) {
    //     particles.push(new Particle(Math.random() * gui.width, Math.random() * gui.height, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));
    // }

    window.particles = particles;
    // Main Loop
    setInterval(function() {
        gui.bufferctx.fillStyle = "#FFFFFF";

        if (particles.length < 500 && Math.random() < 0.1) {
            particles.push(new Particle(gui.width / 2 + ((Math.random() - 0.5) * 0.1), 0, 0, 0));
        }

        for (var ref1 in particles) {
            var particle = particles[ref1];

            // Particle Physics
            particle.vy += gravity;

            for (var ref2 in particles) {
                if (ref1 == ref2) continue;
                var otherParticle = particles[ref2];

                if (otherParticle.insideInfluence(particle)) {
                    otherParticle.applyInfluence(particle);
                }
            }

            if ((particle.y >= gui.height - 1 && particle.vy > 0) ||
                (particle.y <= 0 && particle.vy < 0)) {
                particle.vx *= bounceFactor;
                particle.vy *= bounceFactor * -1;
                if (particle.vy < 0.015 && particle.vy > -0.015) particle.vy = 0;
            }

            if ((particle.x >= gui.width - 1 && particle.vx > 0) ||
                (particle.x <= 0 && particle.vx < 0)) {
                particle.vx *= bounceFactor * -1;
                particle.vy *= bounceFactor;
                if (particle.vx < 0.015 && particle.vx > -0.015) particle.vx = 0;
            }

            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0) particle.x = 0;
            if (particle.x >= gui.width) particle.x = gui.width - 1;
            if (particle.y < 0) particle.y = 0;
            if (particle.y >= gui.height) particle.y = gui.height - 1;

            drawParticle(gui, particle)
        }

        refreshScreen(gui);

    }, 10);
});

function drawParticle(gui, particle) {
    gui.bufferctx.fillRect(particle.x - 1, particle.y - 1, 3, 3);
}

function refreshScreen(gui) {
    gui.ctx.drawImage(gui.buffer, 0, 0);
    var oldFill = gui.bufferctx.fillStyle;
    gui.bufferctx.fillStyle = gui.bgcolor;
    gui.bufferctx.fillRect(0, 0, gui.width, gui.height);
}

function generatePixel(ctx) {
    var pixel = ctx.createImageData(1, 1);
    var d = pixel.data;
    d[0] = 255;
    d[1] = 255;
    d[2] = 255;
    return pixel;
}

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;

        this.vx = vx;
        this.vy = vy;

        this.fieldSize = atomFieldSize;
        this.fieldForce = atomForce;
    }

    squareDistanceTo(otherParticle) {
        return Math.pow(this.x - otherParticle.x, 2) + Math.pow(this.y - otherParticle.y, 2)
    }

    insideInfluence(otherParticle) {
        return this.squareDistanceTo(otherParticle) <= Math.pow(otherParticle.fieldSize, 2);
    }

    applyInfluence(otherParticle) {
        var vlength = Math.sqrt(this.squareDistanceTo(otherParticle));
        var fullvx = otherParticle.x - this.x;
        var fullvy = otherParticle.y - this.y;
        var normvx = fullvx / vlength;
        var normvy = fullvy / vlength;

        var forceIntensity = (otherParticle.fieldSize - vlength) / otherParticle.fieldSize;
        if (forceIntensity < 0 || forceIntensity > 1) {
            console.log("Warning");
        }
        this.vx += otherParticle.fieldForce * forceIntensity * normvx * -1;
        this.vy += otherParticle.fieldForce * forceIntensity * normvy * -1;
    }
}