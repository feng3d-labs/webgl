import { IProgram, IRenderObject, IRenderPass, IRenderingContext, ITransformFeedback, IVertexArrayObject, IVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
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

    canvas.addEventListener("webglcontextlost", function (event)
    {
        event.preventDefault();
    }, false);

    // -- Declare variables for the particle system

    const NUM_PARTICLES = 1000;
    const ACCELERATION = -1.0;

    const appStartTime = Date.now();
    let currentSourceIdx = 0;

    const program = initProgram();

    // -- Initialize particle data

    const particlePositions = new Float32Array(NUM_PARTICLES * 2);
    const particleVelocities = new Float32Array(NUM_PARTICLES * 2);
    const particleSpawntime = new Float32Array(NUM_PARTICLES);
    const particleLifetime = new Float32Array(NUM_PARTICLES);
    const particleIDs = new Float32Array(NUM_PARTICLES);

    const POSITION_LOCATION = 0;
    const VELOCITY_LOCATION = 1;
    const SPAWNTIME_LOCATION = 2;
    const LIFETIME_LOCATION = 3;
    const ID_LOCATION = 4;
    const NUM_LOCATIONS = 5;

    for (let p = 0; p < NUM_PARTICLES; ++p)
    {
        particlePositions[p * 2] = 0.0;
        particlePositions[p * 2 + 1] = 0.0;
        particleVelocities[p * 2] = 0.0;
        particleVelocities[p * 2 + 1] = 0.0;
        particleSpawntime[p] = 0.0;
        particleLifetime[p] = 0.0;
        particleIDs[p] = p;
    }

    // -- Init Vertex Arrays and Buffers
    const particleVAOs: IVertexArrayObject[] = [];

    // Transform feedback objects track output buffer state
    const particleTransformFeedbacks: ITransformFeedback[] = [];

    const particleVBOs: IVertexBuffer[][] = new Array(particleVAOs.length);

    for (let i = 0; i < 2; ++i)
    {
        particleVBOs[i] = new Array(NUM_LOCATIONS);

        // Set up input
        particleVBOs[i][POSITION_LOCATION] = { target: "ARRAY_BUFFER", data: particlePositions, usage: "STREAM_COPY" };

        particleVBOs[i][VELOCITY_LOCATION] = { target: "ARRAY_BUFFER", data: particleVelocities, usage: "STREAM_COPY" };

        particleVBOs[i][SPAWNTIME_LOCATION] = { target: "ARRAY_BUFFER", data: particleSpawntime, usage: "STREAM_COPY" };

        particleVBOs[i][LIFETIME_LOCATION] = { target: "ARRAY_BUFFER", data: particleLifetime, usage: "STREAM_COPY" };

        particleVBOs[i][ID_LOCATION] = { target: "ARRAY_BUFFER", data: particleIDs, usage: "STREAM_COPY" };

        particleVAOs[i] = {
            vertices: {
                a_position: { buffer: particleVBOs[i][POSITION_LOCATION], numComponents: 2 },
                a_velocity: { buffer: particleVBOs[i][VELOCITY_LOCATION], numComponents: 2 },
                a_spawntime: { buffer: particleVBOs[i][SPAWNTIME_LOCATION], numComponents: 1 },
                a_lifetime: { buffer: particleVBOs[i][LIFETIME_LOCATION], numComponents: 1 },
                a_ID: { buffer: particleVBOs[i][ID_LOCATION], numComponents: 1 },
            }
        };

        // Set up output
        particleTransformFeedbacks[i] = {
            bindBuffers: [
                { index: 0, buffer: particleVBOs[i][POSITION_LOCATION] },
                { index: 1, buffer: particleVBOs[i][VELOCITY_LOCATION] },
                { index: 2, buffer: particleVBOs[i][SPAWNTIME_LOCATION] },
                { index: 3, buffer: particleVBOs[i][LIFETIME_LOCATION] },
            ]
        };
    }

    function initProgram()
    {
        const program: IProgram = {
            vertex: { code: getShaderSource("vs-draw") },
            fragment: {
                code: getShaderSource("fs-draw"),
                targets: [{
                    blend: {
                        color: { srcFactor: "SRC_ALPHA", dstFactor: "ONE" },
                        alpha: { srcFactor: "SRC_ALPHA", dstFactor: "ONE" },
                    }
                }]
            },
            transformFeedbackVaryings: { varyings: ["v_position", "v_velocity", "v_spawntime", "v_lifetime"], bufferMode: "SEPARATE_ATTRIBS" },
            primitive: { topology: "POINTS" },
        };

        return program;
    }

    const ro: IRenderObject = {
        pipeline: program,
        uniforms: {
            u_color: [0.0, 1.0, 1.0, 1.0],
            u_acceleration: [0.0, ACCELERATION],
        },
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height - 10 },
        drawArrays: { vertexCount: NUM_PARTICLES },
    };

    const rp: IRenderPass = {
        passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro],
    };

    function render()
    {
        const time = Date.now() - appStartTime;
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        const sourceVAO = particleVAOs[currentSourceIdx];
        const destinationTransformFeedback = particleTransformFeedbacks[destinationIdx];

        ro.vertexArray = sourceVAO;
        ro.transformFeedback = destinationTransformFeedback;

        ro.uniforms.u_time = time;

        webgl.runRenderPass(rp);

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();
