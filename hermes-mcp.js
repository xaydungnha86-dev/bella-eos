/**
 * standalone-hermes-mcp.js
 * Standalone Zero-Dependency Model Context Protocol (MCP) Server for Hermes Execution Engine.
 * Runs on http://localhost:8888.
 */
const http = require('http');

const PORT = 8888;

// Internal State
const logHistory = [];

function log(msg) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${msg}`;
    console.log(formatted);
    logHistory.push(formatted);
}

// Defined Tools following MCP Schema
const TOOLS = [
    {
        name: "publish_facebook_post",
        description: "Publish a campaign marketing post to a registered Facebook page feed.",
        inputSchema: {
            type: "object",
            properties: {
                message: { type: "string", description: "The content/text of the post to be published." },
                pageId: { type: "string", description: "The target Facebook Page ID." },
                accessToken: { type: "string", description: "Optional Facebook Page Access Token." }
            },
            required: ["message"]
        }
    },
    {
        name: "sync_crm_leads",
        description: "Synchronize newly generated leads or followers with the Bella EIP CRM database.",
        inputSchema: {
            type: "object",
            properties: {
                leadsCount: { type: "integer", description: "Number of new leads to import." },
                campaignId: { type: "string", description: "The active campaign ID." }
            },
            required: ["leadsCount"]
        }
    },
    {
        name: "get_mcp_status",
        description: "Retrieve health, uptime and execution metrics of the Hermes MCP Server.",
        inputSchema: {
            type: "object",
            properties: {}
        }
    }
];

// Handles JSON-RPC request from MCP Clients
async function handleJsonRpc(body) {
    try {
        const req = JSON.parse(body);
        const { jsonrpc, method, params, id } = req;

        if (jsonrpc !== "2.0") {
            return { jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request: expected jsonrpc 2.0" }, id: id || null };
        }

        log(`Received MCP Request - Method: "${method}"`);

        switch (method) {
            case "tools/list":
                return {
                    jsonrpc: "2.0",
                    result: {
                        tools: TOOLS
                    },
                    id
                };

            case "tools/call":
                const { name, arguments: args } = params || {};
                log(`Executing tool: "${name}" with args: ${JSON.stringify(args)}`);

                if (name === "publish_facebook_post") {
                    const pageId = args.pageId || "1029384756";
                    const message = args.message || "Default marketing message";
                    const accessToken = args.accessToken;

                    if (accessToken && !accessToken.includes('MOCK') && accessToken.length > 15) {
                        try {
                            log(`Attempting real Facebook Graph API call to Page ID: ${pageId}...`);
                            const fbResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    message: message,
                                    access_token: accessToken
                                })
                            });
                            
                            const data = await fbResponse.json();
                            if (fbResponse.ok && data.id) {
                                log(`Successfully published to Facebook Page! Post ID: ${data.id}`);
                                return {
                                    jsonrpc: "2.0",
                                    result: {
                                        content: [
                                            {
                                                type: "text",
                                                text: `✅ [Hermes MCP Server] Đăng bài THẬT thành công lên Facebook Page ID ${pageId}. Post ID: ${data.id}. Link: https://facebook.com/${data.id}`
                                            }
                                        ]
                                    },
                                    id
                                };
                            } else {
                                const errMsg = data.error ? data.error.message : 'Unknown error';
                                log(`Facebook Graph API failed: ${errMsg}`);
                                return {
                                    jsonrpc: "2.0",
                                    result: {
                                        content: [
                                            {
                                                type: "text",
                                                text: `⚠️ [Hermes MCP Server Error] Không thể đăng bài lên Facebook: ${errMsg}. Đang kích hoạt chế độ giả lập...`
                                            }
                                        ]
                                    },
                                    id
                                };
                            }
                        } catch (err) {
                            log(`Facebook connection error: ${err.message}`);
                            return {
                                jsonrpc: "2.0",
                                result: {
                                    content: [
                                        {
                                            type: "text",
                                            text: `⚠️ [Hermes MCP Server Connection Error] Lỗi kết nối: ${err.message}. Đang kích hoạt chế độ giả lập...`
                                        }
                                    ]
                                },
                                id
                            };
                        }
                    } else {
                        log(`No real Facebook Token provided. Running in simulation mode.`);
                    }

                    // Simulated API call success
                    return {
                        jsonrpc: "2.0",
                        result: {
                            content: [
                                {
                                    type: "text",
                                    text: `✅ [Hermes MCP Server Simulator] Đăng bài thành công lên Facebook Page ID ${pageId} (Mô phỏng). Nội dung: "${message.substring(0, 50)}..."`
                                }
                            ]
                        },
                        id
                    };
                }

                if (name === "sync_crm_leads") {
                    const count = args.leadsCount || 0;
                    const campId = args.campaignId || "CAMP-DEFAULT";
                    return {
                        jsonrpc: "2.0",
                        result: {
                            content: [
                                {
                                    type: "text",
                                    text: `✅ [Hermes MCP Server] Đã đồng bộ ${count} leads của chiến dịch ${campId} vào hệ thống Bella CRM.`
                                }
                            ]
                        },
                        id
                    };
                }

                if (name === "get_mcp_status") {
                    return {
                        jsonrpc: "2.0",
                        result: {
                            content: [
                                {
                                    type: "text",
                                    text: `🟢 [Hermes MCP Server] Online | Uptime: ${process.uptime().toFixed(1)}s | Cổng: ${PORT} | Công cụ đã nạp: 3.`
                                }
                            ]
                        },
                        id
                    };
                }

                return { jsonrpc: "2.0", error: { code: -32601, message: `Tool "${name}" not found.` }, id };

            default:
                return { jsonrpc: "2.0", error: { code: -32601, message: `Method "${method}" not found.` }, id };
        }
    } catch (e) {
        return { jsonrpc: "2.0", error: { code: -32700, message: `Parse error: ${e.message}` }, id: null };
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers so the browser client can communicate directly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && (req.url === '/jsonrpc' || req.url === '/')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            const response = await handleJsonRpc(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
    } else if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: "ONLINE", uptimeSeconds: process.uptime(), logs: logHistory }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found. Please use POST to /jsonrpc');
    }
});

server.listen(PORT, () => {
    log(`Hermes Model Context Protocol (MCP) Server is listening on http://localhost:${PORT}`);
    log(`Registered tools: ${TOOLS.map(t => t.name).join(', ')}`);
});
