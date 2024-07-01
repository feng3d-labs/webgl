import { WebGLUniformTypeUtils } from "../const/WebGLUniformType";
import { IRenderPipeline } from "../data/IRenderPipeline";
import { WebGLUniform } from "../runs/runUniforms";

declare global
{
    interface WebGLRenderingContext
    {
        _programs: { [key: string]: WebGLProgram }
    }

    export interface WebGLProgram
    {
        vertex: WebGLShader, fragment: WebGLShader
        /**
         * 属性信息列表
         */
        attributes: { [name: string]: AttributeInfo };
        /**
         * uniform信息列表
         */
        uniforms: { [name: string]: WebGLUniform };
    }
}

/**
 * 激活渲染程序
 */
export function getProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
{
    const vertex = pipeline.vertex.code;
    const fragment = pipeline.fragment.code;

    const shaderKey = `${vertex}/n-------------shader-------------/n${fragment}`;
    let result = gl._programs[shaderKey];
    if (result) return result;

    result = compileShaderProgram(gl, vertex, fragment);
    gl._programs[shaderKey] = result;

    return result;
}

export function deleteProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
{
    const vertex = pipeline.vertex.code;
    const fragment = pipeline.fragment.code;

    const shaderKey = `${vertex}/n-------------shader-------------/n${fragment}`;
    const result = gl._programs[shaderKey];
    if (result)
    {
        delete gl._programs[shaderKey];
        gl.deleteProgram(result);
    }
}

function compileShaderProgram(gl: WebGLRenderingContext, vshader: string, fshader: string)
{
    // 创建着色器程序
    // 编译顶点着色器
    const vertexShader = compileShaderCode(gl, "VERTEX_SHADER", vshader);

    // 编译片段着色器
    const fragmentShader = compileShaderCode(gl, "FRAGMENT_SHADER", fshader);

    // 创建着色器程序
    const shaderProgram = createLinkProgram(gl, vertexShader, fragmentShader);

    // 获取属性信息
    const numAttributes = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
    const attributes: { [name: string]: AttributeInfo } = {};
    let i = 0;
    while (i < numAttributes)
    {
        const activeInfo = gl.getActiveAttrib(shaderProgram, i++);
        const location = gl.getAttribLocation(shaderProgram, activeInfo.name);
        attributes[activeInfo.name] = { activeInfo, location };
    }
    // 获取uniform信息
    const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
    const uniforms: { [name: string]: WebGLUniform } = {};
    i = 0;
    let textureID = 0;
    while (i < numUniforms)
    {
        const activeInfo = gl.getActiveUniform(shaderProgram, i++);
        const reg = /(\w+)/g;

        let name = activeInfo.name;
        const names = [name];
        if (activeInfo.size > 1)
        {
            console.assert(name.substr(-3, 3) === "[0]");
            const baseName = name.substring(0, name.length - 3);
            for (let j = 1; j < activeInfo.size; j++)
            {
                names[j] = `${baseName}[${j}]`;
            }
        }

        for (let j = 0; j < names.length; j++)
        {
            name = names[j];
            let result: RegExpExecArray = reg.exec(name);
            const paths: string[] = [];
            while (result)
            {
                paths.push(result[1]);
                result = reg.exec(name);
            }
            const location = gl.getUniformLocation(shaderProgram, name);
            const type = WebGLUniformTypeUtils.getType(activeInfo.type);
            const isTexture = WebGLUniformTypeUtils.isTexture(type);
            uniforms[name] = { activeInfo, location, type, paths, textureID };

            if (isTexture)
            {
                textureID++;
            }
        }
    }

    shaderProgram.vertex = vertexShader;
    shaderProgram.fragment = fragmentShader;
    shaderProgram.attributes = attributes;
    shaderProgram.uniforms = uniforms;

    return shaderProgram;
}

/**
 * 编译着色器代码
 * @param type 着色器类型
 * @param code 着色器代码
 * @return 编译后的着色器对象
 */
function compileShaderCode(gl: WebGLRenderingContext, type: ShaderType, code: string)
{
    const shader = gl.createShader(gl[type]);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    // 检查编译结果
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled)
    {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw `Failed to compile shader: ${error}`;
    }

    return shader;
}

function createLinkProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader)
{
    // 创建程序对象
    const program = gl.createProgram();

    // 添加着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // 链接程序
    gl.linkProgram(program);

    // 检查结果
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked)
    {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        throw `Failed to link program: ${error}`;
    }

    return program;
}

export interface AttributeInfo
{
    /**
     * WebGL激活信息。
     */
    activeInfo: WebGLActiveInfo;

    /**
     * 属性地址
     */
    location: number;
}

/**
 * Shader type.
 *
 * Either a gl.FRAGMENT_SHADER or a gl.VERTEX_SHADER.
 */
export type ShaderType = "FRAGMENT_SHADER" | "VERTEX_SHADER";