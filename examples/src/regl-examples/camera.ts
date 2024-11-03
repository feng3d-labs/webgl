import { IGLRenderObject, WebGL } from "@feng3d/webgl-renderer";

import { angleNormals } from "./mikolalysenko/angle-normals";
import * as bunny from "./mikolalysenko/bunny";
import { createCamera } from "./util/camera";

const webglcanvas = document.createElement("canvas");
webglcanvas.id = "glcanvas";
webglcanvas.style.position = "fixed";
webglcanvas.style.left = "0px";
webglcanvas.style.top = "0px";
webglcanvas.style.width = "100%";
webglcanvas.style.height = "100%";
document.body.appendChild(webglcanvas);

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
        index: { target: "ELEMENT_ARRAY_BUFFER", data: new Uint16Array(indices) }
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
    webglcanvas.width = webglcanvas.clientWidth;
    webglcanvas.height = webglcanvas.clientHeight;

    camera(renderObject, webglcanvas.width, webglcanvas.height);

    webgl.runRenderPass({ renderObjects: [renderObject] });

    requestAnimationFrame(draw);
}
draw();
