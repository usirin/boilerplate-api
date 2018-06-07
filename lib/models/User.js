const Model = require('../BaseModel')
const Joi = require('joi')

module.exports = class User extends Model {
  static get tableName() {
    return 'users'
  }

  static get joiSchema() {
    return Joi.object({
      username: Joi.string()
        .alphanum()
        .min(2)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.binary().allow(null),
      isActive: Joi.boolean(),
    })
  }

  $formatJson(json) {
    json = super.$formatJson(json)

    delete json.password

    return json
  }
}
