'use strict'

class AppfunctionController {
    async versions({request, response}){
        const versiondata = request.only(['appversion'])
        const currentversion = '1.0.0'

        if(versiondata.appversion == currentversion) {
            return response.json({
                status: 'sure',
                data: 'sure'
            })
        } else{
            return response.status(400).json({
                status:'wrong',
                message:'Al parecer tu versión de PETRA no es la más actual ¡Porfavor! Actualiza para seguir disfrutando de nuestro servicio'
            })
        }

    }
}

module.exports = AppfunctionController
