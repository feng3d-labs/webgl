import { CanvasContext, RenderObject, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";
import { getShaderSource, loadImage } from "./utility";
import { reactive } from "@feng3d/reactivity";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * 960 / 540;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: RenderPipeline = {
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
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x2" },
            texcoord: { data: texCoords, format: "float32x2" },
        }
    };

    let texture: Texture;
    let sampler: Sampler;
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
            sources: [{ __type__: "TextureDataSource", size: [IMAGE_SIZE.width, IMAGE_SIZE.height, NUM_IMAGES], data: pixels }],
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

        const ro: RenderObject = {
            pipeline: program,
            bindingResources: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            vertices: vertexArray.vertices,
            draw: { __type__: "DrawVertex", vertexCount: 6 },
        };

        const rp: RenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [1.0, 1.0, 1.0, 1.0], loadOp: "clear" }] },
            renderPassObjects: [ro],
        };

        let frame = 0;
        (function render()
        {
            // -- Render
            reactive(ro.bindingResources).layer = frame;

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
