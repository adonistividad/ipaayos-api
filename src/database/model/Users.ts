export default (sequelize: any, DataTypes: any) => {
  const Users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      mobile_number: DataTypes.STRING,
      datestarted: DataTypes.STRING,
      address: DataTypes.STRING,
      location: DataTypes.STRING,
      longitude: DataTypes.FLOAT,
      latitude: DataTypes.FLOAT,
      nationality: DataTypes.STRING,
      country: DataTypes.STRING,
      state: DataTypes.STRING,
      city: DataTypes.STRING,
      region: DataTypes.STRING,
      municipality: DataTypes.STRING,
      neighbourhood: DataTypes.STRING,
      road: DataTypes.STRING,
      postcode: DataTypes.STRING,
      ip_address: DataTypes.STRING,
      about: DataTypes.STRING,
      email_status: DataTypes.STRING,
      status: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      reviews: DataTypes.SMALLINT,
      photo: DataTypes.STRING,
      social_login: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );

  // Users.associate = (models: any) => {
  //   Users.hasMany(models.UsersProfile, {
  //     foreignKey: "user_id",
  //   });
  // };
  return Users;
};
