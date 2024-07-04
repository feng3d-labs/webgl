import { mat4 } from "gl-matrix";
import { WebGL } from "../../../src";
import { IRenderPass } from "../../../src/data/IRenderPass";

main();

function main()
{
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

    const { projectionMatrix, modelViewMatrix } = drawScene(canvas);

    const renderPasss: IRenderPass = {
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
                vertex: {
                    code: `
            attribute vec4 aVertexPosition;
        
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            void main() {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }` }, fragment: {
                    code: `
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            }` },
                depthStencil: { depth: { depthCompare: "LEQUAL" } }
            },
            vertexArray: {
                vertices: {
                    aVertexPosition: {
                        type: "FLOAT",
                        buffer: {
                            target: "ARRAY_BUFFER",
                            data: new Float32Array([
                                1.0, 1.0,
                                -1.0, 1.0,
                                1.0, -1.0,
                                -1.0, -1.0,
                            ]), usage: "STATIC_DRAW"
                        },
                        numComponents: 2,
                    }
                },
            },
            uniforms: {
                uProjectionMatrix: projectionMatrix,
                uModelViewMatrix: modelViewMatrix,
            },
            drawArrays: { firstVertex: 0, vertexCount: 4 },
        }],
    };

    WebGL.runRenderPass({ canvasId: "glcanvas", contextId: "webgl" }, renderPasss);
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
