import { any } from "sequelize/types/lib/operators";

export default (sequelize: any, DataTypes: any) => {
  const Notifications = sequelize.define(
    "notifications",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      }, 
      provider_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      message: DataTypes.STRING,
      recipient: DataTypes.STRING,
      url_param: DataTypes.STRING,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  return Notifications;
};
