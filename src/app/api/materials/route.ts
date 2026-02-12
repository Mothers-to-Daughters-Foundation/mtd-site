import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllTrainingMaterials,
  getTrainingMaterialById,
  createTrainingMaterial,
  updateTrainingMaterial,
} from '@/lib/models/TrainingMaterial';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('id');

    if (materialId) {
      const material = await getTrainingMaterialById(materialId);
      if (!material) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
      }
      return NextResponse.json(material);
    }

    const materials = await getAllTrainingMaterials();
    return NextResponse.json(materials);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const material = await createTrainingMaterial({
      ...body,
      isPublished: body.isPublished ?? false,
    });

    return NextResponse.json(material);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create material' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { materialId, updates } = body;

    if (!materialId || !updates) {
      return NextResponse.json(
        { error: 'materialId and updates are required' },
        { status: 400 }
      );
    }

    const updatedMaterial = await updateTrainingMaterial(materialId, updates);
    
    if (!updatedMaterial) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json(updatedMaterial);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update material' },
      { status: 500 }
    );
  }
}
