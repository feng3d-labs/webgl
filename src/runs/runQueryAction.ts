import { deleteWebGLQuery, getWebGLQuery } from "../caches/getWebGLQuery";
import { IQuery, IQueryAction } from "../data/IQueryAction";

export function runQueryAction(gl: WebGLRenderingContext, queryAction: IQueryAction)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const { action, target, query } = queryAction;

        // 该查询对象生命周期已结束，不再进行第二次查询。
        if (query.state === "endQuery") return;

        const webGLQuery = getWebGLQuery(gl, query);
        gl[action](gl[target], webGLQuery);
        //
        query.state = action;
        query.target = target;
    }
}

/**
 * 获取查询结果。
 */
export async function getQueryResult(gl: WebGLRenderingContext, query: IQuery)
{
    if (query.result !== undefined) return query.result;

    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLQuery = getWebGLQuery(gl, query);
        const result: number = await new Promise((resolve, reject) =>
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

                resolve(query.result);

                deleteWebGLQuery(gl, query);
            })();
        });

        return result;
    }

    return 0;
}