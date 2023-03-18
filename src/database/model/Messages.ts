import { any } from "sequelize/types/lib/operators";

export default (sequelize: any, DataTypes: any) => {
  const Messages = sequelize.define(
    "messages",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: DataTypes.INTEGER,
      provider_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      message: DataTypes.STRING,
      message_type: DataTypes.STRING,
      size: DataTypes.INTEGER,
      sender: DataTypes.STRING,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  return Messages;
};
