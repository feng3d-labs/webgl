import { RenderPass, IRenderPassObject, Material, Sampler, Texture, RenderObject, VertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";

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
    const program: Material = {
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
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x2" },
            textureCoordinates: { data: texcoords, format: "float32x2" },
        }
    };

    // -- Load texture then render
    const imageUrl = "../../assets/img/Di-3d.png";
    const textures: Texture[] = new Array(Corners.MAX);
    const samplers: Sampler[] = new Array(Corners.MAX);
    loadImage(imageUrl, function (image)
    {
        textures[Corners.TOP_LEFT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image }],
        };
        samplers[Corners.TOP_LEFT] = {
            minFilter: "linear",
            magFilter: "linear",
            mipmapFilter: "linear",
        };

        textures[Corners.TOP_RIGHT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image }],
        };
        samplers[Corners.TOP_RIGHT] = {
            minFilter: "linear",
            magFilter: "linear",
            mipmapFilter: "linear",
            lodMinClamp: 3.0,
            lodMaxClamp: 3.0,
        };

        textures[Corners.BOTTOM_LEFT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image }],
        };
        samplers[Corners.BOTTOM_LEFT] = {
            minFilter: "linear",
            magFilter: "linear",
            mipmapFilter: "linear",
            lodMinClamp: 0.0,
            lodMaxClamp: 10.0,
        };

        textures[Corners.BOTTOM_RIGHT] = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            generateMipmap: true,
            sources: [{ mipLevel: 0, image }],
        };
        samplers[Corners.BOTTOM_RIGHT] = {
            minFilter: "linear",
            magFilter: "linear",
            mipmapFilter: "linear",
            lodMinClamp: 0.0,
            lodMaxClamp: 10.0,
        };

        render();
    });

    function render()
    {
        const renderObjects: IRenderPassObject[] = [];
        // Clear color buffer
        const rp: RenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects,
        };

        const matrix = new Float32Array([
            scale, 0.0, 0.0, 0.0,
            0.0, scale, 0.0, 0.0,
            0.0, 0.0, scale, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const ro: RenderObject = {
            pipeline: program,
            uniforms: {
                mvp: matrix,
            },
            geometry:{
                vertices: vertexArray.vertices,
                draw: { __type: "DrawVertex", vertexCount: 6 },
            }
        };

        const lodBiasArray = [0.0, 0.0, 0.0, 0.0];
        lodBiasArray[Corners.BOTTOM_LEFT] = 3.5;
        lodBiasArray[Corners.BOTTOM_RIGHT] = 4.0;
        for (let i = 0; i < Corners.MAX; ++i)
        {
            renderObjects.push(
                {
                    viewport: { x: viewport[i].x, y: viewport[i].y, width: viewport[i].z, height: viewport[i].w },
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
