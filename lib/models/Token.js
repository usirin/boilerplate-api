const Model = require('../BaseModel')
const Joi = require('joi')

module.exports = class Token extends Model {
  static get tableName() {
    return 'tokens'
  }

  static get joiSchema() {
    return Joi.object({
      userId: Joi.string(),
      type: Joi.string(),
    })
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./User'),
        join: {
          from: 'tokens.userId',
          to: 'users.id',
        },
      },
    }
  }
}
