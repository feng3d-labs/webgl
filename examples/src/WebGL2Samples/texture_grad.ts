import { mat4, vec3 } from "gl-matrix";
import { IIndexBuffer, IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const gl = canvas.getContext("webgl2", { antialias: false });

    // -- Init program
    const program: IProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        depthStencil: { depth: { depthtest: true } },
        primitive: { cullFace: { enableCullFace: true, cullMode: "BACK" } },
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
    const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

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
    const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // Element buffer
    const cubeVertexIndices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23 // left
    ];
    const indexBuffer: IIndexBuffer = { target: "ELEMENT_ARRAY_BUFFER", data: new Uint16Array(cubeVertexIndices), usage: "STATIC_DRAW" };

    // -- Init VertexArray
    const vertexArray: IVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 3 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        },
        index: indexBuffer,
    };

    // -- Init Texture

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: ITexture;
    let sampler: ISampler;
    loadImage(imageUrl, function (image)
    {
        // -- Init 2D Texture
        texture = {
            textureTarget: "TEXTURE_2D",
            flipY: false,
            internalformat: "RGB8",
            format: "RGB",
            type: "UNSIGNED_BYTE",
            storage: { levels: 1, width: 512, height: 512 },
            writeTextures: [{ level: 0, xoffset: 0, yoffset: 0, source: image }]
        };
        sampler = {
            minFilter: "NEAREST",
            magFilter: "NEAREST",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
        };

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

    const ro: IRenderObject = {
        pipeline: program,
        vertexArray,
        uniforms: {},
        drawElements: { indexCount: 36 },
    };

    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro],
    };

    function render()
    {
        // -- Render
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        orientation[0] = 0.00020; // yaw
        orientation[1] = 0.00010; // pitch
        orientation[2] = 0.00005; // roll

        mat4.rotateX(mvMatrix, mvMatrix, orientation[0] * Math.PI);
        mat4.rotateY(mvMatrix, mvMatrix, orientation[1] * Math.PI);
        mat4.rotateZ(mvMatrix, mvMatrix, orientation[2] * Math.PI);

        ro.uniforms.mvMatrix = mvMatrix;
        ro.uniforms.pMatrix = perspectiveMatrix;
        ro.uniforms.diffuse = { texture, sampler };

        WebGL.runRenderPass(rc, rp);

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
