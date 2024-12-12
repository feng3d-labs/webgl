import { IRenderObject, IRenderPass, IRenderPipeline } from "@feng3d/render-api";
import { IGLCanvasContext, IGLUniformBuffer, IGLVertexAttributes, WebGL } from "@feng3d/webgl";
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
    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init Program
    const program: IRenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init Buffer
    const elementData = new Uint16Array([
        0, 1, 2,
        2, 3, 0
    ]);

    //vec3 position, vec3 normal, vec4 color
    const vertices = new Float32Array([
        -1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0
    ]);

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
    const vertexArray: { vertices?: IGLVertexAttributes } = {
        vertices: {
            position: { data: vertices, numComponents: 3, vertexSize: 40, offset: 0 },
            normal: { data: vertices, numComponents: 3, vertexSize: 40, offset: 12 },
            color: { data: vertices, numComponents: 4, vertexSize: 40, offset: 24 },
        },
    };

    const ro: IRenderObject = {
        pipeline: program,
        vertices: vertexArray.vertices,
        indices: elementData,
        uniforms: {
            PerDraw: uniformPerDrawBuffer,
            PerPass: uniformPerPassBuffer,
            PerScene: uniformPerSceneBuffer,
        },
        drawIndexed: { indexCount: 6, firstIndex: 0 }
    };

    const rp: IRenderPass = {
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

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        requestAnimationFrame(render);
    }

    render();
})();
