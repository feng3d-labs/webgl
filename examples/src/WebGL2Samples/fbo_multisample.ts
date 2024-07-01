import { mat4, vec3 } from "gl-matrix";
import { IBuffer, IPassDescriptor, IRenderPipeline, IRenderbuffer, ITexture } from "../../../src";
import { getShaderSource } from "./utility";

const canvas = document.createElement("canvas");
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2", { antialias: false });

// -- Init program
const PROGRAM = {
    TEXTURE: 0,
    SPLASH: 1,
    MAX: 2
};

const programs: IRenderPipeline[] = [
    {
        vertex: { code: getShaderSource("vs-render") },
        fragment: { code: getShaderSource("fs-render") },
    },
    {
        vertex: { code: getShaderSource("vs-splash") },
        fragment: { code: getShaderSource("fs-splash") }
    },
];

const mvpLocationTexture = gl.getUniformLocation(programs[PROGRAM.TEXTURE], "MVP");
const mvpLocation = gl.getUniformLocation(programs[PROGRAM.SPLASH], "MVP");
const diffuseLocation = gl.getUniformLocation(programs[PROGRAM.SPLASH], "diffuse");

// -- Init primitive data
const vertexCount = 18;
const data = new Float32Array(vertexCount * 2);
let angle: number;
const radius = 0.1;
for (let i = 0; i < vertexCount; i++)
{
    angle = Math.PI * 2 * i / vertexCount;
    data[2 * i] = radius * Math.sin(angle);
    data[2 * i + 1] = radius * Math.cos(angle);
}

// -- Init buffers
const vertexDataBuffer: IBuffer = { data, usage: "STATIC_DRAW" };

const positions = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
]);
const vertexPosBuffer: IBuffer = { data: positions, usage: "STATIC_DRAW" };

const texCoords = new Float32Array([
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0
]);
const vertexTexBuffer: IBuffer = { data: texCoords, usage: "STATIC_DRAW" };

// -- Init Texture
// used for draw framebuffer storage
const FRAMEBUFFER_SIZE = {
    x: canvas.width,
    y: canvas.height
};
const texture: ITexture = {
    sampler: { minFilter: "NEAREST", magFilter: "NEAREST" }, internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE",
    sources: [{ level: 0, width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y, border: 0, pixels: null }],
};

// -- Init Frame Buffers
const FRAMEBUFFER = {
    RENDERBUFFER: 0,
    COLORBUFFER: 1
};
const colorRenderbuffer: IRenderbuffer = { samples: 4, internalformat: "RGBA8", width: FRAMEBUFFER_SIZE.x, height: FRAMEBUFFER_SIZE.y };

const framebuffers: IPassDescriptor[] = [
    {
        colorAttachments: [{ view: colorRenderbuffer }],
    },
    {
        colorAttachments: [{ view: { texture, level: 0 } }],
    },
];

// -- Init VertexArray
const vertexArrays = [
    gl.createVertexArray(),
    gl.createVertexArray()
];

const vertexPosLocation = 0; // set with GLSL layout qualifier

gl.bindVertexArray(vertexArrays[PROGRAM.TEXTURE]);
gl.enableVertexAttribArray(vertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.bindVertexArray(null);

gl.bindVertexArray(vertexArrays[PROGRAM.SPLASH]);

gl.enableVertexAttribArray(vertexPosLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const vertexTexLocation = 1; // set with GLSL layout qualifier
gl.enableVertexAttribArray(vertexTexLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
gl.vertexAttribPointer(vertexTexLocation, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.bindVertexArray(null);

// -- Render

// Pass 1
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[FRAMEBUFFER.RENDERBUFFER]);
gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
gl.useProgram(programs[PROGRAM.TEXTURE]);
gl.bindVertexArray(vertexArrays[PROGRAM.TEXTURE]);

const IDENTITY = mat4.create();
gl.uniformMatrix4fv(mvpLocationTexture, false, IDENTITY);
gl.drawArrays(gl.LINE_LOOP, 0, vertexCount);

// Blit framebuffers, no Multisample texture 2d in WebGL 2
gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffers[FRAMEBUFFER.RENDERBUFFER]);
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffers[FRAMEBUFFER.COLORBUFFER]);
gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
gl.blitFramebuffer(
    0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
    0, 0, FRAMEBUFFER_SIZE.x, FRAMEBUFFER_SIZE.y,
    gl.COLOR_BUFFER_BIT, gl.NEAREST
);

// Pass 2
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.useProgram(programs[PROGRAM.SPLASH]);
gl.uniform1i(diffuseLocation, 0);
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.bindVertexArray(vertexArrays[PROGRAM.SPLASH]);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const scaleVector3 = vec3.create();
vec3.set(scaleVector3, 8.0, 8.0, 8.0);
const mvp = mat4.create();
mat4.scale(mvp, IDENTITY, scaleVector3);

gl.uniformMatrix4fv(mvpLocation, false, mvp);
gl.drawArrays(gl.TRIANGLES, 0, 6);

// -- Delete WebGL resources
gl.deleteBuffer(vertexPosBuffer);
gl.deleteBuffer(vertexTexBuffer);
gl.deleteTexture(texture);
gl.deleteRenderbuffer(colorRenderbuffer);
gl.deleteFramebuffer(framebuffers[FRAMEBUFFER.RENDERBUFFER]);
gl.deleteFramebuffer(framebuffers[FRAMEBUFFER.COLORBUFFER]);
gl.deleteVertexArray(vertexArrays[PROGRAM.TEXTURE]);
gl.deleteVertexArray(vertexArrays[PROGRAM.SPLASH]);
gl.deleteProgram(programs[PROGRAM.TEXTURE]);
gl.deleteProgram(programs[PROGRAM.SPLASH]);
