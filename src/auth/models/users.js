'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 'secretstring';

const userModel = (sequelize, DataTypes) => {
  const model = sequelize.define('users', {
    username: { type: DataTypes.STRING, required: true, unique: true },
    password: { type: DataTypes.STRING, required: true },
    role: { type: DataTypes.ENUM('user', 'writer', 'editor', 'admin'), required: true, defaultValue: 'user'},
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    dateOfBirth: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    profilePicture: { type: DataTypes.STRING },
    imageForCover: { type: DataTypes.STRING },
    career: { type: DataTypes.STRING },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username,id: this.id  }, SECRET);
      },
      set(tokenObj) {
        let token = jwt.sign(tokenObj, SECRET);
        return token;
      }
    },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          user: ['read'],
          writer: ['read', 'create'],
          editor: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete']
        };
        return acl[this.role];
      }
    }
  });

  model.beforeCreate(async (user) => {
    
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { return user; }
    throw new Error('Invalid User');
  };

  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({where: { username: parsedToken.username } });
      if (user) { return user; }
      throw new Error("User Not Found");
    } catch (e) {
      throw new Error(e.message)
    }
  };

  return model;
}

module.exports = userModel;
