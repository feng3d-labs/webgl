import { reactive } from "@feng3d/reactivity";
import { CanvasContext, RenderObject, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
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

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2", webGLContextAttributes: { antialias: false } };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
        depthStencil: {},
        primitive: { topology: "triangle-list", cullFace: "back" },
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

    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            a_position: { data: positions, format: "float32x3" },
            a_normal: { data: normals, format: "float16x4", arrayStride: 6 }, // 由于不支持类型 "float16x3"，则需要设置 arrayStride 为6，表示每次间隔3个半浮点数。
            a_texCoord: { data: texCoords, format: "float16x2" },
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
            descriptor: {
                format: "rgba8unorm",
                mipLevelCount: 1,
                size: [512, 512],
            },
            sources: [{ image, flipY: false }],
        };
        sampler = {
            minFilter: "nearest",
            magFilter: "nearest",
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
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

    const ro: RenderObject = {
        pipeline: program,
        bindingResources: {
            u_model: modelMatrix as Float32Array,
            u_modelInvTrans: modelInvTrans as Float32Array,
            u_lightPosition: lightPosition,
            u_ambient: 0.1,
        },
        vertices: vertexArray.vertices,
        indices: new Uint16Array(cubeVertexIndices),
        draw: { __type__: "DrawIndexed", indexCount: 36 },
    };

    const rp: RenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderPassObjects: [ro],
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
        reactive(ro.bindingResources).u_viewProj = viewProj as Float32Array;
        reactive(ro.bindingResources).s_tex2D = { texture, sampler };

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
