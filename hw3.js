"use strict";

var gl;
var canvas;
var program;
var vertices = [];
var colors = [];
var modelViewMatrix;
var projectionMatrix;
var uModelViewMatrix;
var uProjectionMatrix;
var fixedpointLoc;
var axisLoc;
var angleLoc;
var angle = 0.0;
var fixed_point = [0.0, 0.0, 0.0];
var axis = [0.0, 1.0, 0.0];

function main() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL 2.0 isn't available");
    }

    // Define cube vertices and colors
    var side = 0.5;
    vertices = [
        // Front face
        vec3(-side, -side, side), vec3(side, -side, side), vec3(side, side, side),
        vec3(-side, -side, side), vec3(side, side, side), vec3(-side, side, side),
        // Back face
        vec3(-side, -side, -side), vec3(-side, side, -side), vec3(side, side, -side),
        vec3(-side, -side, -side), vec3(side, side, -side), vec3(side, -side, -side),
        // Top face
        vec3(-side, side, -side), vec3(-side, side, side), vec3(side, side, side),
        vec3(-side, side, -side), vec3(side, side, side), vec3(side, side, -side),
        // Bottom face
        vec3(-side, -side, -side), vec3(side, -side, -side), vec3(side, -side, side),
        vec3(-side, -side, -side), vec3(side, -side, side), vec3(-side, -side, side),
        // Right face
        vec3(side, -side, -side), vec3(side, side, -side), vec3(side, side, side),
        vec3(side, -side, -side), vec3(side, side, side), vec3(side, -side, side),
        // Left face
        vec3(-side, -side, -side), vec3(-side, -side, side), vec3(-side, side, side),
        vec3(-side, -side, -side), vec3(-side, side, side), vec3(-side, side, -side)
    ];

    colors = [
        // Red - Front face
        vec4(1.0, 0.0, 0.0, 1.0), 
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(1.0, 0.0, 0.0, 1.0),

        // Green - Back face
        vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 1.0, 0.0, 1.0), 

        // Blue - Top face
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),

        // Yellow - Bottom face
        vec4(1.0, 1.0, 0.0, 1.0), 
        vec4(1.0, 1.0, 0.0, 1.0), 
        vec4(1.0, 1.0, 0.0, 1.0), 
        vec4(1.0, 1.0, 0.0, 1.0), 
        vec4(1.0, 1.0, 0.0, 1.0), 
        vec4(1.0, 1.0, 0.0, 1.0), 

        // Cyan - Right face
        vec4(0.0, 1.0, 1.0, 1.0), 
        vec4(0.0, 1.0, 1.0, 1.0), 
        vec4(0.0, 1.0, 1.0, 1.0), 
        vec4(0.0, 1.0, 1.0, 1.0), 
        vec4(0.0, 1.0, 1.0, 1.0), 
        vec4(0.0, 1.0, 1.0, 1.0), 

        // Magenta - Left face
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0)
    ];

    // WebGL setup
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffer for cube vertices
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    // Buffer for cube colors
    var colorbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
    uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
    fixedpointLoc = gl.getUniformLocation(program, 'uFixedPoint');
    axisLoc = gl.getUniformLocation(program, 'uAxis');
    angleLoc = gl.getUniformLocation(program, 'uAngle');

    gl.uniform3fv(fixedpointLoc, fixed_point); 
    gl.uniform3fv(axisLoc, axis); 

    // Define matrices for model-view and projection transformation
    modelViewMatrix = lookAt(vec3(0.0, 0.0, 5.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    projectionMatrix = ortho(-2.0, 2.0, -2.0, 2.0, -10.0, 10.0);

    gl.uniformMatrix4fv(uModelViewMatrix, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(projectionMatrix));

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    angle += 0.01;
    
    gl.uniform1f(angleLoc, angle);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
    requestAnimationFrame(render);
}

main();
