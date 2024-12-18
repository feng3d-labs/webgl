import { IIndicesDataTypes, IRenderObject, IRenderPass, IRenderPipeline, IVertexAttributes, IVertexDataTypes } from "@feng3d/render-api";
import { IGLCanvasContext, IGLTransformFeedback, WebGL } from "@feng3d/webgl";

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
    const particleVAOs: { vertices?: IVertexAttributes, indices?: IIndicesDataTypes }[] = [];

    // Transform feedback objects track output buffer state
    const particleTransformFeedbacks: IGLTransformFeedback[] = [];

    const particleVBOs: IVertexDataTypes[][] = new Array(particleVAOs.length);

    for (let i = 0; i < 2; ++i)
    {
        particleVBOs[i] = new Array(NUM_LOCATIONS);

        // Set up input
        particleVBOs[i][POSITION_LOCATION] = particlePositions.slice();

        particleVBOs[i][VELOCITY_LOCATION] = particleVelocities.slice();

        particleVBOs[i][SPAWNTIME_LOCATION] = particleSpawntime.slice();

        particleVBOs[i][LIFETIME_LOCATION] = particleLifetime.slice();

        particleVBOs[i][ID_LOCATION] = particleIDs.slice();

        particleVAOs[i] = {
            vertices: {
                a_position: { data: particleVBOs[i][POSITION_LOCATION], format: "float32x2" },
                a_velocity: { data: particleVBOs[i][VELOCITY_LOCATION], format: "float32x2" },
                a_spawntime: { data: particleVBOs[i][SPAWNTIME_LOCATION], format: "float32" },
                a_lifetime: { data: particleVBOs[i][LIFETIME_LOCATION], format: "float32" },
                a_ID: { data: particleVBOs[i][ID_LOCATION], format: "float32" },
            }
        };

        // Set up output
        particleTransformFeedbacks[i] = {
            bindBuffers: [
                { index: 0, data: particleVBOs[i][POSITION_LOCATION] },
                { index: 1, data: particleVBOs[i][VELOCITY_LOCATION] },
                { index: 2, data: particleVBOs[i][SPAWNTIME_LOCATION] },
                { index: 3, data: particleVBOs[i][LIFETIME_LOCATION] },
            ]
        };
    }

    function initProgram()
    {
        const program: IRenderPipeline = {
            vertex: { code: getShaderSource("vs-draw") },
            fragment: {
                code: getShaderSource("fs-draw"),
                targets: [{
                    blend: {
                        color: { srcFactor: "src-alpha", dstFactor: "one" },
                        alpha: { srcFactor: "src-alpha", dstFactor: "one" },
                    }
                }]
            },
            transformFeedbackVaryings: { varyings: ["v_position", "v_velocity", "v_spawntime", "v_lifetime"], bufferMode: "SEPARATE_ATTRIBS" },
            primitive: { topology: "point-list" },
        };

        return program;
    }

    const ro: IRenderObject = {
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height - 10 },
        pipeline: program,
        uniforms: {
            u_color: [0.0, 1.0, 1.0, 1.0],
            u_acceleration: [0.0, ACCELERATION],
        },
        drawVertex: { vertexCount: NUM_PARTICLES },
    };

    const rp: IRenderPass = {
        descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
        renderObjects: [ro],
    };

    function render()
    {
        const time = Date.now() - appStartTime;
        const destinationIdx = (currentSourceIdx + 1) % 2;

        // Toggle source and destination VBO
        const sourceVAO = particleVAOs[currentSourceIdx];
        const destinationTransformFeedback = particleTransformFeedbacks[destinationIdx];

        ro.vertices = sourceVAO.vertices;
        ro.indices = sourceVAO.indices;
        ro.transformFeedback = destinationTransformFeedback;

        ro.uniforms.u_time = time;

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Ping pong the buffers
        currentSourceIdx = (currentSourceIdx + 1) % 2;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();
