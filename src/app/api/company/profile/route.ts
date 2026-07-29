import { NextResponse } from 'next/server';
import { CompanyDNALoader } from '@/core/company/company-dna-loader';
import type { CompanyDNA } from '@/types/company-dna';

/**
 * GET /api/company/profile
 * 
 * Load company DNA profile
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id') || 'default';

    const loader = CompanyDNALoader.getInstance();
    const dna = await loader.getDNA(workspaceId);

    return NextResponse.json({
      success: true,
      data: dna
    });

  } catch (err: any) {
    console.error('[API /company/profile GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/profile
 * 
 * Create or update company DNA profile
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dna: CompanyDNA = body.dna;

    if (!dna || !dna.identity?.companyName) {
      return NextResponse.json(
        { success: false, error: 'Invalid company DNA data' },
        { status: 400 }
      );
    }

    // Add metadata
    if (!dna.metadata) {
      dna.metadata = {
        workspaceId: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        status: 'active'
      };
    } else {
      dna.metadata.updatedAt = new Date().toISOString();
      dna.metadata.version = (dna.metadata.version || 0) + 1;
    }

    // Calculate years in business
    if (dna.identity.foundedYear) {
      dna.identity.yearsInBusiness = new Date().getFullYear() - dna.identity.foundedYear;
    }

    const loader = CompanyDNALoader.getInstance();
    const saved = await loader.save(dna);

    if (saved) {
      return NextResponse.json({
        success: true,
        message: 'Company DNA saved successfully',
        data: dna
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save company DNA' },
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error('[API /company/profile POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company/profile
 * 
 * Update company DNA profile
 */
export async function PUT(request: Request) {
  return POST(request); // Reuse POST logic
}

/**
 * DELETE /api/company/profile
 * 
 * Delete/archive company DNA profile
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id') || 'default';

    const loader = CompanyDNALoader.getInstance();
    const dna = await loader.getDNA(workspaceId);

    if (dna.metadata) {
      dna.metadata.status = 'archived';
      dna.metadata.updatedAt = new Date().toISOString();
    }

    const saved = await loader.save(dna);

    if (saved) {
      return NextResponse.json({
        success: true,
        message: 'Company DNA archived successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to archive company DNA' },
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error('[API /company/profile DELETE] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
