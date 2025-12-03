/**
 * WebGL readPixels 单元测试
 *
 * 使用 @feng3d/webgl 库测试读取画布和纹理颜色的功能
 */

import { CanvasTexture, RenderObject, Submit, Texture, TextureView } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';

// 创建红色三角形
function createRedTriangle(): RenderObject
{
    return {
        vertices: {
            position: {
                data: new Float32Array([
                    -0.5, -0.5, 0.0, // 左下
                    0.5, -0.5, 0.0,  // 右下
                    0.0, 0.5, 0.0,   // 上
                ]),
                format: 'float32x3' as const,
            },
        },
        draw: { __type__: 'DrawVertex' as const, vertexCount: 3 },
        bindingResources: { color: { value: [1, 0, 0, 1] } }, // 红色
        pipeline: {
            vertex: {
                code: `
                    attribute vec3 position;
                    uniform vec4 color;
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
            },
            fragment: {
                code: `
                    precision mediump float;
                    uniform vec4 color;
                    void main() {
                        gl_FragColor = color;
                    }
                `,
            },
        },
    };
}

// 创建绿色三角形
function createGreenTriangle(): RenderObject
{
    return {
        vertices: {
            position: {
                data: new Float32Array([
                    -0.3, -0.3, 0.0, // 左下
                    0.3, -0.3, 0.0,  // 右下
                    0.0, 0.3, 0.0,   // 上
                ]),
                format: 'float32x3' as const,
            },
        },
        draw: { __type__: 'DrawVertex' as const, vertexCount: 3 },
        bindingResources: { color: { value: [0, 1, 0, 1] } }, // 绿色
        pipeline: {
            vertex: {
                code: `
                    attribute vec3 position;
                    uniform vec4 color;
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
            },
            fragment: {
                code: `
                    precision mediump float;
                    uniform vec4 color;
                    void main() {
                        gl_FragColor = color;
                    }
                `,
            },
        },
    };
}

// 读取像素颜色
function readPixelColor(webgl: WebGL, textureView: TextureView, x: number, y: number): [number, number, number, number]
{
    const result = webgl.readPixels({
        textureView,
        origin: [x, y],
        copySize: [1, 1],
    });

    // 将结果转换为 Uint8Array 并提取 RGBA 值
    let pixel: Uint8Array;
    if (result instanceof Uint8Array)
    {
        pixel = result;
    }
    else
    {
        pixel = new Uint8Array(result.buffer, result.byteOffset, result.byteLength);
    }

    if (pixel.length < 4)
    {
        console.error(`readPixelColor: 读取到的数据长度不足，期望至少 4 个字节，实际 ${pixel.length} 个字节`);

        return [0, 0, 0, 0];
    }

    return [pixel[0], pixel[1], pixel[2], pixel[3]];
}

// 测试 1: 从画布读取红色
async function testReadFromCanvasRed()
{
    const canvas = document.getElementById('canvas-red') as HTMLCanvasElement;
    const statusDiv = document.getElementById('status-red') as HTMLDivElement;
    const infoDiv = document.getElementById('info-red') as HTMLDivElement;

    try
    {
        const webgl = new WebGL({ canvasId: 'canvas-red', webGLcontextId: 'webgl2' });
        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!gl)
        {
            statusDiv.textContent = '错误: 无法获取 WebGL2 上下文';
            statusDiv.className = 'status fail';

            return;
        }

        const redTriangle = createRedTriangle();

        // 使用画布纹理视图
        const canvasTexture: CanvasTexture = {
            context: { canvasId: 'canvas-red', webGLcontextId: 'webgl2' },
        };

        const textureView: TextureView = {
            texture: canvasTexture,
        };

        // 渲染到画布
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1], view: textureView }],
                        },
                        renderPassObjects: [redTriangle],
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 读取中心点颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);

        const [r, g, b, a] = readPixelColor(webgl, textureView, centerX, centerY);

        // 显示信息
        infoDiv.innerHTML = `
            <div class="info-item">读取位置: (${centerX}, ${centerY})</div>
            <div class="info-item">读取颜色: (${r}, ${g}, ${b}, ${a})</div>
            <div class="info-item">期望颜色: (255, 0, 0, 255)</div>
        `;

        // 验证结果（允许一些误差）
        const tolerance = 50;
        const isRed = r > 200 && g < 100 && b < 100;

        if (isRed)
        {
            statusDiv.textContent = `✓ 测试通过: 成功读取到红色 (${r}, ${g}, ${b}, ${a})`;
            statusDiv.className = 'status pass';
        }
        else
        {
            statusDiv.textContent = `✗ 测试失败: 读取到的颜色为 (${r}, ${g}, ${b}, ${a})，期望为红色`;
            statusDiv.className = 'status fail';
        }
    }
    catch (error)
    {
        statusDiv.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
        statusDiv.className = 'status fail';
        console.error('测试 1 错误:', error);
    }
}

