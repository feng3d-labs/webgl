import { mat4 } from "gl-matrix";
import { IWebGLBuffer, WebGL } from "../../../src";

main();

function main()
{
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];

    const positionBuffer: IWebGLBuffer = { target: "ARRAY_BUFFER", data: new Float32Array(positions), usage: "STATIC_DRAW" };

    const { projectionMatrix, modelViewMatrix } = drawScene(canvas);

    //
    WebGL.submit({
        canvasContext: { canvasId: "glcanvas", contextId: "webgl" },
        renderPasss: [{
            passDescriptor: {
                colorAttachments: [{
                    clearValue: [0, 0, 0, 1],
                    loadOp: "clear",
                }],
                depthStencilAttachment: {
                    depthClearValue: 1.0,
                    depthLoadOp: "clear",
                },
            },
            renderObjects: [{
                pipeline: {
                    primitive: { topology: "TRIANGLE_STRIP" },
                    vertex: `
                attribute vec4 aVertexPosition;
            
                uniform mat4 uModelViewMatrix;
                uniform mat4 uProjectionMatrix;
            
                void main() {
                  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                }`, fragment: {
                        code: `
                void main() {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }` },
                    depthStencil: { depthCompare: "LEQUAL" }
                },
                attributes: {
                    aVertexPosition: {
                        type: "FLOAT",
                        array: positionBuffer.data,
                        itemSize: 2,
                    }
                },
                uniforms: {
                    uProjectionMatrix: projectionMatrix,
                    uModelViewMatrix: modelViewMatrix,
                },
                drawVertex: { firstVertex: 0, vertexCount: 4 },
            }],
        }],
    });
}

function drawScene(canvas: HTMLCanvasElement)
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

    return { projectionMatrix, modelViewMatrix };
}
