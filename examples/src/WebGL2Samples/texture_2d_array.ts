import { IRenderObject, IRenderPass, IRenderPipeline, ISampler, ITexture, IVertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * 960 / 540;
    document.body.appendChild(canvas);

    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: IRenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init buffers
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
    const vertexArray: { vertices?: IVertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x2" },
            texcoord: { data: texCoords, format: "float32x2" },
        }
    };

    let texture: ITexture;
    let sampler: ISampler;
    loadImage("../../assets/img/di-animation-array.jpg", function (image)
    {
        const NUM_IMAGES = 3;
        const IMAGE_SIZE = {
            width: 960,
            height: 540
        };
        // use canvas to get the pixel data array of the image
        const canvas = document.createElement("canvas");
        canvas.width = IMAGE_SIZE.width;
        canvas.height = IMAGE_SIZE.height * NUM_IMAGES;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, IMAGE_SIZE.width, IMAGE_SIZE.height * NUM_IMAGES);
        const pixels = new Uint8Array(imageData.data.buffer);

        // -- Init Texture
        texture = {
            size: [IMAGE_SIZE.width, IMAGE_SIZE.height, NUM_IMAGES],
            dimension: "2d-array",
            format: "rgba8unorm",
            sources: [{ __type: "TextureDataSource", size: [IMAGE_SIZE.width, IMAGE_SIZE.height, NUM_IMAGES], data: pixels }],
        };
        sampler = {
            minFilter: "linear",
            magFilter: "linear",
        };

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const ro: IRenderObject = {
            pipeline: program,
            vertices: vertexArray.vertices,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            drawVertex: { vertexCount: 6 },
        };

        const rp: IRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [1.0, 1.0, 1.0, 1.0], loadOp: "clear" }] },
            renderObjects: [ro],
        };

        let frame = 0;
        (function render()
        {
            // -- Render
            ro.uniforms.layer = frame;

            webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

            frame = (frame + 1) % NUM_IMAGES;

            setTimeout(function ()
            {
                requestAnimationFrame(render);
            }, 200);
        })();
    });

    // If you have a long-running page, and need to delete WebGL resources, use:
    //
    // gl.deleteBuffer(vertexPosBuffer);
    // gl.deleteBuffer(vertexTexBuffer);
    // gl.deleteTexture(texture);
    // gl.deleteProgram(program);
    // gl.deleteVertexArray(vertexArray);
})();
