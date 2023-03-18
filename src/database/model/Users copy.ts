const { Model } = require("sequelize")
export default (sequelize: any, DataTypes: any) => {
  const Users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
      },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      user_name: DataTypes.STRING,
      mobile_number: DataTypes.STRING,
      // first_name: DataTypes.STRING,
      // last_name: DataTypes.STRING,
      // gender: DataTypes.STRING,
      // birthdate: DataTypes.STRING,
      // address: DataTypes.STRING,
      // address_coord: DataTypes.STRING,
      // nationality: DataTypes.STRING,
      // country: DataTypes.STRING,
      // state: DataTypes.STRING,
      // city: DataTypes.STRING,
      // category: DataTypes.STRING,
      // ip_address: DataTypes.STRING,
      // doc_status: DataTypes.STRING,
      photo: DataTypes.STRING,
      // profile_images: DataTypes.STRING,
      email_status: DataTypes.STRING,
      status: DataTypes.STRING,
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
