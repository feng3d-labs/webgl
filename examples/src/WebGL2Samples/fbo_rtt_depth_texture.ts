const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2", { antialias: false });
const isWebGL2 = !!gl;
if (!isWebGL2)
{
    document.getElementById("info").innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

    return;
}

const windowSize = {
    x: gl.drawingBufferWidth,
    y: gl.drawingBufferHeight
};

// -- Initialize program

// Depth shaders
const depthProgram = createProgram(gl, getShaderSource("vs-depth"), getShaderSource("fs-depth"));

// Draw shaders
const drawProgram = createProgram(gl, getShaderSource("vs-draw"), getShaderSource("fs-draw"));

const drawUniformDepthLocation = gl.getUniformLocation(drawProgram, "depthMap");

// -- Initialize buffer

const triPositions = new Float32Array([
    -0.5, -0.5, -1.0,
    0.5, -0.5, -1.0,
    0.0, 0.5, 1.0
]);
const triVertexPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triVertexPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, triPositions, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const quadPositions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const quadVertexPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, quadPositions, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const quadTexcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const quadVertexTexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexTexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, quadTexcoords, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

// -- Initialize vertex array

const triVertexArray = gl.createVertexArray();
gl.bindVertexArray(triVertexArray);

const depthVertexPosLocation = 0; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, triVertexPosBuffer);
gl.vertexAttribPointer(depthVertexPosLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(depthVertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.bindVertexArray(null);

const quadVertexArray = gl.createVertexArray();
gl.bindVertexArray(quadVertexArray);

const drawVertexPosLocation = 0; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexPosBuffer);
gl.vertexAttribPointer(drawVertexPosLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(drawVertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const drawVertexTexLocation = 4; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexTexBuffer);
gl.vertexAttribPointer(drawVertexTexLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(drawVertexTexLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.bindVertexArray(null);

// -- Initialize depth texture

gl.activeTexture(gl.TEXTURE0);
const depthTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, depthTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// the proper texture format combination can be found here
// https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
gl.texImage2D(gl.TEXTURE_2D,
    0,
    gl.DEPTH_COMPONENT16,
    windowSize.x,
    windowSize.y,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_SHORT,
    null);

// -- Initialize frame buffer

const frameBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffer);
gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

const status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
if (status != gl.FRAMEBUFFER_COMPLETE)
{
    console.log(`fb status: ${status.toString(16)}`);

    return;
}

gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

// -- Render

// Pass 1: Depth
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffer);
gl.enable(gl.DEPTH_TEST); // Need to write depth
gl.clear(gl.DEPTH_BUFFER_BIT);

// Bind program
gl.useProgram(depthProgram);

gl.bindVertexArray(triVertexArray);
gl.drawArrays(gl.TRIANGLES, 0, 3);

// Pass 2: Draw
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Bind program
gl.useProgram(drawProgram);
gl.uniform1i(drawUniformDepthLocation, 0);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, depthTexture);
gl.bindVertexArray(quadVertexArray);
gl.drawArrays(gl.TRIANGLES, 0, 6);

// Clean up
gl.deleteBuffer(triVertexPosBuffer);
gl.deleteBuffer(quadVertexPosBuffer);
gl.deleteBuffer(quadVertexTexBuffer);
gl.deleteVertexArray(triVertexArray);
gl.deleteVertexArray(quadVertexArray);
gl.deleteFramebuffer(frameBuffer);
gl.deleteTexture(depthTexture);
gl.deleteProgram(depthProgram);
gl.deleteProgram(drawProgram);

