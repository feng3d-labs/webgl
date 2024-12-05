import { IGLCanvasContext, IGLProgram, IGLRenderPass, IGLSampler, IGLTexture, IGLVertexAttributes, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
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

    // -- Initialize program

    const program: IGLProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Initialize buffer

    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texcoords, usage: "STATIC_DRAW" };

    // -- Initialize vertex array

    const vertices: IGLVertexAttributes = {
        position: { buffer: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
    }

    // -- Load texture then render

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: IGLTexture;
    let sampler: IGLSampler;
    loadImage(imageUrl, function (image)
    {
        texture = {
            target: "TEXTURE_2D",
            internalformat: "SRGB8",
            format: "RGB",
            type: "UNSIGNED_BYTE",
            sources: [{ level: 0, source: image }],
        };
        sampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

        render();
    });

    function render()
    {
        // Clear color buffer
        const rp: IGLRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: [],
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        rp.renderObjects.push({
            pipeline: program,
            vertices,
            uniforms: {
                mvp: matrix,
                material: { diffuse: { texture, sampler } },
            },
            drawVertex: { vertexCount: 6 },
        });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Cleanup
        webgl.deleteBuffer(vertexPosBuffer);
        webgl.deleteBuffer(vertexTexBuffer);
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    }
})();
