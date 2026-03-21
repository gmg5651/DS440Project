// Mock for web demo purposes
const mockQuery = () => ({
    from: () => ({
        where: () => Promise.resolve([]),
        limit: () => Promise.resolve([]),
        orderBy: () => Promise.resolve([]),
        then: (cb: any) => Promise.resolve([]).then(cb),
    }),
    values: () => Promise.resolve(),
    set: () => ({ where: () => Promise.resolve() }),
    where: () => Promise.resolve([]),
});

export const db: any = {
    select: mockQuery,
    insert: mockQuery,
    update: mockQuery,
    delete: mockQuery,
};
