// ------------- VARIABLES ------------- //
var ticking = false;
var isFirefox = (/Firefox/i.test(navigator.userAgent));
var isIe = (/MSIE/i.test(navigator.userAgent)) || (/Trident.*rv\:11\./i.test(navigator.userAgent));
var scrollSensitivitySetting = 30; //Increase/decrease this number to change sensitivity to trackpad gestures (up = less sensitive; down = more sensitive) 
var touchSensitivitySetting = 100; //Increase/decrease this number to change sensitivity to trackpad gestures (up = less sensitive; down = more sensitive) 

var slideDurationSetting = 600; //Amount of time for which slide is "locked"
var currentSlideNumber = 0;
var totalSlideNumber = $(".background").length;

// ------------- DETERMINE DELTA/SCROLL DIRECTION ------------- //
function parallaxScroll(evt) {
  if (isFirefox) {
    //Set delta for Firefox
    delta = evt.detail * (-120);
  } else if (isIe) {
    //Set delta for IE
    delta = -evt.deltaY;
  } else {
    //Set delta for all other browsers
    delta = evt.wheelDelta;
  }

  if (ticking != true) {
    if (delta <= -scrollSensitivitySetting) {
      //Down scroll
      ticking = true;
      if (currentSlideNumber !== totalSlideNumber - 1) {
        currentSlideNumber++;
        nextItem();
          checkSlide(currentSlideNumber);
      }
      slideDurationTimeout(slideDurationSetting);
    }
    if (delta >= scrollSensitivitySetting) {
      //Up scroll
      ticking = true;
      if (currentSlideNumber !== 0) {
        currentSlideNumber--;
      }
      previousItem();
          checkSlide(currentSlideNumber);
      slideDurationTimeout(slideDurationSetting);
    }
  }
}

// ------------- SET TIMEOUT TO TEMPORARILY "LOCK" SLIDES ------------- //
function slideDurationTimeout(slideDuration) {
  setTimeout(function() {
    ticking = false;
  }, slideDuration);
}

// ------------- ADD EVENT LISTENER ------------- //
var mousewheelEvent = isFirefox ? "DOMMouseScroll" : "wheel";
window.addEventListener(mousewheelEvent, _.throttle(parallaxScroll, 60), false);

// ------------- TOUCH COMPATABILITY -------------//

document.body.addEventListener('touchmove', touchmove);
document.body.addEventListener('touchstart', touchstart);


var startX, startY;

function touchstart(e)
{
	startX = e.touches[0].clientX;
	startY = e.touches[0].clientY;
}

function touchmove(e)
{
	var deltaX = e.touches[0].clientX - startX,
	deltaY = e.touches[0].clientY - startY;
	
	
	console.log('Delta x,y',deltaX, deltaY);
	
	
	if (ticking != true) {
    if (deltaY <= -touchSensitivitySetting) {
      //Down scroll
      ticking = true;
      if (currentSlideNumber !== totalSlideNumber - 1) {
        currentSlideNumber++;
        nextItem();
          checkSlide(currentSlideNumber);
      }
      slideDurationTimeout(slideDurationSetting);
    }
    if (deltaY >= touchSensitivitySetting) {
      //Up scroll
      ticking = true;
      if (currentSlideNumber !== 0) {
        currentSlideNumber--;
      }
      previousItem();
          checkSlide(currentSlideNumber);
      slideDurationTimeout(slideDurationSetting);
    }
  }

}





// ------------- SLIDE MOTION ------------- //
function nextItem() {
  var $previousSlide = $(".background").eq(currentSlideNumber - 1);
  $previousSlide.removeClass("up-scroll").addClass("down-scroll");
}

function previousItem() {
  var $currentSlide = $(".background").eq(currentSlideNumber);
  $currentSlide.removeClass("down-scroll").addClass("up-scroll");
}

function checkSlide(slide){
    if(slide==1)
        {
            $(".card").addClass('at');
            
        }
    else
        {
            setTimeout(function(){$(".card").removeClass('at');}, slideDurationSetting);
            
        }
}

//Thomas Attractor //

const canvas = document.createElement('canvas');
canvas.style.background = '#000'

   var element = document.getElementById("attractor");
   element.appendChild(canvas);
const gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}); 

let a1 = 0, a2 = 0, p, k = 150;


const fullScreenTriangle = new Float32Array([-1,3,-1,-1,3,-1])

const pointCount = 9999;
const thomasAttractor = new Float32Array(Array(pointCount*3)
        .fill(0).map(() => Math.random()*10-8))
const thomasAttractorColors = new Float32Array(Array(pointCount*3)
        .fill(0).map(() => Math.random()*10-8))



let t0 = 0;
let b = 0.208186;

for(let i=0;i<100;i++)
    calcThomasAttractorTick(0.1)

