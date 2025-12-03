/**
 * 原生 WebGL readPixels 测试
 *
 * 使用原生 WebGL API 直接读取画布像素颜色，验证 readPixels 功能
 */

// 创建着色器
function createShader(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, source: string): WebGLShader | null
{
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.error('着色器编译错误:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

// 创建着色器程序
function createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null
{
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error('程序链接错误:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);

        return null;
    }

    return program;
}

// 创建红色三角形
function createRedTriangle(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void
{
    // 顶点数据（红色三角形）
    const vertices = new Float32Array([
        -0.5, -0.5,  // 左下
        0.5, -0.5,   // 右下
        0.0, 0.5,    // 上
    ]);

    // 创建缓冲区
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 获取属性位置
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 设置颜色（红色）
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0); // 红色

    // 绘制
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// 创建绿色三角形
function createGreenTriangle(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram): void
{
    // 顶点数据（绿色三角形，稍小一些）
    const vertices = new Float32Array([
        -0.3, -0.3,  // 左下
        0.3, -0.3,   // 右下
        0.0, 0.3,    // 上
    ]);

    // 创建缓冲区
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 获取属性位置
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 设置颜色（绿色）
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform4f(colorLocation, 0.0, 1.0, 0.0, 1.0); // 绿色

    // 绘制
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// 读取像素颜色
function readPixelColor(gl: WebGLRenderingContext | WebGL2RenderingContext, x: number, y: number): [number, number, number, number]
{
    // 确保所有渲染命令都已完成
    // gl.finish();

    // 绑定到默认 framebuffer（画布）
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // 设置读取缓冲区（默认 framebuffer 使用 BACK 缓冲区）
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.readBuffer(gl.BACK);
    }

    // 创建缓冲区来存储像素数据
    const pixel = new Uint8Array(4);

    // 计算 WebGL 坐标系中的 y 坐标（WebGL 坐标系是左下角为原点）
    const glY = gl.drawingBufferHeight - y - 1;

    // 读取像素
    gl.readPixels(x, glY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    // 检查错误
    const error = gl.getError();
    if (error !== gl.NO_ERROR)
    {
        console.error(`readPixels 错误: ${error}`);
    }

    return [pixel[0], pixel[1], pixel[2], pixel[3]];
}

// 测试函数
async function testReadPixels(canvasId: string, statusId: string, infoId: string, createTriangle: (gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram) => void, expectedColor: [number, number, number, number], colorName: string): Promise<void>
{
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const statusDiv = document.getElementById(statusId) as HTMLDivElement;
    const infoDiv = document.getElementById(infoId) as HTMLDivElement;

    if (!canvas || !statusDiv || !infoDiv)
    {
        console.error('无法找到元素');

        return;
    }

    try
    {
        // 获取 WebGL 上下文
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl)
        {
            statusDiv.textContent = '错误: 无法获取 WebGL 上下文';
            statusDiv.className = 'status fail';

            return;
        }

        // 顶点着色器源码
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // 片段着色器源码
        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `;

        // 创建着色器
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader)
        {
            statusDiv.textContent = '错误: 着色器创建失败';
            statusDiv.className = 'status fail';

            return;
        }

        // 创建程序
        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program)
        {
            statusDiv.textContent = '错误: 程序创建失败';
            statusDiv.className = 'status fail';

            return;
        }

        // 使用程序
        gl.useProgram(program);

        // 设置视口
        gl.viewport(0, 0, canvas.width, canvas.height);

        // 清除画布（黑色背景）
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 绘制三角形
        createTriangle(gl, program);

        // 等待渲染完成
        // gl.finish();

        // 读取中心点的像素颜色
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);

        console.log(`${colorName} 测试: 读取中心点 (${centerX}, ${centerY}), 画布尺寸: ${canvas.width}x${canvas.height}`);

        await new Promise(resolve => requestAnimationFrame(resolve));
        // await new Promise(resolve => requestAnimationFrame(resolve));
        // await new Promise(resolve => requestAnimationFrame(resolve));
        // await new Promise(resolve => requestAnimationFrame(resolve));

        const [r, g, b, a] = readPixelColor(gl, centerX, centerY);

        console.log(`${colorName} 测试: 读取到的颜色: (${r}, ${g}, ${b}, ${a})`);

        // 显示信息
        infoDiv.textContent = `读取位置: (${centerX}, ${centerY})\n读取颜色: (${r}, ${g}, ${b}, ${a})\n期望颜色: (${expectedColor[0]}, ${expectedColor[1]}, ${expectedColor[2]}, ${expectedColor[3]})`;

        // 验证结果（允许一些误差，因为抗锯齿等因素）
        const tolerance = 50;
        const isMatch = Math.abs(r - expectedColor[0]) < tolerance
            && Math.abs(g - expectedColor[1]) < tolerance
            && Math.abs(b - expectedColor[2]) < tolerance
            && Math.abs(a - expectedColor[3]) < tolerance;

        if (isMatch)
        {
            statusDiv.textContent = `✓ 测试通过: 中心点颜色为 ${colorName} (${r}, ${g}, ${b}, ${a})`;
            statusDiv.className = 'status pass';
        }
        else
        {
            statusDiv.textContent = `✗ 测试失败: 中心点颜色为 (${r}, ${g}, ${b}, ${a})，期望为 ${colorName} (${expectedColor[0]}, ${expectedColor[1]}, ${expectedColor[2]}, ${expectedColor[3]})`;
            statusDiv.className = 'status fail';
        }
    }
    catch (error)
    {
        statusDiv.textContent = `错误: ${error instanceof Error ? error.message : String(error)}`;
        statusDiv.className = 'status fail';
        console.error(`${colorName} 测试错误:`, error);
    }
}

// 运行测试
document.addEventListener('DOMContentLoaded', () =>
{
    console.log('开始运行原生 WebGL readPixels 测试...');

    // 测试 1: 读取红色三角形
    testReadPixels(
        'canvas-red',
        'status-red',
        'info-red',
        createRedTriangle,
        [255, 0, 0, 255],
        '红色',
    );

    // 测试 2: 读取绿色三角形
    testReadPixels(
        'canvas-green',
        'status-green',
        'info-green',
        createGreenTriangle,
        [0, 255, 0, 255],
        '绿色',
    );

    console.log('测试完成');
});

