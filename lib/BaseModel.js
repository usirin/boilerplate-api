const uuid = require('uuid/v4')
const Schwifty = require('schwifty')
const Joi = require('joi')
const { DbErrors } = require('objection-db-errors')

module.exports = class Model extends DbErrors(Schwifty.Model) {
  static async findOrCreate(model) {
    let fetched = await this.query().findOne(model)

    if (!fetched) {
      fetched = await this.query().insertAndFetch(model)
    }

    return fetched
  }

  static createNotFoundError(context) {
    return {
      ...super.createNotFoundError(context),
      modelName: this.name,
    }
  }

  static field(name) {
    return Joi.reach(this.getJoiSchema(), name)
      .optional()
      .options({ noDefaults: true })
  }

  $beforeInsert() {
    this.id = uuid()
    this.createdAt = new Date().toISOString()
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }
}
