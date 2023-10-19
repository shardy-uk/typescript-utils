export interface GenericDAO<D> {
    create(doc: D): Promise<D>;

    getOne(id: string): Promise<D>;

    getAll(): Promise<D[]>;

    update(doc: D): Promise<D>;

    delete(id: string): Promise<void | string>;

    getNextSequenceId(sequenceId: string): Promise<number>;

    getMany(ids: string[]): Promise<D[]>;

    findByField(fieldName: string, value: any): Promise<D[]>;
}
