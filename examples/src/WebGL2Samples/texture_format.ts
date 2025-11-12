import { CanvasContext, RenderPass, RenderPassObject, RenderPipeline, Sampler, Texture, TextureFormat, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
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
    const programUint: RenderPipeline = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-uint") } };

    const programNormalized: RenderPipeline = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-normalized") } };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);

    // -- Init VertexArray
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x2" },
            texcoord: { data: texCoords, format: "float32x2" },
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

        const textureFormats: { format: TextureFormat }[] = new Array(TextureTypes.MAX);

        textureFormats[TextureTypes.RGB] = {
            format: "rgba8unorm",
        };

        textureFormats[TextureTypes.RGB8] = {
            format: "rgba8unorm",
        };

        textureFormats[TextureTypes.RGB16F] = {
            format: "rgba16float",
        };

        textureFormats[TextureTypes.RGBA32F] = {
            format: "rgba32float",
        };

        textureFormats[TextureTypes.R16F] = {
            format: "r16float",
        };

        textureFormats[TextureTypes.RG16F] = {
            format: "rg16float",
        };

        textureFormats[TextureTypes.RGBA] = {
            format: "rgba8unorm",
        };

        textureFormats[TextureTypes.RGB8UI] = {
            format: "rgba8uint",
        };

        textureFormats[TextureTypes.RGBA8UI] = {
            format: "rgba8uint",
        };

        // -- Init Texture

        const textures: Texture[] = new Array(TextureTypes.MAX);
        const samplers: Sampler[] = new Array(TextureTypes.MAX);
        let i = 0;
        for (i = 0; i < TextureTypes.MAX; ++i)
        {
            textures[i] = {
                descriptor: {
                    size: [image.width, image.height],
                    format: textureFormats[i].format,
                },
                sources: [{
                    mipLevel: 0, image, flipY: false,
                }],
            };
            samplers[i] = {
                minFilter: "nearest",
                magFilter: "nearest",
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

        const renderObjects: RenderPassObject[] = [];
        const rp: RenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderPassObjects: renderObjects
        };

        for (i = 0; i < TextureTypes.RGB8UI; ++i)
        {
            renderObjects.push(
                {
                    viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
                    pipeline: programNormalized,
                    bindingResources: {
                        MVP: matrix,
                        diffuse: { texture: textures[i], sampler: samplers[i] },
                    },
                    vertices: vertexArray.vertices,
                    draw: { __type__: "DrawVertex", vertexCount: 6 },
                });
        }

        // Unsigned int textures
        for (i = TextureTypes.RGB8UI; i < TextureTypes.MAX; ++i)
        {
            renderObjects.push(
                {
                    viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
                    pipeline: programUint,
                    bindingResources: {
                        MVP: matrix,
                        diffuse: { texture: textures[i], sampler: samplers[i] },
                    },
                    vertices: vertexArray.vertices,
                    draw: { __type__: "DrawVertex", vertexCount: 6 },
                });
        }

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        for (i = 0; i < TextureTypes.MAX; ++i)
        {
            webgl.deleteTexture(textures[i]);
        }
        webgl.deleteProgram(programUint);
        webgl.deleteProgram(programNormalized);
    });
})();
