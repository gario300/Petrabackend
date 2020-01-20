'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Alert extends Model {
    user(){
        return this.belongsTo('App/Models/User')
    }
    report(){
        return this.hasOne('App/Models/Report')
    }
}

module.exports = Alert
