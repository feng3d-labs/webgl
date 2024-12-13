import { IRenderPass } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { mat4 } from "gl-matrix";

main();

//
// Start here
//
function main()
{
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

  // Draw the scene
  const { projectionMatrix, modelViewMatrix } = drawScene(canvas);

  const webgl = new WebGL({ canvasId: "glcanvas", contextId: "webgl" });

  const renderPass: IRenderPass = {
    descriptor: {
      colorAttachments: [{
        clearValue: [0.0, 0.0, 0.0, 1.0],
        loadOp: "clear",
      }],
      depthStencilAttachment: {
        depthClearValue: 1.0,
        depthLoadOp: "clear",
      },
    },
    renderObjects: [{
      pipeline: {
        primitive: { topology: "triangle-strip" },
        vertex: {
          code: `
          attribute vec4 aVertexPosition;
          attribute vec4 aVertexColor;
      
          uniform mat4 uModelViewMatrix;
          uniform mat4 uProjectionMatrix;
      
          varying lowp vec4 vColor;
      
          void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
          }
        ` }, fragment: {
          code: `
          varying lowp vec4 vColor;
      
          void main(void) {
            gl_FragColor = vColor;
          }
        ` },
        depthStencil: { depthCompare: "less-equal" }
      },
      vertices: {
        aVertexPosition: {
          type: "FLOAT",
          data: new Float32Array([
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
          ]),
          numComponents: 2,
          normalized: false,
        },
        aVertexColor: {
          type: "FLOAT",
          data: new Float32Array([
            1.0, 1.0, 1.0, 1.0, // white
            1.0, 0.0, 0.0, 1.0, // red
            0.0, 1.0, 0.0, 1.0, // green
            0.0, 0.0, 1.0, 1.0, // blue
          ]),
          numComponents: 4,
          normalized: false,
        },
      },
      uniforms: {
        uProjectionMatrix: projectionMatrix,
        uModelViewMatrix: modelViewMatrix,
      },
      drawVertex: { firstVertex: 0, vertexCount: 4 },
    }],
  };

  webgl.submit({ commandEncoders: [{ passEncoders: [renderPass] }] });
}

//
// Draw the scene.
//
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

