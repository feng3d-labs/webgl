import { IGLIndexBuffer, IGLProgram, IGLRenderObject, IGLRenderPass, IGLRenderingContext, IGLUniformBuffer, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource } from "./utility";

(function ()
{
    // --Init Canvas
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    // --Init WebGL Context
    const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init Program
    const program: IGLProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init Buffer
    const elementData = new Uint16Array([
        0, 1, 2,
        2, 3, 0
    ]);
    const elementBuffer: IGLIndexBuffer = { target: "ELEMENT_ARRAY_BUFFER", data: elementData, usage: "STATIC_DRAW" };

    //vec3 position, vec3 normal, vec4 color
    const vertices = new Float32Array([
        -1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ]);
    const vertexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" };

    //mat4 P, mat4 MV, mat3 Mnormal
    const transforms = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,

        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.0, 0.0, 0.0, 1.0,

        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const uniformPerDrawBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", data: transforms, usage: "DYNAMIC_DRAW" };

    const lightPos = new Float32Array([
        0.0, 0.0, 0.0, 0.0,
    ]);
    const uniformPerPassBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", data: lightPos, usage: "DYNAMIC_DRAW" };

    //vec3 ambient, diffuse, specular, float shininess
    const material = new Float32Array([
        0.1, 0.0, 0.0, 0.0,
        0.5, 0.0, 0.0, 0.0,
        1.0, 1.0, 1.0, 4.0,
    ]);
    const uniformPerSceneBuffer: IGLUniformBuffer = { target: "UNIFORM_BUFFER", data: material, usage: "STATIC_DRAW" };

    // -- Init Vertex Array
    const vertexArray: IGLVertexArrayObject = {
        vertices: {
            position: { buffer: vertexBuffer, numComponents: 3, vertexSize: 40, offset: 0 },
            normal: { buffer: vertexBuffer, numComponents: 3, vertexSize: 40, offset: 12 },
            color: { buffer: vertexBuffer, numComponents: 4, vertexSize: 40, offset: 24 },
        },
        index: elementBuffer,
    };

    const ro: IGLRenderObject = {
        pipeline: program,
        vertexArray,
        uniforms: {
            PerDraw: uniformPerDrawBuffer,
            PerPass: uniformPerPassBuffer,
            PerScene: uniformPerSceneBuffer,
        },
        drawElements: { indexCount: 6, firstIndex: 0 }
    };

    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro],
    };

    let uTime = 0;
    function render()
    {
        uTime += 0.01;

        // -- update uniform buffer
        transforms[16] = 0.1 * Math.cos(uTime) + 0.4;
        uniformPerDrawBuffer.writeBuffers = [{ bufferOffset: 0, data: transforms }];

        lightPos[0] = Math.cos(3 * uTime);
        lightPos[1] = Math.sin(6 * uTime);
        uniformPerPassBuffer.writeBuffers = [{ bufferOffset: 0, data: lightPos }];

        webgl.runRenderPass(rp);

        requestAnimationFrame(render);
    }

    render();
})();
