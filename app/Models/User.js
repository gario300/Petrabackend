'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')


class User extends Model {
  static boot () {
    super.boot()
    this.addHook('beforeCreate', 'User.hashPassword')
    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
  }
  static get hidden () {
    return ['password']
  }
  alerts(){
    return this.hasMany('App/Models/Alert')
  }
  reports(){
    return this.hasMany('App/Models/Report')
  }
  customer(){
    return this.hasOne('App/Models/Customer')
  }
  expotokens(){
    return this.hasMany('App/Models/Expotoken')
  }
  rank(){
    return this.hasOne('App/Models/Rank')
  }
}

module.exports = User
