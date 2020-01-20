'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlertSchema extends Schema {
  up () {
    this.create('alerts', (table) => {
      table.increments()
      table.integer('user_id').notNullable().unsigned()
      table.string('type',10).notNullable()
      table.string('latitude')
      table.string('longitude')
      table.string('calle')
      table.string('colonia')
      table.integer('numerocasa')
      table.string('coments')
      table.string('image')
      table.boolean('supervition').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('alerts')
  }
}

module.exports = AlertSchema
