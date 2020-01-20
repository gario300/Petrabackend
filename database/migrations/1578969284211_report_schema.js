'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReportSchema extends Schema {
  up () {
    this.create('reports', (table) => {
      table.increments()
      table.integer('user_id').notNullable()
      table.integer('alert_id').notNullable()
      table.string('status',20).notNullable()
      table.string('supervisor_name', 20)
      table.string('operador_name',20)
      table.string('report',300)
      table.string('image', 300)
      table.boolean('is_readed').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('reports')
  }
}

module.exports = ReportSchema
