export default (sequelize: any, DataTypes: any) => {
    const OTPVerification = sequelize.define(
        "otp_verification",
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          otp: DataTypes.INTEGER,
          email: DataTypes.STRING,
          status: DataTypes.STRING,
          ts: DataTypes.DATE
        },
        {
            freezeTableName: true
        }
    );
    return OTPVerification;
  };
  