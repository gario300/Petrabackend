'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LlamadaSchema extends Schema {
  up () {
    this.create('llamadas', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('llamadas')
  }
}

module.exports = LlamadaSchema
