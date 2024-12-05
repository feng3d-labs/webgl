import { IGLIndexBuffer, IGLProgram, IGLRenderObject, IGLRenderPass, IGLCanvasContext, IGLSampler, IGLTexture, IGLVertexAttributes, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { mat4, vec3 } from "gl-matrix";
import { HalfFloat } from "./third-party/HalfFloatUtility";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: IGLProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        primitive: { topology: "TRIANGLES", cullFace: { enableCullFace: true, cullMode: "BACK" } },
        depthStencil: { depth: { depthtest: true } },
    };

    // -- Init geometries
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
    const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const normals = HalfFloat.Float16Array([
        // Front face
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // Back face
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // Top face
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // Bottom face
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // Right face
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // Left face
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0
    ]);
    const vertexNorBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: normals, usage: "STATIC_DRAW" };

    const texCoords = HalfFloat.Float16Array([
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
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,

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
    const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

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

    const vertexArray: { vertices?: IGLVertexAttributes } = {
        vertices: {
            a_position: { type: "FLOAT", buffer: vertexPosBuffer, numComponents: 3 },
            a_normal: { type: "HALF_FLOAT", buffer: vertexNorBuffer, numComponents: 3 },
            a_texCoord: { type: "HALF_FLOAT", buffer: vertexTexBuffer, numComponents: 2 },
        },
    };

    // -- Init Texture

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: IGLTexture;
    let sampler: IGLSampler;
    loadImage(imageUrl, function (image)
    {
        // -- Init 2D Texture
        texture = {
            target: "TEXTURE_2D",
            internalformat: "RGB8",
            format: "RGB",
            type: "UNSIGNED_BYTE",
            pixelStore: { unpackFlipY: false },
            storage: { levels: 1, width: 512, height: 512 },
            writeTextures: [{ level: 0, xoffset: 0, yoffset: 0, source: image }],
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

    const viewMatrix = mat4.create();
    const translate = vec3.create();
    vec3.set(translate, 0, 0, -10);
    mat4.translate(viewMatrix, modelMatrix, translate);
    const perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 0.785, 1, 1, 1000);
    const viewProj = mat4.create();

    const modelInvTrans = mat4.create();
    mat4.transpose(modelInvTrans, modelMatrix);
    mat4.invert(modelInvTrans, modelInvTrans);

    const lightPosition = [0.0, 0.0, 5.0];

    const ro: IGLRenderObject = {
        pipeline: program,
        vertices: vertexArray.vertices,
        indices: new Uint16Array(cubeVertexIndices),
        uniforms: {
            u_model: modelMatrix,
            u_modelInvTrans: modelInvTrans,
            u_lightPosition: lightPosition,
            u_ambient: 0.1,
        },
        drawIndexed: { indexCount: 36 },
    };

    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro],
    };

    function render()
    {
        // -- Render
        orientation[0] = 0.0050; // yaw
        orientation[1] = 0.0030; // pitch
        orientation[2] = 0.0009; // roll

        mat4.rotateX(viewMatrix, viewMatrix, orientation[0] * Math.PI);
        mat4.rotateY(viewMatrix, viewMatrix, orientation[1] * Math.PI);
        mat4.rotateZ(viewMatrix, viewMatrix, orientation[2] * Math.PI);
        mat4.multiply(viewProj, perspectiveMatrix, viewMatrix);

        //
        ro.uniforms.u_viewProj = viewProj;
        ro.uniforms.s_tex2D = { texture, sampler };

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        requestAnimationFrame(render);

        // If you have a long-running page, and need to delete WebGL resources, use:
        //
        // gl.deleteBuffer(vertexPosBuffer);
        // gl.deleteBuffer(vertexTexBuffer);
        // gl.deleteBuffer(indexBuffer);
        // gl.deleteTexture(texture);
        // gl.deleteProgram(program);
        // gl.deleteVertexArray(vertexArray);
    }
})();
