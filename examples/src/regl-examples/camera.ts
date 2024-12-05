import { IGLRenderObject, WebGL } from "@feng3d/webgl";

import { angleNormals } from "./mikolalysenko/angle-normals";
import * as bunny from "./mikolalysenko/bunny";
import { createCamera } from "./util/camera";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const webgl = new WebGL({ canvasId: "glcanvas", antialias: true });

const camera = createCamera({
    center: [0, 2.5, 0]
});

const positions = bunny.positions.reduce((pv: number[], cv: number[]) =>
{
    cv.forEach((v) => { pv.push(v); });

    return pv;
}, []);

const indices = bunny.cells.reduce((pv: number[], cv: number[]) =>
{
    cv.forEach((v) => { pv.push(v); });

    return pv;
}, []);

const normals = angleNormals(bunny.cells, bunny.positions).reduce((pv: number[], cv: number[]) =>
{
    cv.forEach((v) => { pv.push(v); });

    return pv;
}, []);

const renderObject: IGLRenderObject = {
    vertexArray: {
        vertices: {
            position: { buffer: { target: "ARRAY_BUFFER", data: new Float32Array(positions) }, numComponents: 3 },
            normal: { buffer: { target: "ARRAY_BUFFER", data: new Float32Array(normals) }, numComponents: 3 },
        },
        indices: new Uint16Array(indices)
    },
    uniforms: {},
    pipeline: {
        vertex: {
            code: `precision mediump float;
        uniform mat4 projection, view;
        attribute vec3 position, normal;
        varying vec3 vnormal;
        void main () {
          vnormal = normal;
          gl_Position = projection * view * vec4(position, 1.0);
        }` },
        fragment: {
            code: `precision mediump float;
        varying vec3 vnormal;
        void main () {
          gl_FragColor = vec4(abs(vnormal), 1.0);
        }`,
            targets: [{ blend: {} }],
        },
        depthStencil: { depth: { depthtest: true } },
    }
};

function draw()
{
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    camera(renderObject, canvas.width, canvas.height);

    webgl.submit({
        commandEncoders: [{
            passEncoders: [
                {
                    renderObjects: [renderObject]
                }
            ]
        }]
    });

    requestAnimationFrame(draw);
}
draw();
