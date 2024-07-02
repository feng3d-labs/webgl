const canvas = document.createElement("canvas");
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2", { antialias: false });
const isWebGL2 = !!gl;
if (!isWebGL2)
{
    document.getElementById("info").innerHTML = "WebGL 2 is not available.  See <a href=\"https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation\">How to get a WebGL 2 implementation</a>";

    return;
}

// -- Divide viewport

const windowSize = {
    x: canvas.width,
    y: canvas.height
};

const Textures = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    MAX: 3
};

const viewport = new Array(Textures.MAX);

viewport[Textures.RED] = {
    x: windowSize.x / 2,
    y: 0,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Textures.GREEN] = {
    x: windowSize.x / 2,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

viewport[Textures.BLUE] = {
    x: 0,
    y: windowSize.y / 2,
    z: windowSize.x / 2,
    w: windowSize.y / 2
};

// -- Initialize program

// Multiple out shaders
const multipleOutputProgram = createProgram(gl, getShaderSource("vs-multiple-output"), getShaderSource("fs-multiple-output"));

const multipleOutputUniformMvpLocation = gl.getUniformLocation(multipleOutputProgram, "mvp");

// Layer shaders
const layerProgram = createProgram(gl, getShaderSource("vs-layer"), getShaderSource("fs-layer"));

const layerUniformMvpLocation = gl.getUniformLocation(layerProgram, "mvp");
const layerUniformDiffuseLocation = gl.getUniformLocation(layerProgram, "diffuse");
const layerUniformLayerLocation = gl.getUniformLocation(layerProgram, "layer");

// -- Initialize buffer

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);
const vertexTexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

// -- Initialize vertex array

const multipleOutputVertexArray = gl.createVertexArray();
gl.bindVertexArray(multipleOutputVertexArray);

const multipleOutputVertexPosLocation = 0; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.vertexAttribPointer(multipleOutputVertexPosLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(multipleOutputVertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.bindVertexArray(null);

const layerVertexArray = gl.createVertexArray();
gl.bindVertexArray(layerVertexArray);

const layerVertexPosLocation = 0; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.vertexAttribPointer(layerVertexPosLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(layerVertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const layerVertexTexLocation = 4; // set with GLSL layout qualifier
gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
gl.vertexAttribPointer(layerVertexTexLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(layerVertexTexLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.bindVertexArray(null);

// -- Initialize texture

gl.activeTexture(gl.TEXTURE0);
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_BASE_LEVEL, 0);
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LEVEL, 0);
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

const w = 16;
const h = 16;

gl.texImage3D(gl.TEXTURE_2D_ARRAY,
    0,
    gl.RGB8,
    w,
    h,
    3, //depth
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    null);

// -- Initialize frame buffer

const frameBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffer);

const drawBuffers = new Array(3);
drawBuffers[Textures.RED] = gl.COLOR_ATTACHMENT0;
drawBuffers[Textures.GREEN] = gl.COLOR_ATTACHMENT1;
drawBuffers[Textures.BLUE] = gl.COLOR_ATTACHMENT2;

gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture, 0, Textures.RED);
gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT1, texture, 0, Textures.GREEN);
gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT2, texture, 0, Textures.BLUE);

let status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
if (status != gl.FRAMEBUFFER_COMPLETE)
{
    console.log(`fb status: ${status.toString(16)}`);

    return;
}

gl.drawBuffers(drawBuffers);

gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

// -- Render

// Clear color buffer
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Pass 1
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frameBuffer);

// Bind program
gl.useProgram(multipleOutputProgram);

const matrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);
gl.uniformMatrix4fv(multipleOutputUniformMvpLocation, false, matrix);
gl.bindVertexArray(multipleOutputVertexArray);
gl.viewport(0, 0, w, h);
gl.drawArrays(gl.TRIANGLES, 0, 6);

// Pass 2
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

// Bind program
gl.useProgram(layerProgram);
gl.uniformMatrix4fv(layerUniformMvpLocation, false, matrix);
gl.uniform1i(layerUniformDiffuseLocation, 0);

gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
gl.bindVertexArray(layerVertexArray);

status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
if (status != gl.FRAMEBUFFER_COMPLETE)
{
    console.log(`fb status: ${status.toString(16)}`);

    return;
}

for (let i = 0; i < Textures.MAX; ++i)
{
    gl.viewport(viewport[i].x, viewport[i].y, viewport[i].z, viewport[i].w);
    gl.uniform1i(layerUniformLayerLocation, i);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

const data = new Uint8Array(w * h * 4 * 3);
gl.bindFramebuffer(gl.READ_FRAMEBUFFER, frameBuffer);
gl.readBuffer(gl.COLOR_ATTACHMENT0);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data, 0);
gl.readBuffer(gl.COLOR_ATTACHMENT1);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data, w * h * 4);
gl.readBuffer(gl.COLOR_ATTACHMENT2);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data, w * h * 4 * 2);
console.log(data);

// Clean up
gl.deleteBuffer(vertexPosBuffer);
gl.deleteBuffer(vertexTexBuffer);
gl.deleteVertexArray(multipleOutputVertexArray);
gl.deleteVertexArray(layerVertexArray);
gl.deleteFramebuffer(frameBuffer);
gl.deleteTexture(texture);
gl.deleteProgram(multipleOutputProgram);
gl.deleteProgram(layerProgram);

