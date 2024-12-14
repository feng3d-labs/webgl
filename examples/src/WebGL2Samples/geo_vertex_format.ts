import { IRenderObject, IRenderPass, IRenderPipeline, ITexture } from "@feng3d/render-api";
import { IGLCanvasContext, IGLSampler, IVertexAttributes, WebGL } from "@feng3d/webgl";
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
    const program: IRenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        primitive: { topology: "triangle-list", cullFace: "back" },
        depthStencil: { },
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

    const vertexArray: { vertices?: IVertexAttributes } = {
        vertices: {
            a_position: { type: "FLOAT", data: positions, numComponents: 3 },
            a_normal: { type: "HALF_FLOAT", data: normals, numComponents: 3 },
            a_texCoord: { type: "HALF_FLOAT", data: texCoords, numComponents: 2 },
        },
    };

    // -- Init Texture

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: ITexture;
    let sampler: IGLSampler;
    loadImage(imageUrl, function (image)
    {
        // -- Init 2D Texture
        texture = {
            format: "rgba8unorm",
            mipLevelCount: 1,
            size: [512, 512],
            sources: [{ image: image, flipY: false }],
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

    const ro: IRenderObject = {
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

    const rp: IRenderPass = {
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
