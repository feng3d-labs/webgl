import { IIndicesDataTypes, IRenderPass, IRenderPassObject, IRenderPipeline, ISampler, ITexture, IVertexAttributes, IVertexDataTypes } from "@feng3d/render-api";
import { getIGLBuffer, IGLCanvasContext, WebGL } from "@feng3d/webgl";
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
    const program: IRenderPipeline = {
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
    const vertexPosBuffer: IVertexDataTypes = positions;

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IVertexDataTypes = texCoords;

    // -- Init VertexArray
    const vertexArray: { vertices?: IVertexAttributes, indices?: IIndicesDataTypes } = {
        vertices: {
            position: { data: vertexPosBuffer, format: "float32x2" },
            texcoord: { data: vertexTexBuffer, format: "float32x2" },
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
        const texture: ITexture = {
            size: [image.width / 2, image.height / 2],
            format: "rgba8unorm",
            sources: [{
                __type: "TextureDataSource",
                mipLevel: 0,
                size: [image.width / 2, image.height / 2],
                data: pixels,
                dataLayout: { width: image.width },
                dataImageOrigin: [image.width / 4, image.width / 4],
            }]
        };
        const sampler: ISampler = {
            minFilter: "nearest",
            magFilter: "nearest",
        };

        const renderObjects: IRenderPassObject[] = [];
        // -- Render
        const rp: IRenderPass = {
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
