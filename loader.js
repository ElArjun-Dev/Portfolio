
TweenMax.to(".loading-screen", 4, {
    delay: 7,
    top: "-110%",
    ease: Expo.easeInOut
});



var t1 = new TimelineMax();

t1.from(".ringOne", 4, {
    delay: 0.4,
    opacity: 0,
    y:90,
    ease: Expo.easeInOut
}).from(".ringTwo", 4, {
    delay: 0.8,
    opacity: 0,
    y: 60,
    ease: Expo.easeInOut
}, "-=5").to(".ringOne", 4, {
    delay: 0.4,
    x: 80,
    ease: Expo.easeInOut
}).to(".ringTwo", 4, {
    delay: 0.8,
    x: 80,
    ease: Expo.easeInOut
},"-=5");

window.addEventListener("load", windowLoadHandler, false);

function windowLoadHandler() {
    if (document.querySelectorAll('canvas')) {
        [].forEach.call(document.querySelectorAll('canvas'), canvas => {
            canvasApp(canvas);
        });
    }
}

function canvasApp(canvas) {
    var theCanvas = canvas;
    var context = theCanvas.getContext("2d");

    var displayWidth;
    var displayHeight;
    var timer;
    var wait;
    var count;
    var numToAddEachFrame;
    var particleList;
    var recycleBin;
    var particleAlpha;
    var fLen;
    var m;
    var projCenterX;
    var projCenterY;
    var zMax;
    var turnAngle;
    var turnSpeed;
    var sphereRad, sphereCenterX, sphereCenterY, sphereCenterZ;
    var particleRad;
    var zeroAlphaDepth;
    var randAccelX, randAccelY, randAccelZ;
    var gravity;
    var rgbString;

    var p;
    var outsideTest;
    var nextParticle;
    var sinAngle;
    var cosAngle;
    var rotX, rotZ;
    var depthAlphaFactor;
    var i;
    var theta, phi;
    var x0, y0, z0;
        
    init();
    
    function init() {
        wait = 1;
        count = wait - 1;
        numToAddEachFrame = 4;

        let rgb = theCanvas.dataset.rgb;

        rgbString = `rgba(${rgb}, `;
        particleAlpha = 1; 
        
        displayWidth = theCanvas.width;
        displayHeight = theCanvas.height;
        
        fLen = 256; 
        projCenterX = displayWidth/2;
        projCenterY = displayHeight/2;
        
        zMax = fLen-2;
        
        particleList = {};
        recycleBin = {};
        
        randAccelX = 0.1;
        randAccelY = 0.1;
        randAccelZ = 0.1;
        
        gravity = 0; 
        
        particleRad = 2.5;
        sphereRad = 256;
        sphereCenterX = 0;
        sphereCenterY = 0;
        sphereCenterZ = -3 - sphereRad;
        
        zeroAlphaDepth = -750; 
        
        turnSpeed = 2*Math.PI/1600; 
        turnAngle = 0; 
        
        timer = setInterval(onTimer, 1000/24);
    }
    
    function onTimer() {
		
        count++;
            if (count >= wait) {
                        
            count = 0;
            for (i = 0; i < numToAddEachFrame; i++) {
                theta = Math.random()*2*Math.PI;
                phi = Math.acos(Math.random()*2-1);
                x0 = sphereRad*Math.sin(phi)*Math.cos(theta);
                y0 = sphereRad*Math.sin(phi)*Math.sin(theta);
                z0 = sphereRad*Math.cos(phi);
              
                var p = addParticle(x0, sphereCenterY + y0, sphereCenterZ + z0, 0.002*x0, 0.002*y0, 0.002*z0);
                
                p.attack = 50;
                p.hold = 50;
                p.decay = 160;
                p.initValue = 0;
                p.holdValue = particleAlpha;
                p.lastValue = 0;
                
                p.stuckTime = 80 + Math.random()*20;
                
                p.accelX = 0;
                p.accelY = gravity;
                p.accelZ = 0;
            }
        }
        
        // Update viewing angle
        turnAngle = (turnAngle + turnSpeed) % (2*Math.PI);
        sinAngle = Math.sin(turnAngle);
        cosAngle = Math.cos(turnAngle);

        // Background fill
        let bg = theCanvas.dataset.bg;

        context.fillStyle = bg;
        context.fillRect(0, 0, displayWidth, displayHeight);

        p = particleList.first;
        while (p != null) {

            nextParticle = p.next;

            p.age++;
            

            if (p.age > p.stuckTime) {	
                p.velX += p.accelX + randAccelX*(Math.random()*2 - 1);
                p.velY += p.accelY + randAccelY*(Math.random()*2 - 1);
                p.velZ += p.accelZ + randAccelZ*(Math.random()*2 - 1);
                
                p.x += p.velX;
                p.y += p.velY;
                p.z += p.velZ;
            }
            
         
            rotX = cosAngle*p.x + sinAngle*(p.z - sphereCenterZ);
            rotZ = -sinAngle*p.x + cosAngle*(p.z - sphereCenterZ) + sphereCenterZ;
            m = fLen/(fLen - rotZ);
            p.projX = rotX*m + projCenterX;
            p.projY = p.y*m + projCenterY;
                

            if (p.age < p.attack+p.hold+p.decay) {
                if (p.age < p.attack) {
                    p.alpha = (p.holdValue - p.initValue)/p.attack*p.age + p.initValue;
                } else if (p.age < p.attack+p.hold) {
                    p.alpha = p.holdValue;
                } else if (p.age < p.attack+p.hold+p.decay) {
                    p.alpha = (p.lastValue - p.holdValue)/p.decay*(p.age-p.attack-p.hold) + p.holdValue;
                }
            } else {
                p.dead = true;
            }

            if ((p.projX > displayWidth)||(p.projX<0)||(p.projY<0)||(p.projY>displayHeight)||(rotZ>zMax)) {
                outsideTest = true;
            } else {
                outsideTest = false;
            }
            
            if (outsideTest||p.dead) {
                recycle(p);
            } else {
                // Depth-dependent darkening
                depthAlphaFactor = (1-rotZ/zeroAlphaDepth);
                depthAlphaFactor = (depthAlphaFactor > 1) ? 1 : ((depthAlphaFactor<0) ? 0 : depthAlphaFactor);
                context.fillStyle = rgbString + depthAlphaFactor*p.alpha + ")";
                
                // Draw
                context.beginPath();
                context.arc(p.projX, p.projY, m*particleRad, 0, 2*Math.PI, false);
                context.closePath();
                context.fill();
            }
            
            p = nextParticle;
        }
    }
        
    function addParticle(x0, y0, z0, vx0, vy0, vz0) {
        var newParticle;
        

        if (recycleBin.first != null) {
            newParticle = recycleBin.first;
            // Remove from bin
            if (newParticle.next != null) {
                recycleBin.first = newParticle.next;
                newParticle.next.prev = null;
            } else {
                recycleBin.first = null;
            }
        } else {
            newParticle = {};
        }
        
        if (particleList.first == null) {
            particleList.first = newParticle;
            newParticle.prev = null;
            newParticle.next = null;
        } else {
            newParticle.next = particleList.first;
            particleList.first.prev = newParticle;
            particleList.first = newParticle;
            newParticle.prev = null;
        }
        
        // Initialize
        newParticle.x = x0;
        newParticle.y = y0;
        newParticle.z = z0;
        newParticle.velX = vx0;
        newParticle.velY = vy0;
        newParticle.velZ = vz0;
        newParticle.age = 0;
        newParticle.dead = false;
        if (Math.random() < 0.5) {
            newParticle.right = true;
        } else {
            newParticle.right = false;
        }
        return newParticle;		
    }
    
    function recycle(p) {

        if (particleList.first == p) {
            if (p.next != null) {
                p.next.prev = null;
                particleList.first = p.next;
            } else {
                particleList.first = null;
            }
        }
        else {
            if (p.next == null) {
                p.prev.next = null;
            } else {
                p.prev.next = p.next;
                p.next.prev = p.prev;
            }
        }

        if (recycleBin.first == null) {
            recycleBin.first = p;
            p.prev = null;
            p.next = null;
        } else {
            p.next = recycleBin.first;
            recycleBin.first.prev = p;
            recycleBin.first = p;
            p.prev = null;
        }
    }	
}


