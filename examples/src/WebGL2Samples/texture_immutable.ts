import { IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
import { snoise } from "./third-party/noise3D";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    const Corners = {
        LEFT: 0,
        RIGHT: 1,
        MAX: 2
    };

    const viewports: { x: number, y: number, z: number, w: number }[] = new Array(Corners.MAX);

    viewports[Corners.LEFT] = {
        x: 0,
        y: canvas.height / 4,
        z: canvas.width / 2,
        w: canvas.height / 2
    };

    viewports[Corners.RIGHT] = {
        x: canvas.width / 2,
        y: canvas.height / 4,
        z: canvas.width / 2,
        w: canvas.height / 2
    };

    // -- Init program
    const program: IProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

    const program3D: IProgram = { vertex: { code: getShaderSource("vs-3d") }, fragment: { code: getShaderSource("fs-3d") } };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // -- Init VertexArray
    const vertexArray: IVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            in_texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    const { texture3D, sampler3D } = create3DTexture();

    const imageUrl = "../../assets/img/Di-3d.png";
    loadImage(imageUrl, function (image)
    {
        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        // -- Init 2D Texture
        const texture2D: ITexture = {
            target: "TEXTURE_2D",
            pixelStore: {
                unpackFlipY: false,
            },
            internalformat: "RGB8",
            format: "RGB",
            type: "UNSIGNED_BYTE",
            storage: { levels: 1, width: 512, height: 512 },
            writeTextures: [{ level: 0, xoffset: 0, yoffset: 0, source: image }],
        };
        const sampler2D: ISampler = {
            minFilter: "NEAREST",
            magFilter: "LINEAR",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
        };

        // -- Render
        const ro: IRenderObject = {
            pipeline: program,
            vertexArray,
            uniforms: {
                MVP: matrix,
            },
            drawArrays: { vertexCount: 6 },
        };

        const rp: IRenderPass = {
            passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: []
        };

        rp.renderObjects.push({
            ...ro,
            pipeline: program,
            uniforms: {
                ...ro.uniforms,
                diffuse: { texture: texture2D, sampler: sampler2D },
            },
            viewport: { x: viewports[Corners.LEFT].x, y: viewports[Corners.LEFT].y, width: viewports[Corners.LEFT].z, height: viewports[Corners.LEFT].w }
        });

        // Immutable 3D texture
        rp.renderObjects.push({
            ...ro,
            pipeline: program3D,
            uniforms: {
                ...ro.uniforms,
                diffuse: { texture: texture3D, sampler: sampler3D },
            },
            viewport: { x: viewports[Corners.RIGHT].x, y: viewports[Corners.RIGHT].y, width: viewports[Corners.RIGHT].z, height: viewports[Corners.RIGHT].w }
        });

        webgl.runRenderPass(rp);

        // Delete WebGL resources
        webgl.deleteBuffer(vertexPosBuffer);
        webgl.deleteBuffer(vertexTexBuffer);
        webgl.deleteTexture(texture2D);
        webgl.deleteTexture(texture3D);
        webgl.deleteProgram(program);
        webgl.deleteProgram(program3D);
        webgl.deleteVertexArray(vertexArray);
    });

    function create3DTexture()
    {
        // Note By @kenrussel: The sample was changed from R32F to R8 for best portability.
        // not all devices can render to floating-point textures
        // (and, further, this functionality is in a WebGL extension: EXT_color_buffer_float),
        // and renderability is a requirement for generating mipmaps.

        const SIZE = 32;
        const data = new Uint8Array(SIZE * SIZE * SIZE);
        for (let k = 0; k < SIZE; ++k)
        {
            for (let j = 0; j < SIZE; ++j)
            {
                for (let i = 0; i < SIZE; ++i)
                {
                    data[i + j * SIZE + k * SIZE * SIZE] = snoise([i, j, k]) * 256;
                }
            }
        }

        const texture3D: ITexture = {
            target: "TEXTURE_3D",
            internalformat: "R8",
            format: "RED",
            type: "UNSIGNED_BYTE",
            generateMipmap: true,
            storage: { levels: Math.log2(SIZE), width: SIZE, height: SIZE, depth: SIZE },
            writeTextures: [{ level: 0, xoffset: 0, yoffset: 0, zoffset: 0, width: SIZE, height: SIZE, depth: SIZE, srcData: data }],
        };
        const sampler3D: ISampler = {
            lodMinClamp: 0,
            lodMaxClamp: Math.log2(SIZE),
            minFilter: "LINEAR_MIPMAP_LINEAR",
            magFilter: "LINEAR",
        };

        return { texture3D, sampler3D };
    }
})();
