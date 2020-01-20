'use strict'
const Alert = use('App/Models/Alert')
const Report = use('App/Models/Report')
const Rank = use('App/Models/Rank')
const Cloudinary = use('Cloudinary')
const { Expo } = use('expo-server-sdk');
const Expotoken = use('App/Models/Expotoken')
const User = use('App/Models/User')
const admin = use("firebase-admin");
const serviceAccount = use("App/petras-2f25d-firebase-adminsdk-f8rwx-74b27569b6");
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://petras-2f25d.firebaseio.com"
});


class ServerfunctionController {
    async makeop({ request, response}){
        const data = request.only(['superpassword', 'usernumber'])
        
        try{
            const user = await User.query()
                .where('number', data.usernumber)
                .with('rank')
                .firstOrFail()

            
            const userjson = await user.toJSON()

                if(data.superpassword == '152708' && userjson.rank == null){
                    const newop = await new Rank()
                    newop.user_id = userjson.id
                    newop.rank_type = 'Operador'
                    await newop.save()

                    return response.json({
                        status: 'sure',
                        data: 'Se registró al operador'
                    })
        
                }
        } catch(error){
            return response.status(400).json({
                data: 'wrong',
                status: 'No se pudo crear al operador'
            })
        }
    }

    async getalertssend({auth, response, request}){
        const data = request.only(['status', 'page'])
        const autentication = auth.current.user
        const user = await User.query()
            .where('id' , autentication.id)
            .with('rank')
            .firstOrFail()
        const tokens = await Expotoken.all()
        console.log(tokens)
        const operador = await user.toJSON()
        try{    

            if(operador.rank !== null){
                
                const reports = await Report.query()
                .where('status', data.status)
                .with('alert')
                .with('user')
                .orderBy('created_at', 'DESC')
                .paginate(data.page, 10)
                
                return response.json({
                    status: 'sure',
                    data: reports
                })
            } else{
                console.log(operador)
                return response.status(401).json({
                    status: 'wrong',
                    data: 'no estás autorizado para ver esto'
                })
            }
        } catch(error){
            return response.status(400).json({
                status: 'wrong',
                data: 'no estás autorizado para ver esto'
            })
        }

    }

    async onproccess({auth, params, response}){
        let autentication = auth.current.user
        const user = await User.query()
            .where('id' , autentication.id)
            .with('rank')
            .firstOrFail()
            const operador = await user.toJSON()

            if(operador.rank !== null && operador.rank.rank_type == 'Operador'){
                try{
                const report = await Report.findBy('id', params.id)
                report.status = 'En proceso'
                report.is_readed = false
                await report.save()
                
                const reportjson = await report.toJSON()

                const mytokens = await Expotoken.query()
                .where('user_id', reportjson.user_id)
                .fetch()
                
                const expotokens = await mytokens.toJSON()
                console.log(expotokens)
                if(expotokens !== null){
                    let expo = new Expo();
                    let messages = [];

                    for(let expotoken of expotokens){

                        messages.push({
                            to: expotoken.expo_token,
                            sound: 'default',
                            title: 'Tu reporte está en proceso',
                            body: 'Tu reporte con id '+reportjson.id+' ahora está en progreso',
                        })
                        
                    }

                    let chunks = expo.chunkPushNotifications(messages)

                    let tickets = []
                    for(let chunk of chunks ){
                        try {
                          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                          console.log(ticketChunk);
                          tickets.push(...ticketChunk);
                        } catch (error) {
                            return response.status(400).json({
                                status : 'wrong',
                                message: 'No se pudo enviar el reporte'
                            })
                        }

                    }
                }
                return response.json({
                    status: 'sure',
                    data: expotokens
                })
            }
            
            catch(error){
                return response.status(400).json({
                    status : 'wrong',
                    message: 'No se pudo enviar el reporte'
                })
            }
            
            }
    }

    async getonereport({auth, params, response}){
        
        try{
            const autentication = auth.current.user
            const user = await User.query()
                .where('id' , autentication.id)
                .with('rank')
                .firstOrFail()

            const operador = await user.toJSON()

            if(operador.rank !== null && operador.rank.rank_type == 'Operador'){
                const report = await Report.query()
                    .where('id', params.id)
                    .with('alert')
                    .with('user')
                    .firstOrFail()
                
                return response.json({
                    status: 'sure',
                    data: report
                })
            } else {
                return response.status(401).json({
                    status: 'wrong',
                    data: 'no estás autorizado para ver esto'
                })
            }
        } catch(error){
            return response.status(400).json({
                status: 'wrong',
                data: 'no estás autorizado para ver esto'
            })
        }
            
    }
    
}

module.exports = ServerfunctionController
