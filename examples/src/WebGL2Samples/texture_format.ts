import { IGLProgram, IGLRenderPass, IGLRenderingContext, IGLSampler, IGLTexture, IGLTextureDataType, IGLTextureFormat, IGLTextureInternalFormat, IGLVertexArrayObject, IGLVertexBuffer, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IGLRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Viewport

    const windowSize = {
        x: canvas.width,
        y: canvas.height
    };

    const Views = {
        BOTTOM_LEFT: 0,
        BOTTOM_CENTER: 1,
        BOTTOM_RIGHT: 2,
        MIDDLE_LEFT: 3,
        MIDDLE_CENTER: 4,
        MIDDLE_RIGHT: 5,
        TOP_LEFT: 6,
        TOP_CENTER: 7,
        TOP_RIGHT: 8,
        MAX: 9
    };

    const viewport = new Array(Views.MAX);

    for (let i = 0; i < Views.MAX; ++i)
    {
        const row = Math.floor(i / 3);
        const col = i % 3;
        viewport[i] = {
            x: windowSize.x * col / 3.0,
            y: windowSize.y * row / 3.0,
            z: windowSize.x / 3.0,
            w: windowSize.y / 3.0
        };
    }

    // -- Init program
    const programUint: IGLProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-uint") } };

    const programNormalized: IGLProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-normalized") } };

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
        const TextureTypes = {
            RGB: 0,
            RGB8: 1,
            RGBA: 2,
            RGB16F: 3,
            RGBA32F: 4,
            R16F: 5,
            RG16F: 6,
            RGB8UI: 7,
            RGBA8UI: 8,
            MAX: 9
        };

        const textureFormats: { internalFormat: IGLTextureInternalFormat, format: IGLTextureFormat, type: IGLTextureDataType }[] = new Array(TextureTypes.MAX);

        textureFormats[TextureTypes.RGB] = {
            internalFormat: "RGB",
            format: "RGB",
            type: "UNSIGNED_BYTE"
        };

        textureFormats[TextureTypes.RGB8] = {
            internalFormat: "RGB8",
            format: "RGB",
            type: "UNSIGNED_BYTE"
        };

        textureFormats[TextureTypes.RGB16F] = {
            internalFormat: "RGB16F",
            format: "RGB",
            type: "HALF_FLOAT"
        };

        textureFormats[TextureTypes.RGBA32F] = {
            internalFormat: "RGBA32F",
            format: "RGBA",
            type: "FLOAT"
        };

        textureFormats[TextureTypes.R16F] = {
            internalFormat: "R16F",
            format: "RED",
            type: "HALF_FLOAT"
        };

        textureFormats[TextureTypes.RG16F] = {
            internalFormat: "RG16F",
            format: "RG",
            type: "HALF_FLOAT"
        };

        textureFormats[TextureTypes.RGBA] = {
            internalFormat: "RGBA",
            format: "RGBA",
            type: "UNSIGNED_BYTE"
        };

        textureFormats[TextureTypes.RGB8UI] = {
            internalFormat: "RGB8UI",
            format: "RGB_INTEGER",
            type: "UNSIGNED_BYTE"
        };

        textureFormats[TextureTypes.RGBA8UI] = {
            internalFormat: "RGBA8UI",
            format: "RGBA_INTEGER",
            type: "UNSIGNED_BYTE"
        };

        // -- Init Texture

        const textures: IGLTexture[] = new Array(TextureTypes.MAX);
        const samplers: IGLSampler[] = new Array(TextureTypes.MAX);
        let i = 0;
        for (i = 0; i < TextureTypes.MAX; ++i)
        {
            textures[i] = {
                target: "TEXTURE_2D",
                pixelStore: {
                    unpackFlipY: false,
                },
                internalformat: textureFormats[i].internalFormat,
                format: textureFormats[i].format,
                type: textureFormats[i].type,
                sources: [{ level: 0, source: image }],
            };
            samplers[i] = {
                minFilter: "NEAREST",
                magFilter: "NEAREST",
                lodMinClamp: 0,
                lodMaxClamp: 0,
            };
        }

        // -- Render
        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const rp: IGLRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: []
        };

        for (i = 0; i < TextureTypes.RGB8UI; ++i)
        {
            rp.renderObjects.push(
                { __type: "IGLViewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
                {
                    vertexArray,
                    pipeline: programNormalized,
                    uniforms: {
                        MVP: matrix,
                        diffuse: { texture: textures[i], sampler: samplers[i] },
                    },
                    drawArrays: { vertexCount: 6 },
                });
        }

        // Unsigned int textures
        for (i = TextureTypes.RGB8UI; i < TextureTypes.MAX; ++i)
        {
            rp.renderObjects.push(
                { __type: "IGLViewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
                {
                    vertexArray,
                    pipeline: programUint,
                    uniforms: {
                        MVP: matrix,
                        diffuse: { texture: textures[i], sampler: samplers[i] },
                    },
                    drawArrays: { vertexCount: 6 },
                });
        }
        webgl.runRenderPass(rp);

        // Delete WebGL resources
        webgl.deleteBuffer(vertexPosBuffer);
        webgl.deleteBuffer(vertexTexBuffer);
        for (i = 0; i < TextureTypes.MAX; ++i)
        {
            webgl.deleteTexture(textures[i]);
        }
        webgl.deleteProgram(programUint);
        webgl.deleteProgram(programNormalized);
        webgl.deleteVertexArray(vertexArray);
    });
})();
