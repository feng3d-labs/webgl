import { IVertexBuffer, IProgram, IRenderObject, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, WebGL } from "@feng3d/webgl-renderer";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * 960 / 540;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2" };

    // -- Init program
    const program: IProgram = {
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
            target: "TEXTURE_2D_ARRAY",
            internalformat: "RGBA",
            format: "RGBA",
            type: "UNSIGNED_BYTE",
            sources: [{ width: IMAGE_SIZE.width, height: IMAGE_SIZE.height, depth: NUM_IMAGES, border: 0, pixels }],
        };
        sampler = {
            minFilter: "LINEAR",
            magFilter: "LINEAR",
        };

        const matrix = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const ro: IRenderObject = {
            pipeline: program,
            vertexArray,
            uniforms: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            drawArrays: { vertexCount: 6 },
        };

        const rp: IRenderPass = {
            passDescriptor: { colorAttachments: [{ clearValue: [1.0, 1.0, 1.0, 1.0], loadOp: "clear" }] },
            renderObjects: [ro],
        };

        let frame = 0;
        (function render()
        {
            // -- Render
            ro.uniforms.layer = frame;
            WebGL.runRenderPass(rc, rp);

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
