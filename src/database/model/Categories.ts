import { any } from "sequelize/types/lib/operators";

export default (sequelize: any, DataTypes: any) => {
  const Categories = sequelize.define(
    "categories",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      icon: DataTypes.STRING,
      class_name: DataTypes.STRING,
      width: DataTypes.INTEGER,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  return Categories;
};
