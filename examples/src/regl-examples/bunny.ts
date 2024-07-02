import { IRenderObject, WebGL } from "../../../src";
import * as bunny from "./mikolalysenko/bunny";
import * as mat4 from "./stackgl/gl-mat4";

const webglcanvas = document.createElement("canvas");
webglcanvas.id = "glcanvas";
webglcanvas.style.position = "fixed";
webglcanvas.style.left = "0px";
webglcanvas.style.top = "0px";
webglcanvas.style.width = "100%";
webglcanvas.style.height = "100%";
document.body.appendChild(webglcanvas);

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
let viewportWidth = webglcanvas.clientWidth;
let viewportHeight = webglcanvas.clientHeight;

const renderObject: IRenderObject = {
    vertexArray: {
        vertices: {
            position: { buffer: { data: positions }, numComponents: 3 },
        },
        index: { data: indices }
    },
    uniforms: {
        model: mat4.identity([]),
        view: () =>
        {
            const t = 0.01 * tick;

            return mat4.lookAt([],
                [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
                [0, 2.5, 0],
                [0, 1, 0]);
        },
        projection: () =>
            mat4.perspective([],
                Math.PI / 4,
                viewportWidth / viewportHeight,
                0.01,
                1000),
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
    }
};

function draw()
{
    viewportWidth = webglcanvas.width = webglcanvas.clientWidth;
    viewportHeight = webglcanvas.height = webglcanvas.clientHeight;

    tick++;
    WebGL.runRenderObject({ canvasId: "glcanvas", antialias: true }, renderObject);

    requestAnimationFrame(draw);
}
draw();
