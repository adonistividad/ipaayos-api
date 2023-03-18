export default (sequelize: any, DataTypes: any) => {
  const Tasks = sequelize.define(
    "tasks",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.SMALLINT,
      task_offer_id: DataTypes.SMALLINT,
      category: DataTypes.STRING,
      images: DataTypes.STRING,
      task_datetime: DataTypes.STRING,
      location: DataTypes.STRING,
      location_coord: DataTypes.STRING,
      remarks: DataTypes.STRING,
      offers: DataTypes.SMALLINT,
      shortlisted: DataTypes.SMALLINT,
      declined: DataTypes.SMALLINT,
      rating: DataTypes.SMALLINT,
      review_text: DataTypes.STRING,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );

  return Tasks;
};
