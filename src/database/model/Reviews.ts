import { any } from "sequelize/types/lib/operators";

export default (sequelize: any, DataTypes: any) => {
  const Reviews = sequelize.define(
    "reviews",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: DataTypes.SMALLINT,
      provider_id: DataTypes.SMALLINT,
      user_id: DataTypes.SMALLINT,
      rating: DataTypes.SMALLINT,
      remarks: DataTypes.STRING,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  return Reviews;
};
