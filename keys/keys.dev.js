const mongo_config = require("../mongo.config");

module.exports = {
  MONGODB_URL: `mongodb://${mongo_config.user}:${mongo_config.pass}@cluster0-shard-00-00-4fmlh.mongodb.net:27017,cluster0-shard-00-01-4fmlh.mongodb.net:27017,cluster0-shard-00-02-4fmlh.mongodb.net:27017/${mongo_config.bd}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`,
  SESSION_SECRET: "some secret value",
  SENDGRID_API_KEY: "should_be_api_key",
  EMAIL_FROM: "send@test.tt",
  BASE_URL: "http://localhost:3000",
};
