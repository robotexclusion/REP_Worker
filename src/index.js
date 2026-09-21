export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const prefix = url.pathname.replace(/^\/|\/$/g, "");

        try {
            if (prefix) {
                const object = await env.DATA.get(prefix);
                if (object) {
                    const headers = new Headers();
                    object.writeHttpMetadata(headers);
                    headers.set("etag", object.httpEtag);
                    return new Response(object.body, { headers });
                }
            }

            const result = await env.DATA.list({
                prefix: prefix ? `${prefix}/` : "",
                delimiter: "/"
            });

            return new Response(renderDirectory(url.pathname, result), {
                headers: {
                    "content-type": "text/html; charset=UTF-8"
                }
            });
        } catch (error) {
            return new Response("Unable to list bucket contents.", {
                status: 500,
                headers: {
                    "content-type": "text/plain; charset=UTF-8"
                }
            });
        }
    }
};

function renderDirectory(pathname, result) {
    const currentPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const directories = result.delimitedPrefixes.map((prefix) =>
        `<li><a href="${encodeURI(`/${prefix}`)}">${escapeHtml(prefix)}</a></li>`
    );
    const objects = result.objects.map((object) => {
        const href = `/${object.key}`;
        return `<li><a href="${encodeURI(href)}">${escapeHtml(object.key)}</a></li>`;
    });

    return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Index of ${escapeHtml(currentPath)}</title></head>
<body>
<h1>Index of ${escapeHtml(currentPath)}</h1>
<ul>${directories.join("")}${objects.join("")}</ul>
</body>
</html>`;
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[character]);
}
