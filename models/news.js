'use strict';
module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('News', {
    source: DataTypes.JSON,
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    url: DataTypes.STRING,
    urlToImage: DataTypes.STRING
  }, {});
  News.associate = function(models) {
    // associations can be defined here
  };
  return News;
};