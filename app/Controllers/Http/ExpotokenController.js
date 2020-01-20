'use strict'
const User = use('App/Models/User')
const Expotoken = use('App/Models/Expotoken')

class ExpotokenController {
    
    async postoken({auth,request,response}){
    
    const data = request.only(['token'])
    const user = auth.current.user

    try{
    
    const usuario = await User.query()
    .where('id', user.id)
    .with('expotoken')
    .firstOrFail()

    const userdata = await usuario.toJSON()

        if(userdata.expotoken !== null){
            if(userdata.expotoken.expo_token !== data.token){

                const gtoken = await Expotoken.findBy('user_id', userdata.id)
                gtoken.user_id = userdata.id
                gtoken.expo_token = data.token
                await gtoken.save()

                return response.json({
                    status: 'succes',
                    data: 'Ahora recibes notificaciones'
                })
            } else{
                return response.json({
                    status: 'succes',
                    data: 'Ahora recibes notificaciones'
                })
            }
    } else {
        const utoken = await new Expotoken()
        utoken.user_id = userdata.id
        utoken.expo_token = data.token
        await utoken.save()

        return response.json({
            status: 'succes',
            data: 'Ahora recibes notificaciones'
        })
    }

    } catch(error){
        console.log(error)
        return response.status(400).json({
            status:'wrong',
            data:'Error'
        })
    }    

}
}

module.exports = ExpotokenController
