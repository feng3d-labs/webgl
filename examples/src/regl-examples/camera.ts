import { RenderObject } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import { angleNormals } from "./mikolalysenko/angle-normals";
import * as bunny from "./mikolalysenko/bunny";
import { createCamera } from "./util/camera";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const webgl = new WebGL({ canvasId: "glcanvas", webGLContextAttributes: { antialias: true } });

const camera = createCamera({
    center: [0, 2.5, 0]
});

const positions = bunny.positions.flat();
const indices = bunny.cells.flat();
const normals = angleNormals(bunny.cells, bunny.positions).flat();

const renderObject: RenderObject = {
    vertices: {
        position: { data: new Float32Array(positions), format: "float32x3" },
        normal: { data: new Float32Array(normals), format: "float32x3" },
    },
    indices: new Uint16Array(indices),
    draw: { __type__: "DrawIndexed", indexCount: indices.length },
    bindingResources: {},
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
        depthStencil: { depthWriteEnabled: true },
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
                    descriptor: { colorAttachments: [{ clearValue: [0, 0, 0, 1] }] },
                    renderPassObjects: [renderObject]
                }
            ]
        }]
    });

    requestAnimationFrame(draw);
}
draw();
