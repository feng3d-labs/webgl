import { IQuery } from "../data/IQueryAction";

declare global
{
    interface WebGLRenderingContext
    {
        _querys: Map<IQuery, WebGLQuery>
    }
}

export function getWebGLQuery(gl: WebGLRenderingContext, query: IQuery)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        let webGLQuery = gl._querys.get(query);
        if (webGLQuery) return webGLQuery;

        webGLQuery = (gl as any as WebGL2RenderingContext).createQuery();
        gl._querys.set(query, webGLQuery);

        return webGLQuery;
    }

    return null;
}

export function deleteWebGLQuery(gl: WebGLRenderingContext, query: IQuery)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLQuery = gl._querys.get(query);

        gl._querys.delete(query);

        gl.deleteQuery(webGLQuery);
    }
}