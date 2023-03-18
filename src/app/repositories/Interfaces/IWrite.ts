export interface IWrite<T> {
    create(item: any, tableName: string): Promise<{}>;
    bulkcreate(itemArr: any, tableName: string): Promise<{}>;
    update(id: number, item: any, tableName: string): Promise<{}>;
    delete(id: number, tableName: string): Promise<{}>;
}