import { IRenderPass, IRenderPassObject, ITexture } from "@feng3d/render-api";
import { IGLCanvasContext, IGLRenderObject, IGLRenderPipeline, IGLSampler, IGLVertexAttributes, WebGL } from "@feng3d/webgl";

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

    // -- Mouse Behaviour
    let scale = 1.0;
    let mouseDown = false;
    let lastMouseY = 0;
    window.onmousedown = function (event)
    {
        mouseDown = true;
        lastMouseY = event.clientY;
    };
    window.onmouseup = function (event)
    {
        mouseDown = false;
    };
    window.onmousemove = function (event)
    {
        if (!mouseDown)
        {
            return;
        }
        const newY = event.clientY;

        const deltaY = newY - lastMouseY;

        scale += deltaY / 100;

        lastMouseY = newY;
    };

    // -- Divide viewport
    const windowSize = {
        x: canvas.width,
        y: canvas.height
    };

    const Corners = {
        TOP_LEFT: 0,
        TOP_RIGHT: 1,
        BOTTOM_RIGHT: 2,
        BOTTOM_LEFT: 3,
        MAX: 4
    };

    const viewport: { x: number, y: number, z: number, w: number }[] = new Array(Corners.MAX);

    viewport[Corners.BOTTOM_LEFT] = {
        x: 0,
        y: 0,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.BOTTOM_RIGHT] = {
        x: windowSize.x / 2,
        y: 0,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.TOP_RIGHT] = {
        x: windowSize.x / 2,
        y: windowSize.y / 2,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    viewport[Corners.TOP_LEFT] = {
        x: 0,
        y: windowSize.y / 2,
        z: windowSize.x / 2,
        w: windowSize.y / 2
    };

    // -- Initialize program
    const program: IGLRenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Initialize buffer
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);

    // -- Initialize vertex array
    const vertexArray: { vertices?: IGLVertexAttributes } = {
        vertices: {
            position: { data: positions, numComponents: 2 },
            textureCoordinates: { data: texcoords, numComponents: 2 },
        }
    };

    // -- Load texture then render
    const imageUrl = "../../assets/img/Di-3d.png";
    const textures: ITexture[] = new Array(Corners.MAX);
    const samplers: IGLSampler[] = new Array(Corners.MAX);
    loadImage(imageUrl, function (image)
    {
        textures[Corners.TOP_LEFT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image: image }],
        };
        samplers[Corners.TOP_LEFT] = {
            minFilter: "LINEAR_MIPMAP_LINEAR",
            magFilter: "LINEAR",
        };

        textures[Corners.TOP_RIGHT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image: image }],
        };
        samplers[Corners.TOP_RIGHT] = {
            minFilter: "LINEAR_MIPMAP_LINEAR",
            magFilter: "LINEAR",
            lodMinClamp: 3.0,
            lodMaxClamp: 3.0,
        };

        textures[Corners.BOTTOM_LEFT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image: image }],
        };
        samplers[Corners.BOTTOM_LEFT] = {
            minFilter: "LINEAR_MIPMAP_LINEAR",
            magFilter: "LINEAR",
            lodMinClamp: 0.0,
            lodMaxClamp: 10.0,
        };

        textures[Corners.BOTTOM_RIGHT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image: image }],
        };
        samplers[Corners.BOTTOM_RIGHT] = {
            minFilter: "LINEAR_MIPMAP_LINEAR",
            magFilter: "LINEAR",
            lodMinClamp: 0.0,
            lodMaxClamp: 10.0,
        };

        render();
    });

    function render()
    {
        const renderObjects: IRenderPassObject[] = [];
        // Clear color buffer
        const rp: IRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: renderObjects,
        };

        const matrix = new Float32Array([
            scale, 0.0, 0.0, 0.0,
            0.0, scale, 0.0, 0.0,
            0.0, 0.0, scale, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const ro: IGLRenderObject = {
            pipeline: program,
            uniforms: {
                mvp: matrix,
            },
            vertices: vertexArray.vertices,
            drawVertex: { vertexCount: 6 },
        };

        const lodBiasArray = [0.0, 0.0, 0.0, 0.0];
        lodBiasArray[Corners.BOTTOM_LEFT] = 3.5;
        lodBiasArray[Corners.BOTTOM_RIGHT] = 4.0;
        for (let i = 0; i < Corners.MAX; ++i)
        {
            renderObjects.push(
                { __type: "Viewport", x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
                {
                    ...ro,
                    uniforms: {
                        mvp: matrix,
                        lodBias: lodBiasArray[i],
                        diffuse: { texture: textures[i], sampler: samplers[i] },
                    },
                });
        }

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        requestAnimationFrame(render);
    }

    // If you have a long-running page, and need to delete WebGL resources, use:
    //
    // gl.deleteBuffer(vertexPosBuffer);
    // gl.deleteBuffer(vertexTexBuffer);
    // for (var j = 0; j < textures.length; ++j) {
    //     gl.deleteTexture(textures[j]);
    // }
    // gl.deleteVertexArray(vertexArray);
    // gl.deleteProgram(program);
})();
