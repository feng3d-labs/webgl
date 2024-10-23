import { IProgram, IRenderPass, IRenderingContext, ITransformFeedback, IVertexArrayObject, IVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
import { getShaderSource } from "./utility";

(function ()
{
    // -- Init Canvas
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    // -- Init WebGL Context
    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    // -- Init Program
    const programTransform = (function (vertexShaderSourceTransform, fragmentShaderSourceTransform)
    {
        const programTransform: IProgram = {
            vertex: { code: vertexShaderSourceTransform },
            fragment: { code: fragmentShaderSourceTransform },
            transformFeedbackVaryings: { varyings: ["gl_Position", "v_color"], bufferMode: "SEPARATE_ATTRIBS" },
            rasterizerDiscard: true,
        };

        return programTransform;
    })(getShaderSource("vs-transform"), getShaderSource("fs-transform"));

    const programFeedback: IProgram = {
        vertex: { code: getShaderSource("vs-feedback") }, fragment: { code: getShaderSource("fs-feedback") },
    };

    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_FEEDBACK = 1;
    const programs = [programTransform, programFeedback];

    // -- Init Buffer

    const VERTEX_COUNT = 6;
    const positions = new Float32Array([
        -1.0, -1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 1.0
    ]);

    const BufferType = {
        VERTEX: 0,
        POSITION: 1,
        COLOR: 2,
        MAX: 3
    };

    const buffers: IVertexBuffer[] = [
        // Transform buffer
        { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" },
        // Feedback empty buffers
        // { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" },
        // { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" },
        { target: "ARRAY_BUFFER", size: positions.length * Float32Array.BYTES_PER_ELEMENT, usage: "STATIC_COPY" },
        { target: "ARRAY_BUFFER", size: positions.length * Float32Array.BYTES_PER_ELEMENT, usage: "STATIC_COPY" },
    ];

    // -- Init Transform Vertex Array
    const vertexArrays: IVertexArrayObject[] = [
        {
            vertices: {
                position: { buffer: buffers[BufferType.VERTEX], numComponents: 4 },
            }
        },
        {
            vertices: {
                position: { buffer: buffers[BufferType.POSITION], numComponents: 4 },
                color: { buffer: buffers[BufferType.COLOR], numComponents: 4 },
            }
        },
    ];

    // -- Init TransformFeedback
    const transformFeedback: ITransformFeedback = {
        bindBuffers: [
            { index: 0, buffer: buffers[BufferType.POSITION] },
            { index: 1, buffer: buffers[BufferType.COLOR] },
        ]
    };

    // -- Render
    const rp: IRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [],
    };

    // First draw, capture the attributes
    // Disable rasterization, vertices processing only

    const matrix = new Float32Array([
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    rp.renderObjects.push({
        pipeline: programs[PROGRAM_TRANSFORM],
        vertexArray: vertexArrays[PROGRAM_TRANSFORM],
        uniforms: { MVP: matrix },
        transformFeedback,
        drawArrays: { vertexCount: VERTEX_COUNT },
    });

    // Second draw, reuse captured attributes
    rp.renderObjects.push({
        pipeline: programs[PROGRAM_FEEDBACK],
        vertexArray: vertexArrays[PROGRAM_FEEDBACK],
        drawArrays: { vertexCount: VERTEX_COUNT },
    });

    webgl.runRenderPass(rp);

    // -- Delete WebGL resources
    // gl.deleteTransformFeedback(transformFeedback);
    // gl.deleteBuffer(buffers[BufferType.VERTEX]);
    // gl.deleteBuffer(buffers[BufferType.POSITION]);
    // gl.deleteBuffer(buffers[BufferType.COLOR]);
    // gl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    // gl.deleteProgram(programs[PROGRAM_FEEDBACK]);
    // gl.deleteVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    // gl.deleteVertexArray(vertexArrays[PROGRAM_FEEDBACK]);
})();
