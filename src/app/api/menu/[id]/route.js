import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { name, description, price, categoryName, image, available } = await request.json();

        let categoryId;
        if (categoryName) {
            let category = await prisma.category.findUnique({
                where: { name: categoryName },
            });

            if (!category) {
                category = await prisma.category.create({
                    data: { name: categoryName },
                });
            }
            categoryId = category.id;
        }

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                image,
                available,
                categoryId,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(menuItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.menuItem.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Menu item deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}
