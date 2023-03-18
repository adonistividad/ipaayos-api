export default (sequelize: any, DataTypes: any) => {
  const TasksOffers = sequelize.define(
    "tasks_offers",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: DataTypes.SMALLINT,
      provider_id: DataTypes.SMALLINT,
      category: DataTypes.STRING,
      currency: DataTypes.STRING,
      estimated_cost: DataTypes.DECIMAL,
      estimated_time: DataTypes.SMALLINT,
      remarks: DataTypes.STRING,
      documents: DataTypes.STRING,
      images: DataTypes.STRING,
      offer_datetime: DataTypes.STRING,
      offer_status: DataTypes.STRING,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );

  return TasksOffers;
};