// 测试 2: 从画布读取绿色
async function testReadFromCanvasGreen()
{
    const canvas = document.getElementById('canvas-green') as HTMLCanvasElement;
    const statusDiv = document.getElementById('status-green') as HTMLDivElement;
    const infoDiv = document.getElementById('info-green') as HTMLDivElement;

    try
    {
        const webgl = new WebGL({ canvasId: 'canvas-green', webGLcontextId: 'webgl2' });
        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!gl)
        {
            statusDiv.textContent = '错误: 无法获取 WebGL2 上下文';
            statusDiv.className = 'status fail';

            return;
        }

        const greenTriangle = createGreenTriangle();

        // 使用画布纹理视图
        const canvasTexture: CanvasTexture = {
            context: { canvasId: 'canvas-green', webGLcontextId: 'webgl2' },
        };

        const textureView: TextureView = {
            texture: canvasTexture,
        };

        // 渲染到画布
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1], view: textureView }],
                        },
                        renderPassObjects: [greenTriangle],
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 读取中心点颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);

        const [r, g, b, a] = readPixelColor(webgl, textureView, centerX, centerY);

        // 显示信息
        infoDiv.innerHTML = `
            <div class="info-item">读取位置: (${centerX}, ${centerY})</div>
            <div class="info-item">读取颜色: (${r}, ${g}, ${b}, ${a})</div>
            <div class="info-item">期望颜色: (0, 255, 0, 255)</div>
        `;

        // 验证结果（允许一些误差）
        const tolerance = 50;
        const isGreen = g > 200 && r < 100 && b < 100;

        if (isGreen)
        {
            statusDiv.textContent = `✓ 测试通过: 成功读取到绿色 (${r}, ${g}, ${b}, ${a})`;
            statusDiv.className = 'status pass';
        }
        else
        {
            statusDiv.textContent = `✗ 测试失败: 读取到的颜色为 (${r}, ${g}, ${b}, ${a})，期望为绿色`;
            statusDiv.className = 'status fail';
        }
    }
    catch (error)
    {
        statusDiv.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
        statusDiv.className = 'status fail';
        console.error('测试 2 错误:', error);
    }
}

// 测试 3: 从纹理读取颜色
async function testReadFromTexture()
{
    const canvas = document.getElementById('canvas-texture') as HTMLCanvasElement;
    const statusDiv = document.getElementById('status-texture') as HTMLDivElement;
    const infoDiv = document.getElementById('info-texture') as HTMLDivElement;

    try
    {
        const webgl = new WebGL({ canvasId: 'canvas-texture', webGLcontextId: 'webgl2' });
        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

        if (!gl)
        {
            statusDiv.textContent = '错误: 无法获取 WebGL2 上下文';
            statusDiv.className = 'status fail';

            return;
        }

        const redTriangle = createRedTriangle();

        // 创建纹理用于渲染
        const renderTexture: Texture = {
            descriptor: {
                size: [canvas.width, canvas.height],
                format: 'rgba8unorm',
            },
        };

        const textureView: TextureView = {
            texture: renderTexture,
        };

        // 渲染到纹理
        const submit: Submit = {
            commandEncoders: [{
                passEncoders: [
                    {
                        descriptor: {
                            colorAttachments: [{ clearValue: [0, 0, 0, 1], view: textureView }],
                        },
                        renderPassObjects: [redTriangle],
                    },
                ],
            }],
        };

        webgl.submit(submit);

        // 等待渲染完成
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 读取纹理中心点颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);

        const [r, g, b, a] = readPixelColor(webgl, textureView, centerX, centerY);

        // 显示信息
        infoDiv.innerHTML = `
            <div class="info-item">读取位置: (${centerX}, ${centerY})</div>
            <div class="info-item">读取颜色: (${r}, ${g}, ${b}, ${a})</div>
            <div class="info-item">期望颜色: (255, 0, 0, 255)</div>
            <div class="info-item">注意: 从纹理读取，不显示在画布上</div>
        `;

        // 验证结果（允许一些误差）
        const tolerance = 50;
        const isRed = r > 200 && g < 100 && b < 100;

        if (isRed)
        {
            statusDiv.textContent = `✓ 测试通过: 成功从纹理读取到红色 (${r}, ${g}, ${b}, ${a})`;
            statusDiv.className = 'status pass';
        }
        else
        {
            statusDiv.textContent = `✗ 测试失败: 读取到的颜色为 (${r}, ${g}, ${b}, ${a})，期望为红色`;
            statusDiv.className = 'status fail';
        }
    }
    catch (error)
    {
        statusDiv.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
        statusDiv.className = 'status fail';
        console.error('测试 3 错误:', error);
    }
}

// 运行所有测试
document.addEventListener('DOMContentLoaded', async () =>
{
    console.log('开始运行 WebGL readPixels 测试...');
    await testReadFromCanvasRed();
    await testReadFromCanvasGreen();
    await testReadFromTexture();
    console.log('所有测试完成');
});