function calcThomasAttractorTick(dt) {
    for (let i = 0; i < pointCount; i++){
        const x = thomasAttractor[i*3]
        const y = thomasAttractor[i*3+1]
        const z = thomasAttractor[i*3+2]
        
        const dx = Math.sin(y) - b*x;
        const dy = Math.sin(z) - b*y;
        const dz = Math.sin(x) - b*z;

        thomasAttractor[i*3]   = x + dt * dx;
        thomasAttractor[i*3+1] = y + dt * dy;
        thomasAttractor[i*3+2] = z + dt * dz;
    }
}

function thomasAttractorTick(t) {
    calcThomasAttractorTick((t-t0)/1000)
    t0 = t;
}

const clearPass = program({
    type: gl.TRIANGLES, 
    
    buffers: {
        pt: 2
    },

    shaders: [`
            attribute vec2 pt;
            void main() {
                gl_Position=vec4(pt, 0.0, 1.0);
            }`, `
            void main() {
                gl_FragColor=vec4(0.0, 0.0, 0.0, .03);
            }`
    ]
});

const particles = program({
    type: gl.POINTS,
    
    buffers: {
        pt: 3,
        col: 3,
    },
    
    uniforms: {
        time: '1f', 
        resolution: '2f',
        a1: '1f',
        a2: '1f',
        k: '1f'
    },
    
    shaders: [`
            attribute vec3 pt;
            attribute vec3 col;
            uniform vec2 resolution;
            uniform float time;
            uniform float a1;
            uniform float a2;
            uniform float k;
            varying vec3 color;
            void main() {
                float far = 1000.0;
                
                float x = pt.x*cos(a1) + pt.z*sin(a1);
                float z = pt.z*cos(a1) - pt.x*sin(a1);
                float y = pt.y*cos(a2) + z*sin(a2);
                float d = z*cos(a2) - pt.y*sin(a2) + far;
                vec2 pos = vec2( (k/d)*x, (k/d)*y );
                pos.y *= resolution.x/resolution.y;
                color = col;
                gl_Position = vec4(pos, 0.0, 1.0);
                gl_PointSize = 2.0;
            }`, `
            varying vec3 color;
            void main() {
                gl_FragColor=vec4(color, 1.);
            }`]
});

gl.enable(gl.BLEND);

requestAnimationFrame(function draw(t) {
    b = 0.2 + Math.sin(t/1000)*0.05
    thomasAttractorTick(t);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 
    clearPass.bind();
    clearPass.buffers.pt(fullScreenTriangle);
    clearPass.draw(3);
    
    gl.blendFunc(gl.ONE, gl.ONE); // additive
    particles.bind();
    if (canvas.width != innerWidth || canvas.height !== innerHeight) {
        particles.uniforms.resolution([innerWidth, innerHeight]);
        gl.viewport(0, 0, canvas.width = innerWidth, canvas.height = innerHeight);
    }
    particles.buffers.pt(thomasAttractor);
    particles.buffers.col(thomasAttractorColors);
    particles.uniforms.time([t/1000]);
    particles.uniforms.a1([a1]);
    particles.uniforms.a2([a2]);
    particles.uniforms.k([k]);
    particles.draw(pointCount);
    
    requestAnimationFrame(draw);
});

function program(o) {
    const pid = gl.createProgram();

    o.shaders.forEach((src, i) => {
       
        const id = gl.createShader(i?gl.FRAGMENT_SHADER:gl.VERTEX_SHADER);
        gl.shaderSource(id, 'precision highp float;\n'+src);
        gl.compileShader(id);
        
        const message = gl.getShaderInfoLog(id);
        gl.attachShader(pid, id);
        if (message.length > 0) {
            console.log(src.split('\n').map((str, i) => 
                ("" + (1 + i)).padStart(4, "0") + ": " + str).join('\n'));
            throw message;
        }
    });

    gl.linkProgram(pid);
    gl.useProgram(pid);
    
    o.uniforms && Object.keys(o.uniforms).forEach(uf => {
        const loc = gl.getUniformLocation(pid, uf), 
              f = gl[`uniform${o.uniforms[uf]}`];
        o.uniforms[uf] = v => f.call(gl, loc, ...v);
    });
    
    Object.keys(o.buffers).forEach(attrName => {
        const attrLocation = gl.getAttribLocation(pid, attrName);
        gl.enableVertexAttribArray(attrLocation);            
        const bufferId = gl.createBuffer();
        const componentCount = o.buffers[attrName];
        let type;
        o.buffers[attrName] = (data) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            data && gl.bufferData(gl.ARRAY_BUFFER, data, 
                                  type = type ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);  
            gl.vertexAttribPointer(attrLocation, componentCount, gl.FLOAT, false, 0, 0); 
        };
    });
    
    o.draw = (primitivesCount) => gl.drawArrays(o.type, 0, primitivesCount);
    o.bind = () => gl.useProgram(pid);
    return o;
}

