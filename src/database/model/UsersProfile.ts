export default (sequelize: any, DataTypes: any) => {
  const UsersProfile = sequelize.define(
    "users_profile",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.SMALLINT,
      name: DataTypes.STRING,
      mobile_number: DataTypes.STRING,
      photo: DataTypes.STRING,
      gender: DataTypes.STRING,
      birthdate: DataTypes.STRING,
      address: DataTypes.STRING,
      address_coord: DataTypes.STRING,
      nationality: DataTypes.STRING,
      country: DataTypes.STRING,
      state: DataTypes.STRING,
      city: DataTypes.STRING,
      rating: DataTypes.SMALLINT,
      reviews: DataTypes.SMALLINT,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  // UsersProfile.associate = function(models: any) {
  //   UsersProfile.belongsTo(models.User);
  // };
  // const associate = ({ Users }: { Users: any }) => {
  //   UsersProfile.belongsTo(Users);
  // };

  return UsersProfile;
};
