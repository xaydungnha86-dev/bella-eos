import { NextResponse } from 'next/server';
import { HermesMcpServerEngine } from '@/connectors/hermes-mcp-connector';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mcp/hermes
 * Returns human-readable MCP Server metadata and capability list
 */
export async function GET() {
  return NextResponse.json({
    server: 'Hermes Social Publisher MCP Server',
    version: '1.0.0',
    protocolVersion: '2024-11-05',
    status: 'ACTIVE',
    mcpEndpoint: '/api/mcp/hermes',
    capabilities: {
      tools: HermesMcpServerEngine.getTools(),
      resources: HermesMcpServerEngine.getResources()
    },
    documentation: 'Sử dụng HTTP POST với payload JSON-RPC 2.0 để giao tiếp với Hermes MCP Server'
  });
}

/**
 * POST /api/mcp/hermes
 * Handles standard Model Context Protocol (MCP) JSON-RPC 2.0 Requests
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await HermesMcpServerEngine.handleJsonRpcRequest(body);
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: `Parse error: ${err.message}` }
    }, { status: 400 });
  }
}
