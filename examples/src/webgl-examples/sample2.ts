import { mat4 } from "gl-matrix";
import { IWebGLBuffer, IWebGLRenderPipeline, WebGLRenderer } from "../../../src";

main();

//
// Start here
//
function main()
{
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

    // Vertex shader program

    const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

    // Fragment shader program

    const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

    const program: IWebGLRenderPipeline = { vertex: vsSource, fragment: fsSource };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers();

    drawScene(program, buffers, canvas);
}

function initBuffers()
{
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];

    const positionBuffer: IWebGLBuffer = { target: "ARRAY_BUFFER", data: new Float32Array(positions), usage: "STATIC_DRAW" };

    return {
        position: positionBuffer,
    };
}

function drawScene(programInfo: IWebGLRenderPipeline, buffers: {
    position: IWebGLBuffer;
}, canvas: HTMLCanvasElement)
{
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

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

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]); // amount to translate

    //
    WebGLRenderer.submit({
        canvasContext: { canvasId: "glcanvas", contextId: "webgl" },
        renderPasss: [{
            passDescriptor: {
                colorAttachments: [{
                    clearValue: [0, 0, 0, 1],
                    loadOp: "clear",
                }],
                clearDepth: 1.0,
                depthTest: true,
                depthFunc: "LEQUAL",
                clearMask: ["DEPTH_BUFFER_BIT"],
            },
            renderObjects: [{
                pipeline: programInfo,
                attributes: {
                    aVertexPosition: {
                        type: "FLOAT",
                        array: buffers.position.data,
                        itemSize: 2,
                    }
                },
                uniforms: {
                    uProjectionMatrix: projectionMatrix,
                    uModelViewMatrix: modelViewMatrix,
                },
                drawCall: { drawMode: "TRIANGLE_STRIP", offset: 0, count: 4 },
            }],
        }],
    });
}
