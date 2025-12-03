import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    root: __dirname,
    publicDir: false,
    server: {
        port: 3001,
        open: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'depth-attachment-canvas-readpixels.html'),
            },
        },
    },
    resolve: {
        alias: {
            '@feng3d/webgl': resolve(__dirname, '../src'),
            '@feng3d/render-api': resolve(__dirname, '../packages/render-api/src'),
        },
    },
    plugins: [
        shaderToString(),
    ],
});

function shaderToString()
{
    return {
        name: 'vite-plugin-string',
        async transform(source, id)
        {
            if (!['glsl', 'wgsl', 'vert', 'frag', 'vs', 'fs'].includes(id.split('.').pop())) return;

            const esm = `export default \`${source}\`;`;

            return { code: esm, map: { mappings: '' } };
        },
    };
}

