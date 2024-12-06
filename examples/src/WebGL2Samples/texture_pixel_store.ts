import { getIGLBuffer, IGLCanvasContext, IGLIndicesDataTypes, IGLProgram, IGLRenderPass, IGLRenderPassObject, IGLSampler, IGLTexture, IGLVertexAttributes, IGLVertexDataTypes, WebGL } from "@feng3d/webgl";
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
    const vertexPosBuffer: IGLVertexDataTypes = positions;

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IGLVertexDataTypes = texCoords;

    // -- Init VertexArray
    const vertexArray: { vertices?: IGLVertexAttributes, indices?: IGLIndicesDataTypes } = {
        vertices: {
            position: { data: vertexPosBuffer, numComponents: 2 },
            texcoord: { data: vertexTexBuffer, numComponents: 2 },
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

        const renderObjects: IGLRenderPassObject[] = [];
        // -- Render
        const rp: IGLRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: renderObjects,
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        renderObjects.push({
            pipeline: program,
            vertices: vertexArray.vertices,
            indices: vertexArray.indices,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            drawVertex: { vertexCount: 6 },
        });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteBuffer(getIGLBuffer(vertexPosBuffer));
        webgl.deleteBuffer(getIGLBuffer(vertexTexBuffer));
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    });
})();
