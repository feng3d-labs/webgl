import { RenderPass, Sampler, Texture, RenderObject } from "@feng3d/render-api";
import { GLSamplerTexture, WebGL } from "@feng3d/webgl";
import { mat4 } from "gl-matrix";

let cubeRotation = 0.0;

main();

//
// Start here
//
async function main()
{
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;

    const webgl = new WebGL({ canvasId: "glcanvas", contextId: "webgl" });

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers();

    const texture = await loadTexture("../../cubetexture.png");

    const renderObject: RenderObject = {
        pipeline: {
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
            depthStencil: { depthCompare: "less-equal" }
        },
        uniforms: { uSampler: texture },
        geometry: {
            primitive: { topology: "triangle-list" },
            vertices: {
                aVertexPosition: {
                    format: "float32x3",
                    data: buffers.position,
                },
                aVertexNormal: {
                    format: "float32x3",
                    data: buffers.normal,
                },
                aTextureCoord: {
                    format: "float32x2",
                    data: buffers.textureCoord,
                },
            },
            indices: buffers.indices,
            draw: { __type__: "DrawIndexed", firstIndex: 0, indexCount: 36 },
        }
    };

    const renderPass: RenderPass = {
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
        renderObjects: [renderObject],
    };

    let then = 0;

    // Draw the scene repeatedly
    function render(now: number)
    {
        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;

        const { projectionMatrix, modelViewMatrix, normalMatrix } = drawScene(canvas, deltaTime);

        renderObject.uniforms.uProjectionMatrix = projectionMatrix;
        renderObject.uniforms.uModelViewMatrix = modelViewMatrix;
        renderObject.uniforms.uNormalMatrix = normalMatrix;

        webgl.submit({ commandEncoders: [{ passEncoders: [renderPass] }] });

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
        -1.0, 0.0, 0.0
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

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

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

    // Now send the element array to GL

    return {
        position: new Float32Array(positions),
        normal: new Float32Array(vertexNormals),
        textureCoord: new Float32Array(textureCoordinates),
        indices: new Uint16Array(indices),
    };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
async function loadTexture(url: string)
{
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const img = new Image();
    img.src = url;
    await img.decode();

    const generateMipmap = isPowerOf2(img.width) && isPowerOf2(img.height);

    const texture: Texture = {
        size: [img.width, img.height],
        format: "rgba8unorm",
        sources: [{ image: img }],
        generateMipmap,
    };

    let sampler: Sampler = {};

    if (!generateMipmap)
    {
        sampler = { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge", minFilter: "linear" };
    }

    return { texture, sampler } as GLSamplerTexture;
}

function isPowerOf2(value: number)
{
    return (value & (value - 1)) === 0;
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
