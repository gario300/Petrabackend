'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RankSchema extends Schema {
  up () {
    this.create('ranks', (table) => {
      table.increments()
      table.integer('user_id')
      table.string('rank_type')
      table.timestamps()
    })
  }

  down () {
    this.drop('ranks')
  }
}

module.exports = RankSchema
