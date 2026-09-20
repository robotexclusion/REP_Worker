export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const prefix = url.pathname.replace(/^\/|\/$/g, "");

        const result = await env.DATA.list({
            prefix: prefix ? `${prefix}/` : "",
            delimiter: "/"
        });

        return new Response(renderDirectory(url.pathname, result), {
            headers: {
                "content-type": "text/html; charset=UTF-8"
            }
        });
    }
};
