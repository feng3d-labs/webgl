import { Submit, RenderObject } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import * as bunny from "./mikolalysenko/bunny";
import * as mat4 from "./stackgl/gl-mat4";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const webgl = new WebGL({ canvasId: "glcanvas", webGLContextAttributes: { antialias: true } });

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

let tick = 0;
let viewportWidth = canvas.clientWidth;
let viewportHeight = canvas.clientHeight;

const renderObject: RenderObject = {
    geometry: {
        vertices: {
            position: { data: new Float32Array(positions), format: "float32x3" },
        },
        indices: new Uint16Array(indices),
        draw: { __type__: "DrawIndexed", indexCount: indices.length },
    },
    bindingResources: {
        model: mat4.identity([]),
    },
    pipeline: {
        vertex: {
            code: `precision mediump float;
        attribute vec3 position;
        uniform mat4 model, view, projection;
        void main() {
          gl_Position = projection * view * model * vec4(position, 1);
        }` },
        fragment: {
            code: `precision mediump float;
        void main() {
          gl_FragColor = vec4(1, 1, 1, 1);
        }`,
            targets: [{ blend: {} }],
        },
        depthStencil: {},
    }
};

const submit: Submit = {
    commandEncoders: [{
        passEncoders: [
            {
                descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1] }], depthStencilAttachment: { depthClearValue: 1 } },
                renderObjects: [renderObject]
            }
        ]
    }]
};

function draw()
{
    viewportWidth = canvas.width = canvas.clientWidth;
    viewportHeight = canvas.height = canvas.clientHeight;

    tick++;
    const t = 0.01 * tick;

    renderObject.bindingResources.view = mat4.lookAt([],
        [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
        [0, 2.5, 0],
        [0, 1, 0]);

    renderObject.bindingResources.projection
        = mat4.perspective([],
            Math.PI / 4,
            viewportWidth / viewportHeight,
            0.01,
            1000);

    webgl.submit(submit);

    requestAnimationFrame(draw);
}
draw();
