import { IElementBufferSourceTypes, IGLCanvasContext, IGLProgram, IGLRenderPass, IGLTransformFeedback, IGLVertexAttributes, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
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
    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    // -- Init Program
    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_FEEDBACK = 1;

    const programTransform = (function (vertexShaderSourceTransform, fragmentShaderSourceTransform)
    {
        const programTransform: IGLProgram = {
            vertex: { code: vertexShaderSourceTransform },
            fragment: { code: fragmentShaderSourceTransform },
            transformFeedbackVaryings: { varyings: ["gl_Position", "v_color"], bufferMode: "INTERLEAVED_ATTRIBS" },
            rasterizerDiscard: true,
        };

        return programTransform;
    })(getShaderSource("vs-transform"), getShaderSource("fs-transform"));

    const programFeedback: IGLProgram = {
        vertex: { code: getShaderSource("vs-feedback") }, fragment: { code: getShaderSource("fs-feedback") },
    };

    const programs = [programTransform, programFeedback];

    // -- Init Buffer
    const SIZE_V4C4 = 32;
    const VERTEX_COUNT = 6;
    const vertices = new Float32Array([
        -1.0, -1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 1.0
    ]);

    const buffers: IGLVertexBuffer[] = [
        // Transform buffer
        { target: "ARRAY_BUFFER", data: vertices, usage: "STATIC_DRAW" },
        // Feedback empty buffer
        { target: "ARRAY_BUFFER", size: SIZE_V4C4 * VERTEX_COUNT, usage: "STATIC_COPY" },
    ];

    // -- Init Vertex Array
    const vertexArrays: { vertices?: IGLVertexAttributes, indices?: IElementBufferSourceTypes }[] = [
        {
            vertices: {
                position: { buffer: buffers[PROGRAM_TRANSFORM], numComponents: 4 },
            }
        },
        {
            vertices: {
                position: { buffer: buffers[PROGRAM_FEEDBACK], numComponents: 4, vertexSize: SIZE_V4C4, offset: 0 },
                color: { buffer: buffers[PROGRAM_FEEDBACK], numComponents: 4, vertexSize: SIZE_V4C4, offset: SIZE_V4C4 / 2 },
            }
        },
    ];

    // -- Init TransformFeedback
    const transformFeedback: IGLTransformFeedback = {
        bindBuffers: [
            { index: 0, buffer: buffers[PROGRAM_FEEDBACK] }
        ]
    };

    // -- Render
    const rp: IGLRenderPass = {
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
        vertices: vertexArrays[PROGRAM_TRANSFORM].vertices,
        indices: vertexArrays[PROGRAM_TRANSFORM].indices,
        uniforms: { MVP: matrix },
        transformFeedback,
        drawVertex: { vertexCount: VERTEX_COUNT },
    });

    // Second draw, reuse captured attributes
    rp.renderObjects.push({
        pipeline: programs[PROGRAM_FEEDBACK],
        vertices: vertexArrays[PROGRAM_FEEDBACK].vertices,
        indices: vertexArrays[PROGRAM_FEEDBACK].indices,
        drawVertex: { vertexCount: VERTEX_COUNT },
    });

    webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

    // -- Delete WebGL resources
    webgl.deleteTransformFeedback(transformFeedback);
    webgl.deleteBuffer(buffers[PROGRAM_TRANSFORM]);
    webgl.deleteBuffer(buffers[PROGRAM_FEEDBACK]);
    webgl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    webgl.deleteProgram(programs[PROGRAM_FEEDBACK]);
})();
