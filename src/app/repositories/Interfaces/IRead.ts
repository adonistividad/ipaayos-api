export interface IRead<T> {
    findAll(tableName: string): Promise<[]>;
    findOne(item: any, tableName: string): Promise<{}>;
}