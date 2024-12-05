import { IGLOcclusionQuery, IGLQuery } from "../data/IGLOcclusionQuery";
import { deleteWebGLQuery, getWebGLQuery } from "./getWebGLQuery";

export function getGLOcclusionQueryStep(gl: WebGLRenderingContext, occlusionQuery: IGLOcclusionQuery)
{
    const query: IGLQuery = {} as any;
    let webGLQuery: WebGLQuery;

    // 开始查询
    const begin = () =>
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            webGLQuery = getWebGLQuery(gl, query);

            gl.beginQuery(gl.ANY_SAMPLES_PASSED, webGLQuery);
        }
    };

    const end = () =>
    {
        // 结束查询
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.endQuery(gl.ANY_SAMPLES_PASSED);
        }
    }

    /**
     * 获取查询结果。
     */
    const resolve = async () =>
    {
        if (query.result !== undefined) return occlusionQuery;

        if (gl instanceof WebGL2RenderingContext)
        {
            const webGLQuery = getWebGLQuery(gl, query);
            const result: IGLOcclusionQuery = await new Promise((resolve, reject) =>
            {
                (function tick()
                {
                    if (!gl.getQueryParameter(webGLQuery, gl.QUERY_RESULT_AVAILABLE))
                    {
                        // A query's result is never available in the same frame
                        // the query was issued.  Try in the next frame.
                        requestAnimationFrame(tick);

                        return;
                    }

                    query.result = gl.getQueryParameter(webGLQuery, gl.QUERY_RESULT);

                    occlusionQuery.result = query;

                    resolve(occlusionQuery);

                    deleteWebGLQuery(gl, query);
                })();
            });

            return result;
        }

        return undefined;
    }

    return { begin, end, resolve } as IGLOcclusionQueryStep;
}

/**
 * 不被遮挡查询步骤。
 */
export interface IGLOcclusionQueryStep
{
    /**
     * 开始查询
     */
    begin: () => void;

    /**
     * 结束查询
     */
    end: () => void;

    /**
     * 获取查询结果，将获取被赋值新结果的遮挡查询对象。
     */
    resolve: () => Promise<IGLOcclusionQuery>
}