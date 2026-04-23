import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const { status, customer, items, total } = await request.json();

        const updateData = {};
        if (status) updateData.status = status;
        if (customer) updateData.customer = customer;
        if (total) updateData.total = parseFloat(total);

        // If items are provided, we replace the existing ones
        if (items) {
            // Transaction to ensure data integrity
            const order = await prisma.$transaction(async (tx) => {
                // Delete old items
                await tx.orderItem.deleteMany({
                    where: { orderId: id },
                });

                // Update order and create new items
                return await tx.order.update({
                    where: { id },
                    data: {
                        ...updateData,
                        items: {
                            create: items.map((item) => ({
                                menuItemId: item.menuItemId,
                                quantity: item.quantity,
                                price: parseFloat(item.price),
                            })),
                        },
                    },
                    include: {
                        items: {
                            include: {
                                menuItem: true,
                            },
                        },
                    },
                });
            });
            return NextResponse.json(order);
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
