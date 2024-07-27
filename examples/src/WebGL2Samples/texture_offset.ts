import { IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer, WebGL } from "@feng3d/webgl-renderer";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const gl = canvas.getContext("webgl2", { antialias: false });

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
    const programBicubic: IProgram = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-bicubic") } };

    const programOffsetBicubic: IProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs-offset-bicubic") },
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
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // -- Init Texture
        const texture: ITexture = {
            target: "TEXTURE_2D",
            pixelStore: {
                unpackFlipY: false,
            },
            internalformat: "RGBA",
            format: "RGBA",
            type: "UNSIGNED_BYTE",
            sources: [{ level: 0, source: image }],
        };
        const sampler: ISampler = {
            minFilter: "NEAREST",
            magFilter: "NEAREST",
            wrapS: "CLAMP_TO_EDGE",
            wrapT: "CLAMP_TO_EDGE",
        };

        // -- Render
        const rp: IRenderPass = {
            passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: []
        };

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        // No offset
        const ro: IRenderObject = {
            vertexArray,
            pipeline: programBicubic,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            viewport: { x: viewports[Corners.RIGHT].x, y: viewports[Corners.RIGHT].y, width: viewports[Corners.RIGHT].z, height: viewports[Corners.RIGHT].w },
            drawArrays: { vertexCount: 6 },
        };
        rp.renderObjects.push(ro);

        // Offset
        const offset = new Int32Array([100, -80]);

        rp.renderObjects.push({
            vertexArray,
            pipeline: programOffsetBicubic,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
                offset,
            },
            viewport: { x: viewports[Corners.LEFT].x, y: viewports[Corners.LEFT].y, width: viewports[Corners.LEFT].z, height: viewports[Corners.LEFT].w },
            drawArrays: { vertexCount: 6 },
        });

        WebGL.runRenderPass(rc, rp);

        // Delete WebGL resources
        WebGL.deleteBuffer(rc, vertexPosBuffer);
        WebGL.deleteBuffer(rc, vertexTexBuffer);
        WebGL.deleteTexture(rc, texture);
        WebGL.deleteProgram(rc, programOffsetBicubic);
        WebGL.deleteProgram(rc, programBicubic);
        WebGL.deleteVertexArray(rc, vertexArray);
    });
})();
