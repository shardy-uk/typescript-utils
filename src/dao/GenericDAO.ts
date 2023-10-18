export interface GenericDAO<D> {
    create(doc: D): Promise<D>;

    getOne(id: string): Promise<D>;

    getAll(): Promise<D[]>;

    update(doc: D): Promise<D>;

    delete(id: string): Promise<void | string>;

    // Add any other methods that both implementations should have
}
