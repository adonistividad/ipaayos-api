export default (sequelize: any, DataTypes: any) => {
  const Providers = sequelize.define(
    "providers",
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
      categories: DataTypes.STRING,
      about: DataTypes.STRING,
      transport: DataTypes.STRING,
      email_status: DataTypes.STRING,
      status: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      reviews: DataTypes.SMALLINT,
      photo: DataTypes.STRING,
      profile_images: DataTypes.STRING,
      price_per_hour: DataTypes.FLOAT,
      social_login: DataTypes.STRING,
      ts: DataTypes.STRING,
    },
    {
      freezeTableName: true,
    }
  );

  // Providers.associate = (models: any) => {
  //   Providers.hasMany(models.ProvidersProfile, {
  //     foreignKey: "user_id",
  //   });
  // };
  return Providers;
};
