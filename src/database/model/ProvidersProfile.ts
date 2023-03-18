export default (sequelize: any, DataTypes: any) => {
  const ProvidersProfile = sequelize.define(
    "providers_profile",
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
      about: DataTypes.STRING,
      categories: DataTypes.STRING,
      transport: DataTypes.STRING,
      address: DataTypes.STRING,
      address_coord: DataTypes.STRING,
      country: DataTypes.STRING,
      state: DataTypes.STRING,
      city: DataTypes.STRING,
      rating: DataTypes.SMALLINT,
      reviews: DataTypes.SMALLINT,
      profile_images: DataTypes.STRING,
      doc_status: DataTypes.STRING,
      status: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );
  // ProvidersProfile.associate = function(models: any) {
  //   ProvidersProfile.belongsTo(models.User);
  // };
  // const associate = ({ Users }: { Users: any }) => {
  //   ProvidersProfile.belongsTo(Users);
  // };

  return ProvidersProfile;
};
