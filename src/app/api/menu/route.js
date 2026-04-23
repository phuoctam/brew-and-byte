import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const menuItems = await prisma.menuItem.findMany({
            include: {
                category: true,
            },
        });
        return NextResponse.json(menuItems);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, description, price, categoryName, image } = await request.json();

        // Find or create category
        let category = await prisma.category.findUnique({
            where: { name: categoryName },
        });

        if (!category) {
            category = await prisma.category.create({
                data: { name: categoryName },
            });
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                image,
                categoryId: category.id,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}
