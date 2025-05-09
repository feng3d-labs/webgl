import { CanvasContext, RenderObject, Submit } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { mat4 } from "gl-matrix";

import sky_frag from "./sky_frag.glsl";
import sky_vert from "./sky_vert.glsl";
import { reactive } from "@feng3d/reactivity";

main();

//
// Start here
//
async function main()
{
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

    const renderingContext: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };

    const webgl = new WebGL(renderingContext);

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers();

    const renderObject: RenderObject = {
        pipeline: {
            vertex: {
                code: sky_vert
            }, fragment: {
                code: sky_frag
            },
            primitive: { topology: "triangle-list" },
            depthStencil: { depthCompare: "less-equal" }
        },
        vertices: {
            position: {
                format: "float32x3",
                data: buffers.position,
            },
        },
        indices: buffers.indices,
        draw: { __type__: "DrawIndexed", firstIndex: 0, indexCount: 36 },
        bindingResources: {
            modelMatrix: [10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 1],
            modelViewMatrix: [-3853.8425, -4464.3149, 8075.7534, 0, 0.0000, 8751.7734, 4838.0225, 0, -9227.5615, 1864.4976, -3372.7957, 0, -0.0000, -0.4583, -2.5568, 1],
            projectionMatrix: [1.2071, 0, 0, 0, 0, 2.4142, 0, 0, 0, 0, -1.0002, -1, 0, 0, -0.2000, 0],
            cameraPosition: [1.8602, 1.6380, -0.7769],
            sunPosition: [0.0000, 0.0349, -0.9994],
            rayleigh: 2,
            turbidity: 10,
            mieCoefficient: 0.0050,
            up: [0, 1, 0],
            mieDirectionalG: 0.2,
        },
    };

    const submit: Submit = {
        commandEncoders: [{
            passEncoders: [
                // 绘制
                {
                    descriptor: {
                        colorAttachments: [{ clearValue: [0.5, 0.5, 0.5, 1.0], loadOp: "clear" }],
                        depthStencilAttachment: { depthClearValue: 1.0, depthLoadOp: "clear" },
                    },
                    renderPassObjects: [renderObject],
                },
            ]
        }]
    };

    let then = 0;

    // Draw the scene repeatedly
    function render()
    {
        let now = Date.now();
        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        const fieldOfView = 45 * Math.PI / 180; // in radians
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        const modelMatrix = mat4.fromValues(10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 10000, 0, 0, 0, 0, 1);

        reactive(renderObject.bindingResources).modelMatrix = modelMatrix;
        reactive(renderObject.bindingResources).modelViewMatrix = mat4.clone(modelMatrix);
        reactive(renderObject.bindingResources).projectionMatrix = projectionMatrix;
        reactive(renderObject.bindingResources).cameraPosition = [0, 0, 0];

        webgl.submit(submit);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers()
{
    // Now create an array of positions for the cube.

    const positions = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ];

    return {
        position: new Float32Array(positions),
        indices: new Uint16Array(indices),
    };
}
