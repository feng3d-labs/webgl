import { IRenderPass } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { mat4 } from "gl-matrix";

main();

function main()
{
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

    const { projectionMatrix, modelViewMatrix } = drawScene(canvas);

    const webgl = new WebGL({ canvasId: "glcanvas", contextId: "webgl" });

    const renderPass: IRenderPass = {
        descriptor: {
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
                depthStencil: { depthCompare: "less-equal" }
            },
            geometry: {
                primitive: { topology: "triangle-strip" },
                vertices: {
                    aVertexPosition: {
                        format: "float32x2",
                        data: new Float32Array([
                            1.0, 1.0,
                            -1.0, 1.0,
                            1.0, -1.0,
                            -1.0, -1.0,
                        ]),
                    }
                },
                draw: { __type: "DrawVertex", firstVertex: 0, vertexCount: 4 },
            },
            uniforms: {
                uProjectionMatrix: projectionMatrix,
                uModelViewMatrix: modelViewMatrix,
            },
        }],
    };

    webgl.submit({ commandEncoders: [{ passEncoders: [renderPass] }] });
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
