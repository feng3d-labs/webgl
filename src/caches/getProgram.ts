import { getWebGLUniformType, isWebGLUniformTextureType } from "../const/WebGLUniformType";
import { IAttributeInfo } from "../data/IAttributeInfo";
import { IRenderPipeline } from "../data/IRenderPipeline";
import { IUniformInfo } from "../data/IUniformInfo";
import { getWebGLAttributeValueType } from "./getWebGLAttributeType";

declare global
{
    interface WebGLRenderingContext
    {
        _programs: { [key: string]: WebGLProgram }
        _shaders: { [key: string]: WebGLShader }
    }

    export interface WebGLProgram
    {
        vertex: string;
        fragment: string;
        /**
         * 属性信息列表
         */
        attributes: IAttributeInfo[];
        /**
         * uniform信息列表
         */
        uniforms: IUniformInfo[];
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

    result = getWebGLProgram(gl, vertex, fragment);
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

function getWebGLProgram(gl: WebGLRenderingContext, vshader: string, fshader: string)
{
    // 编译顶点着色器
    const vertexShader = getWebGLShader(gl, "VERTEX_SHADER", vshader);

    // 编译片段着色器
    const fragmentShader = getWebGLShader(gl, "FRAGMENT_SHADER", fshader);

    // 创建着色器程序
    const program = createLinkProgram(gl, vertexShader, fragmentShader);

    // 获取属性信息
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    const attributes: IAttributeInfo[] = [];
    for (let i = 0; i < numAttributes; i++)
    {
        const activeInfo = gl.getActiveAttrib(program, i);
        const { name, size, type } = activeInfo;
        const location = gl.getAttribLocation(program, name);
        const typeString = getWebGLAttributeValueType(type as any);
        attributes.push({ name, size, type: typeString, location });
    }
    // 获取uniform信息
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const uniforms: IUniformInfo[] = [];
    let textureID = 0;
    for (let i = 0; i < numUniforms; i++)
    {
        const activeInfo = gl.getActiveUniform(program, i);
        const { name, size, type } = activeInfo;
        const reg = /(\w+)/g;

        const names = [name];
        if (size > 1)
        {
            console.assert(name.substring(name.length - 3) === "[0]");
            const baseName = name.substring(0, name.length - 3);
            for (let j = 1; j < size; j++)
            {
                names[j] = `${baseName}[${j}]`;
            }
        }

        for (let j = 0; j < names.length; j++)
        {
            const name = names[j];
            let result: RegExpExecArray = reg.exec(name);
            const paths: string[] = [];
            while (result)
            {
                paths.push(result[1]);
                result = reg.exec(name);
            }
            const location = gl.getUniformLocation(program, name);
            const typeString = getWebGLUniformType(type);
            const isTexture = isWebGLUniformTextureType(typeString);
            uniforms.push({ name, location, type: typeString, paths, textureID });

            if (isTexture)
            {
                textureID++;
            }
        }
    }
    if (gl instanceof WebGL2RenderingContext)
    {
        const numUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
        const uniformBlockActiveInfos = new Array(numUniformBlocks).fill(0).map((v, i) =>
        {
            const info: IUniformBlockInfo = {
                name: gl.getActiveUniformBlockName(program, i),
                binding: i,
                dataSize: gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_DATA_SIZE),
            };

            const uniformIndices = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);

            return info;
        });
    }

    //
    program.vertex = vshader;
    program.fragment = fshader;
    program.attributes = attributes;
    program.uniforms = uniforms;

    return program;
}

export interface IUniformBlockInfo
{
    /**
     * 名称。
     */
    name: string;

    /**
     * 绑定位置。
     */
    binding: number;

    /**
     * 数据尺寸。
     */
    dataSize: number;
}

/**
 * 编译着色器代码
 *
 * @param type 着色器类型
 * @param code 着色器代码
 * @return 编译后的着色器对象
 */
function getWebGLShader(gl: WebGLRenderingContext, type: ShaderType, code: string)
{
    let shader = gl._shaders[code];
    if (shader) return shader;

    shader = gl.createShader(gl[type]);
    gl._shaders[code] = shader;

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

/**
 * Shader type.
 *
 * Either a gl.FRAGMENT_SHADER or a gl.VERTEX_SHADER.
 */
export type ShaderType = "FRAGMENT_SHADER" | "VERTEX_SHADER";
