import { mat4 } from "gl-matrix";
import { IRenderObject, IRenderPass, ISampler, ITexture, WebGL } from "@feng3d/webgl-renderer";
import { ISamplerTexture } from "../../../src/data/ISamplerTexture";

let cubeRotation = 0.0;
// will set to true when video can be copied to texture
let copyVideo = false;

main();

//
// Start here
//
function main()
{
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers();

  const texture = initTexture();

  const video = setupVideo("../../Firefox.mp4");

  const renderObject: IRenderObject = {
    pipeline: {
      primitive: { topology: "TRIANGLES" },
      vertex: {
        code: `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
    
          // Apply lighting effect
    
          highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
          highp vec3 directionalLightColor = vec3(1, 1, 1);
          highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
    
          highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    
          highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
          vLighting = ambientLight + (directionalLightColor * directional);
        }
      ` }, fragment: {
        code: `
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
          gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
        }
      ` },
      depthStencil: { depth: { depthtest: true, depthCompare: "LEQUAL" } }
    },
    vertexArray: {
      vertices: {
        aVertexPosition: {
          type: "FLOAT",
          buffer: {
            target: "ARRAY_BUFFER",
            data: buffers.position,
            usage: "STATIC_DRAW",
          },
          numComponents: 3,
          normalized: false,
        },
        aVertexNormal: {
          type: "FLOAT",
          buffer: {
            target: "ARRAY_BUFFER",
            data: buffers.normal,
            usage: "STATIC_DRAW",
          },
          numComponents: 3,
          normalized: false,
        },
        aTextureCoord: {
          type: "FLOAT",
          buffer: {
            target: "ARRAY_BUFFER",
            data: buffers.textureCoord,
            usage: "STATIC_DRAW",
          },
          numComponents: 2,
          normalized: false,
        },
      },
      index: { target: "ELEMENT_ARRAY_BUFFER", data: buffers.indices }
    },
    uniforms: { uSampler: texture },
    drawElements: { firstIndex: 0, indexCount: 36 },
  };

  const renderPasss: IRenderPass = {
    passDescriptor: {
      colorAttachments: [{
        clearValue: [0.0, 0.0, 0.0, 1.0],
        loadOp: "clear",
      }],
      depthStencilAttachment: {
        depthClearValue: 1.0,
        depthLoadOp: "clear",
      },
    },
    renderObjects: [renderObject],
  };

  let then = 0;

  // Draw the scene repeatedly
  function render(now: number)
  {
    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;

    if (copyVideo)
    {
      updateTexture(texture.texture, video);
    }

    const { projectionMatrix, modelViewMatrix, normalMatrix } = drawScene(canvas, deltaTime);

    renderObject.uniforms.uProjectionMatrix = projectionMatrix;
    renderObject.uniforms.uModelViewMatrix = modelViewMatrix;
    renderObject.uniforms.uNormalMatrix = normalMatrix;

    WebGL.runRenderPass({ canvasId: "glcanvas", contextId: "webgl" }, renderPasss);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function setupVideo(url)
{
  const video = document.createElement("video");

  let playing = false;
  let timeupdate = false;

  video.autoplay = true;
  video.muted = true;
  video.loop = true;

  // Waiting for these 2 events ensures
  // there is data in the video

  video.addEventListener("playing", function ()
  {
    playing = true;
    checkReady();
  }, true);

  video.addEventListener("timeupdate", function ()
  {
    timeupdate = true;
    checkReady();
  }, true);

  video.src = url;
  video.play();

  function checkReady()
  {
    if (playing && timeupdate)
    {
      copyVideo = true;
    }
  }

  return video;
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

  // Set up the normals for the vertices, so that we can compute lighting.

  const vertexNormals = [
    // Front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
  ];

  // Now set up the texture coordinates for the faces.

  const textureCoordinates = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
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
    normal: new Float32Array(vertexNormals),
    textureCoord: new Float32Array(textureCoordinates),
    indices: new Uint16Array(indices),
  };
}

//
// Initialize a texture.
//
function initTexture(): ISamplerTexture
{
  const texture: ITexture = {
    target: "TEXTURE_2D", internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE",
    sources: [{ width: 1, height: 1, pixels: new Uint8Array([0, 0, 255, 255]) }],
  };
  const sampler: ISampler = { wrapS: "CLAMP_TO_EDGE", wrapT: "CLAMP_TO_EDGE", minFilter: "LINEAR" };

  return { texture, sampler };
}

//
// copy the video texture
//
function updateTexture(texture: ITexture, video: HTMLVideoElement)
{
  texture.sources = [{ source: video }];
}

//
// Draw the scene.
//
function drawScene(canvas: HTMLCanvasElement, deltaTime: number)
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
  mat4.rotate(modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1]); // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0]); // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Update the rotation for the next draw

  cubeRotation += deltaTime;

  return { projectionMatrix, modelViewMatrix, normalMatrix };
}

