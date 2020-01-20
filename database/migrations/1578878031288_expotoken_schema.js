'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ExpotokenSchema extends Schema {
  up () {
    this.create('expotokens', (table) => {
      table.increments()
      table.integer('user_id')
      table.string('expo_token')
      table.timestamps()
    })
  }

  down () {
    this.drop('expotokens')
  }
}

module.exports = ExpotokenSchema
