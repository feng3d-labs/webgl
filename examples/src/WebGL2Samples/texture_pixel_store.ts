import { IGLProgram, IGLRenderPass, IGLRenderingContext, IGLSampler, IGLTexture, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: IGLProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IGLVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // -- Init VertexArray
    const vertexArray: IGLVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // use canvas to get the pixel data array of the image
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = new Uint8Array(imageData.data.buffer);

        // -- Init Texture
        const texture: IGLTexture = {
            target: "TEXTURE_2D",
            pixelStore: {
                unpackAlignment: 1,
                unpackRowLength: image.width,
                unpackSkipPixels: image.width / 4,
                unpackSkipRows: image.width / 4,
                unpackFlipY: false,
            },
            internalformat: "RGBA",
            format: "RGBA",
            sources: [{ level: 0, width: image.width / 2, height: image.height / 2, pixels }]
        };
        const sampler: IGLSampler = {
            minFilter: "NEAREST",
            magFilter: "NEAREST",
        };

        // -- Render
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
            vertexArray,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            drawArrays: { vertexCount: 6 },
        });

        webgl.runRenderPass(rp);

        // Delete WebGL resources
        webgl.deleteBuffer(vertexPosBuffer);
        webgl.deleteBuffer(vertexTexBuffer);
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
        webgl.deleteVertexArray(vertexArray);
    });
})();
