import { IRead } from "./../Interfaces/IRead";
import { IWrite } from "./../Interfaces/IWrite";

export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
  public _db: any;

  constructor() {
    // Connect with all the databases
  }

  async create(item: any, tableName: string): Promise<{}> {
    const result = await this._db[tableName].create(item);
    return result;
  }
  async bulkcreate(itemArr: any, tableName: string): Promise<{}> {
    const result = await this._db[tableName].bulkCreate(itemArr);
    return result;
  }
  async update(id: number, item: any, tableName: string): Promise<{}> {
    const result = await this._db[tableName].update(item, { where: { id } });
    return result;
  }
  async updateByCondition(
    condition: any,
    item: any,
    tableName: string
  ): Promise<{}> {
    const result = await this._db[tableName].update(item, condition);
    return result;
  }
  async delete(id: number, tableName: string): Promise<{}> {
    const result = await this._db[tableName].destroy({ where: { id } });
    return result;
  }
  async deleteByCondition(condition: any, tableName: string): Promise<{}> {
    const result = await this._db[tableName].destroy(condition);
    return result;
  }
  async findAll(tableName: string): Promise<[]> {
    const result = await this._db[tableName].findAll();
    return result;
  }
  async findAllByCondition(condition: any, tableName: string): Promise<[]> {
    const result = await this._db[tableName].findAll(condition);
    return result;
  }
  async findOne(item: any, tableName: string): Promise<{}> {
    const result = await this._db[tableName].findOne(item);
    return result;
  }
  async updateOrCreate(newItem: any, tableName: string, condition: any) {
    // console.log('newItem, tableName, condition', newItem, tableName, condition)
    const foundItem = await this.findOne(condition, tableName);
    if (!foundItem) {
      const item = await this._db[tableName].create(newItem);
      return { item, created: true };
    }
    const item = await this._db[tableName].update(newItem, condition);
    return { item, created: false };
  }

  async countByCondition(condition: any, tableName: string): Promise<[]> {
    const result = await this._db[tableName].count(condition);
    return result;
  }
}``
