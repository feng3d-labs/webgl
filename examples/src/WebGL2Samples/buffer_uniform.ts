import { CanvasContext, RenderObject, RenderPass, RenderPipeline, Submit, VertexAttributes } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';
import { getShaderSource } from './utility';

(function ()
{
    // --Init Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'glcanvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    // --Init WebGL Context
    const rc: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2' };
    const webgl = new WebGL(rc, {
        clearColorValue: [0.0, 0.0, 0.0, 1.0],
        loadColorOp: 'clear',
    });

    // -- Init Program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs') },
    };

    // -- Init Buffer
    let elementData = new Uint16Array([
        0, 1, 2,
        2, 3, 0,
    ]);

    const useSharedElementBuffer = true;
    if (useSharedElementBuffer)
    {
        // 共享元素缓冲区。模拟与其他模型的不同顶点索引数据公用一个大缓冲区。
        const elementBuffer = new ArrayBuffer(elementData.byteLength * 2);
        // 模拟随机偏移。
        const randomOffset = Math.ceil(Math.random() * (elementBuffer.byteLength - elementData.byteLength) / Uint16Array.BYTES_PER_ELEMENT) * Uint16Array.BYTES_PER_ELEMENT;
        const elementData1 = new Uint16Array(elementBuffer, randomOffset, elementData.length);
        elementData1.set(elementData);
        elementData = elementData1;
    }

    // vec3 position, vec3 normal, vec4 color
    let vertices = new Float32Array([
        -1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,
        1.0, -1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        -1.0, 1.0, -0.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
    ]);

    const useSharedVertexBuffer = true;
    if (useSharedVertexBuffer)
    {
        // 共享顶点缓冲区。模拟与其他模型的不同顶点数据公用一个大缓冲区。
        const vertexBuffer = new ArrayBuffer(vertices.byteLength * 2);
        // 模拟随机偏移。
        const randomOffset = Math.ceil(Math.random() * (vertexBuffer.byteLength - vertices.byteLength) / Float32Array.BYTES_PER_ELEMENT) * Float32Array.BYTES_PER_ELEMENT;
        const vertices1 = new Float32Array(vertexBuffer, randomOffset, vertices.length);
        vertices1.set(vertices);
        vertices = vertices1;
    }

    // mat4 P, mat4 MV, mat3 Mnormal
    const transforms = {
        transform: {
            P: [1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0,
            ],
            MV: [0.5, 0.0, 0.0, 0.0,
                0.0, 0.5, 0.0, 0.0,
                0.0, 0.0, 0.5, 0.0,
                0.0, 0.0, 0.0, 1.0,
            ],
            Mnormal: [
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0,
            ],
        },
    };

    const lightPos = {
        light: {
            position: [0.0, 0.0, 0.0],
        },
    };

    // vec3 ambient, diffuse, specular, float shininess
    const material = {
        material: {
            ambient: [0.1, 0.0, 0.0],
            diffuse: [0.5, 0.0, 0.0],
            specular: [1.0, 1.0, 1.0],
            shininess: 4.0,
        },
    };

    // -- Init Vertex Array
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: vertices, format: 'float32x3', arrayStride: 40, offset: 0 },
            normal: { data: vertices, format: 'float32x3', arrayStride: 40, offset: 12 },
            color: { data: vertices, format: 'float32x4', arrayStride: 40, offset: 24 },
        },
    };

    const bindingResources = {
        PerDraw: { value: transforms, bufferView: undefined },
        PerPass: { value: lightPos, bufferView: undefined },
        PerScene: { value: material, bufferView: undefined },
    };

    // 是否使用共用缓冲区。
    let useSharedBuffer = true;
    if (useSharedBuffer)
    {
        // 3 个统一块共用一个缓冲区。256字节对齐。
        // PerDraw 192字节
        // PerPass 16字节
        // PerScene 64字节
        const bufferViews = ((sizes: number[]) =>
        {
            const result = sizes.reduce((result, b) =>
            {
                const start = Math.ceil(result.total / 256) * 256;
                result.ranges.push({ offset: start, size: b });
                result.total = start + b;

                return result;
            }, { total: 0, ranges: [] as { offset: number, size: number }[] });

            const arrayBuffer = new ArrayBuffer(result.total);
            const bufferViews = result.ranges.map((v) =>
            {
                return new Uint8Array(arrayBuffer, v.offset, v.size);
            });

            return bufferViews;

        })([192, 16, 48]);

        bindingResources.PerDraw.bufferView = bufferViews[0];
        bindingResources.PerPass.bufferView = bufferViews[1];
        bindingResources.PerScene.bufferView = bufferViews[2];
    }

    const ro: RenderObject = {
        pipeline: program,
        bindingResources: bindingResources,
        vertices: vertexArray.vertices,
        indices: elementData,
        draw: { __type__: 'DrawIndexed', indexCount: 6, firstIndex: 0 },
    };

    const rp: RenderPass = {
        renderPassObjects: [ro],
    };

    const submit: Submit = { commandEncoders: [{ passEncoders: [rp] }] };

    let uTime = 0;
    function render()
    {
        uTime += 0.01;

        // -- update uniform buffer
        transforms.transform.MV[0] = 0.1 * Math.cos(uTime) + 0.4;
        transforms.transform.MV = transforms.transform.MV.concat(); // 强制更新

        lightPos.light.position[0] = Math.cos(3 * uTime);
        lightPos.light.position[1] = Math.sin(6 * uTime);
        lightPos.light.position = lightPos.light.position.concat(); // 强制更新

        webgl.submit(submit);

        requestAnimationFrame(render);
    }

    render();
})();
