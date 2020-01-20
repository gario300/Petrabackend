'use strict'

const Hash = use('Hash')

const UserHook = module.exports = {}

/**
 * Hash using password as a hook.
 *
 * @method
 *
 * @param  {Object} userInstance
 *
 * @return {void}
 */
UserHook.hashPassword = async (userInstance) => {
  if (userInstance.$attributes.password) {
    if (userInstance.$attributes.password !== userInstance.$originalAttributes.password) {
      userInstance.password = await Hash.make(userInstance.$attributes.password)
    }
  }
}
