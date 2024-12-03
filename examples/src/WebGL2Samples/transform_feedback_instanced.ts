import { IGLProgram, IGLRenderObject, IGLRenderPass, IGLRenderingContext, IGLTransformFeedback, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
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
    const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    canvas.addEventListener("webglcontextlost", function (event)
    {
        event.preventDefault();
    }, false);

    // -- Init Program

    const PROGRAM_TRANSFORM = 0;
    const PROGRAM_DRAW = 1;

    const programs = initPrograms();

    // -- Initialize data
    const NUM_INSTANCES = 1000;

    let currentSourceIdx = 0;

    const trianglePositions = new Float32Array([
        0.015, 0.0,
        -0.010, 0.010,
        -0.010, -0.010,
    ]);

    const instanceOffsets = new Float32Array(NUM_INSTANCES * 2);
    const instanceRotations = new Float32Array(Number(NUM_INSTANCES));
    const instanceColors = new Float32Array(NUM_INSTANCES * 3);

    for (let i = 0; i < NUM_INSTANCES; ++i)
    {
        const oi = i * 2;
        const ri = i;
        const ci = i * 3;

        instanceOffsets[oi] = Math.random() * 2.0 - 1.0;
        instanceOffsets[oi + 1] = Math.random() * 2.0 - 1.0;

        instanceRotations[i] = Math.random() * 2 * Math.PI;

        instanceColors[ci] = Math.random();
        instanceColors[ci + 1] = Math.random();
        instanceColors[ci + 2] = Math.random();
    }

    // -- Init Vertex Array
    const OFFSET_LOCATION = 0;
    const ROTATION_LOCATION = 1;
    const POSITION_LOCATION = 2; // this is vertex position of the instanced geometry
    const COLOR_LOCATION = 3;
    const NUM_LOCATIONS = 4;

    const vertexArrays: IGLVertexArrayObject[][] = [];

    // Transform feedback objects track output buffer state
    const transformFeedbacks: IGLTransformFeedback[] = [];

    const vertexBuffers: IGLVertexBuffer[][] = new Array(vertexArrays.length);

    for (let va = 0; va < 2; ++va)
    {
        vertexBuffers[va] = new Array(NUM_LOCATIONS);

        vertexBuffers[va][OFFSET_LOCATION] = { target: "ARRAY_BUFFER", data: instanceOffsets, usage: "STREAM_COPY" };
        vertexBuffers[va][ROTATION_LOCATION] = { target: "ARRAY_BUFFER", data: instanceRotations, usage: "STREAM_COPY" };
        vertexBuffers[va][POSITION_LOCATION] = { target: "ARRAY_BUFFER", data: trianglePositions, usage: "STATIC_DRAW" };
        vertexBuffers[va][COLOR_LOCATION] = { target: "ARRAY_BUFFER", data: instanceColors, usage: "STATIC_DRAW" };

        vertexArrays[va] = [];
        vertexArrays[va][0] = {
            vertices: {
                a_offset: { buffer: vertexBuffers[va][OFFSET_LOCATION], numComponents: 2 },
                a_rotation: { buffer: vertexBuffers[va][ROTATION_LOCATION], numComponents: 1 },
            }
        };
        vertexArrays[va][1] = {
            vertices: {
                a_offset: { buffer: vertexBuffers[va][OFFSET_LOCATION], numComponents: 2, divisor: 1 },
                a_rotation: { buffer: vertexBuffers[va][ROTATION_LOCATION], numComponents: 1, divisor: 1 },
                a_position: { buffer: vertexBuffers[va][POSITION_LOCATION], numComponents: 2 },
                a_color: { buffer: vertexBuffers[va][COLOR_LOCATION], numComponents: 3, divisor: 1 },
            }
        };

        transformFeedbacks[va] = {
            bindBuffers: [
                { index: 0, buffer: vertexBuffers[va][OFFSET_LOCATION] },
                { index: 1, buffer: vertexBuffers[va][ROTATION_LOCATION] },
            ]
        };
    }

    const transformRO: IGLRenderObject = {
        pipeline: programs[PROGRAM_TRANSFORM],
        vertexArray: null,
        transformFeedback: null,
        uniforms: {},
        drawArrays: { vertexCount: NUM_INSTANCES },
    };

    const renderRO: IGLRenderObject = {
        pipeline: programs[PROGRAM_DRAW],
        uniforms: {},
        drawArrays: { vertexCount: 3, instanceCount: NUM_INSTANCES },
    };

    const rp: IGLRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [transformRO, renderRO],
    };

    render();

    function initPrograms()
    {
        const programTransform: IGLProgram = {
            vertex: { code: getShaderSource("vs-emit") }, fragment: { code: getShaderSource("fs-emit") },
            transformFeedbackVaryings: { varyings: ["v_offset", "v_rotation"], bufferMode: "SEPARATE_ATTRIBS" },
            rasterizerDiscard: true,
            primitive: { topology: "POINTS" },
        };

        // Setup program for draw shader
        const programDraw: IGLProgram = {
            vertex: { code: getShaderSource("vs-draw") }, fragment: {
                code: getShaderSource("fs-draw"),
                targets: [{
                    blend: {
                        color: { srcFactor: "SRC_ALPHA", dstFactor: "ONE" },
                        alpha: { srcFactor: "SRC_ALPHA", dstFactor: "ONE" },
                    }
                }]
            },
            primitive: { topology: "TRIANGLES" },
        };

        const programs = [programTransform, programDraw];

        return programs;
    }

    function transform()
    {
        const time = Date.now();
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        const sourceVAO = vertexArrays[currentSourceIdx][0];

        const destinationTransformFeedback = transformFeedbacks[destinationIdx];

        transformRO.vertexArray = sourceVAO;
        transformRO.transformFeedback = destinationTransformFeedback;

        transformRO.uniforms.u_time = time;

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;
    }

    function render()
    {
        // Rotate triangles
        transform();

        renderRO.viewport = { x: 0, y: 0, width: canvas.width, height: canvas.height - 10 };
        renderRO.vertexArray = vertexArrays[currentSourceIdx][1];

        webgl.runRenderPass(rp);

        requestAnimationFrame(render);
    }

    // If you have a long-running page, and need to delete WebGL resources, use:
    //
    // gl.deleteProgram(programs[PROGRAM_TRANSFORM]);
    // gl.deleteProgram(programs[PROGRAM_DRAW]);
    // for (var i = 0; i < 2; ++i) {
    //     for (var j = 0; j < Particle.MAX; ++j) {
    //         gl.deleteBuffer(vertexBuffers[i][j]);
    //     }
    // }
    // gl.deleteVertexArray(vertexArrays[PROGRAM_TRANSFORM]);
    // gl.deleteVertexArray(vertexArrays[PROGRAM_DRAW]);
    // gl.deleteTransformFeedback(transformFeedbacks[0]);
    // gl.deleteTransformFeedback(transformFeedbacks[1]);
})();
