import { CanvasContext, RenderObject, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import { mat4, vec3 } from "gl-matrix";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: {
            code: getShaderSource("fs"), targets: [{

            }]
        },
        depthStencil: {},
    };

    // -- Init buffers

    const positions = new Float32Array([
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
        -1.0, 1.0, -1.0
    ]);

    const texCoords = new Float32Array([
        // Front face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Back face
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,

        // Top face
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        // Bottom face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Right face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

        // Left face
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0
    ]);

    // Element buffer

    const cubeVertexIndices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23 // left
    ];

    // -- Init VertexArray
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x3" },
            texcoord: { data: texCoords, format: "float32x2" },
        },
    };

    // -- Init Texture

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: Texture;
    let sampler: Sampler;
    loadImage(imageUrl, function (image)
    {
        // -- Init 2D Texture
        texture = {
            format: "rgba8unorm",
            mipLevelCount: 1,
            size: [512, 512],
            sources: [{
                image, flipY: false,
            }]
        };
        sampler = {
            minFilter: "nearest",
            magFilter: "nearest",
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
        };

        // // -- Allocate storage for the texture
        // gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, 512, 512);
        // gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, image);

        requestAnimationFrame(render);
    });

    // -- Initialize render variables
    const orientation = [0.0, 0.0, 0.0];

    const modelMatrix = mat4.create();

    const mvMatrix = mat4.create();
    const translate = vec3.create();
    vec3.set(translate, 0, 0, -10);
    mat4.translate(mvMatrix, modelMatrix, translate);
    const perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 0.785, 1, 1, 1000);

    // -- Mouse Behaviour

    let mouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    canvas.onmousedown = function (event)
    {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    };

    canvas.onmouseup = function (event)
    {
        mouseDown = false;
    };

    canvas.onmousemove = function (event)
    {
        const newX = event.clientX;
        const newY = event.clientY;

        const deltaX = newX - lastMouseX;
        const deltaY = newY - lastMouseY;

        const m = mat4.create();

        mat4.rotateX(m, m, deltaX / 100.0);
        mat4.rotateY(m, m, deltaY / 100.0);

        const scale = vec3.create();
        vec3.set(scale, (1 + deltaX / 1000.0), (1 + deltaX / 1000.0), (1 + deltaX / 1000.0));
        mat4.scale(m, m, scale);

        mat4.multiply(mvMatrix, mvMatrix, m);

        lastMouseX = newX;
        lastMouseY = newY;
    };

    const ro: RenderObject = {
        pipeline: program,
        bindingResources: {},
        geometry: {
            primitive: { topology: "triangle-list", cullFace: "back" },
            vertices: vertexArray.vertices,
            indices: new Uint16Array(cubeVertexIndices),
            draw: { __type__: "DrawIndexed", indexCount: 36 },
        }
    };

    const rp: RenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro]
    };

    function render()
    {
        // -- Render
        orientation[0] = 0.00020; // yaw
        orientation[1] = 0.00010; // pitch
        orientation[2] = 0.00005; // roll

        mat4.rotateX(mvMatrix, mvMatrix, orientation[0] * Math.PI);
        mat4.rotateY(mvMatrix, mvMatrix, orientation[1] * Math.PI);
        mat4.rotateZ(mvMatrix, mvMatrix, orientation[2] * Math.PI);

        ro.bindingResources.mvMatrix = mvMatrix;
        ro.bindingResources.pMatrix = perspectiveMatrix;
        ro.bindingResources.diffuse = { texture, sampler };

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        requestAnimationFrame(render);
    }

    // If you have a long-running page, and need to delete WebGL resources, use:
    //
    // gl.deleteBuffer(vertexPosBuffer);
    // gl.deleteBuffer(vertexTexBuffer);
    // gl.deleteBuffer(indexBuffer);
    // gl.deleteTexture(texture);
    // gl.deleteProgram(program);
    // gl.deleteVertexArray(vertexArray);
})();
