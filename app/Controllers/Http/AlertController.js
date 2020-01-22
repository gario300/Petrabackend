'use strict'
const Alert = use('App/Models/Alert')
const Report = use('App/Models/Report')
const stripe = use('stripe')('sk_test_6Jnz1yV1rfBNyHyDITQNYWNp00oamIYJTh');
const User = use('App/Models/User')
const Cloudinary = use('Cloudinary')
const { validate } = use('Validator')


class AlertController {

    async newalert({auth, request,response}){
        const userData = request.only(['type','latitude','longitude']);
        try{
            let supervition = false 
            const user = auth.current.user

            let latitude = userData.latitude.toString()
            let longitude = userData.longitude.toString()
            
            const alertante = await User.query()
            .where('id', user.id)
            .with('customer')
            .firstOrFail()
            

            const alertanteobjeto = await alertante.toJSON()
            
            if(alertanteobjeto.customer !== null){
               const custominfo = await stripe.subscriptions.retrieve(alertanteobjeto.customer.customer_id)
            	console.log(custominfo.status)
                    if(custominfo.status == 'active'){
                        supervition = true
                    } else {
		    	supervition = false
		    }
            }

            const alert = await new Alert()
            alert.user_id = user.id
            alert.type = userData.type
            alert.latitude = latitude
            alert.longitude = longitude
            alert.supervition = supervition
            await alert.save();

            
            let prueba = await alert.toJSON()

            const report = await new Report()
            report.user_id = prueba.user_id
            report.alert_id = prueba.id
            report.status = 'Enviado'
            report.is_readed = true
            await report.save()

            return response.json({
				status: 'success',
				data: 'Panico Enviado'
            })
        } catch(error){
            return response.status(400).json({
				status: 'wrong',
				data: error
			})
        }
    }

    async reportalert({auth, request, response}){

        const userData = request.only(['latitude','longitude','image','coments']);

        const rules = {
            coments: 'required|string|max:300|min:25'
        }
        const messages = {
            required: 'Es necesario proporcionar los campos',
            max:'Tus comentarios no deben superar los 300 caracteres',
            min:'Tus comentarios deben tener al menos 25 caracteres',
        }

        const validation = await validate(userData, rules, messages)


        if (validation.fails()) {
            
            const message = validation.messages()
            let error = message[0]
            return response.status(400).json({
                status: 'wrong',
                message: error.message
            })
          } else{
            
            let finalimage = null

            if(userData.image !== null){
                const image = userData['image'];
                const resultado = await Cloudinary.v2.uploader.upload(image);
                finalimage = resultado.secure_url
            }

            try {
                const newalert = await new Alert()
                newalert.user_id = auth.current.user.id
                newalert.type= 'Informe'
                newalert.latitude = userData.latitude
                newalert.longitude = userData.longitude
                newalert.image = finalimage
                newalert.coments = userData.coments
                await newalert.save()

                let prueba = await newalert.toJSON()

                const report = await new Report()
                report.user_id = auth.current.user.id
                report.alert_id = prueba.id
                report.status = 'Enviado'
                report.is_readed = true
                await report.save()

                return response.json({
                    status: 'success',
                    data: '¡Alerta Enviada!'
                })

            } catch (error){
                console.log(error)
                return response.status(400).json({
                    status: 'wrong',
                    data: 'Hubo un error al procesar tu solicitud, intentalo más tarde'
                })
            }
        }


    }

    async needsupervition({auth, request, response}){
        const user = auth.current.user
        const data = request.only([, 'calle', 'colonia','numerocasa', 'coments','tokenId','type', 'price'])

        const rules= {
            calle: 'required|string|max:25|min:5',
            colonia:'required|string|max:25|min:5',
            numerocasa: 'required|string|max:5|min:1',
            coments: 'required|string|max:300|min:25'
        }

        const messages = {
            required: 'Es necesario llenar todos los campos',
            'calle.min':'Tu calle debe tener al menos 5 caracteres',
            'calle.max': 'Tu calle debe tener menos de 25 caracteres',
            'colonia.min':'Tu colonia debe tener al menos 5 caracteres',
            'colonia.max': 'Tu colonia debe tener menos de 25 caracteres',
            'numerocasa.min': 'Tu numero de casa debe tener al menos un caracter',
            'numerocasa.max': 'Tu numero de casa no puede tener más de cinco caracteres',
            'coments.min': 'Tus comentarios deben tener más de 25 caracteres',
            'coments.max': 'Tus comentarios deben tener menos de 300 caracteres'
        }
        const validation = await validate(data, rules, messages)

            if (validation.fails()){
                console.log(validation)
                const message = validation.messages()
                let error = message[0]
                return response.status(400).json({
                    status: 'wrong',
                    message: error.message
                })

            } else {

            const alertante = await User.query()
            .where('id', user.id)
            .with('customer')
            .firstOrFail()
            const alertanteobjeto = await alertante.toJSON()

            if(alertanteobjeto.customer !== null){
                const custominfo = await stripe.subscriptions.retrieve(alertanteobjeto.customer.customer_id)
                if(custominfo.status == 'active'){
                    try{
                        const alert = await new Alert()
                        alert.user_id = user.id
                        alert.type = data.type
                        alert.calle = data.calle
                        alert.colonia = data.colonia
                        alert.numerocasa = data.numerocasa
                        alert.coments = data.coments
                        alert.supervition = true
                        await alert.save()

                        const alertaobjeto = await alert.toJSON()
                        
                        const report = await new Report()
                        report.user_id = alertaobjeto.user_id
                        report.alert_id = alertaobjeto.id
                        report.status = 'Enviado'
                        report.is_readed = true
                        await report.save()
    
                        return response.json({
                            status: 'success',
                            data: '¡Alerta Enviada!'
                        })    
                    } catch(error){
                        return response.status(400).json({
                            status: 'wrong',
                            message: 'Estamos presentando fallas tecnicas, intentalo más tarde'
                        })
                    }
                } else if(custominfo.status !== 'active' && data.tokenId !== null){
                    try {
                        const charge = await stripe.charges.create({
                            amount: data.price,
                            currency: 'mxn',
                            source: data.tokenId,
                            description: 'Cargo por supervisión en '+data.type,
                        })
                        if(charge.status == 'succeeded'){

                            const alert = await new Alert()
                            alert.user_id = user.id
                            alert.type = data.type
                            alert.calle = data.calle
                            alert.colonia = data.colonia
                            alert.numerocasa = data.numerocasa
                            alert.coments = data.coments
                            alert.supervition = true
                            await alert.save()
    
                            const alertaobjeto = await alert.toJSON()
                            
                            const report = await new Report()
                            report.user_id = alertaobjeto.user_id
                            report.alert_id = alertaobjeto.id
                            report.status = 'Enviado'
                            report.is_readed = true
                            await report.save()
        
                            return response.json({
                                status: 'success',
                                data: '¡Alerta enviada!'
                            })    

                        } else {
                            return response.status(400).json({
                                status: 'Wrong',
                                data: 'pago no procesado'
                            })    
                        }
                    } catch(error){
                        console.log(error)
                        return response.status(400).json({
                            status: 'Wrong',
                            data: 'pago no procesado'
                        })  
                    }
                }
            } else {
                try {
                    const charge = await stripe.charges.create({
                        amount: data.price,
                        currency: 'mxn',
                        source: data.tokenId,
                        description: 'Cargo por supervisión en '+data.type,
                    })
                    if(charge.status == 'succeeded'){

                        const alert = await new Alert()
                        alert.user_id = user.id
                        alert.type = data.type
                        alert.calle = data.calle
                        alert.colonia = data.colonia
                        alert.numerocasa = data.numerocasa
                        alert.coments = data.coments
                        alert.supervition = true
                        await alert.save()

                        const alertaobjeto = await alert.toJSON()
                        
                        const report = await new Report()
                        report.user_id = alertaobjeto.user_id
                        report.alert_id = alertaobjeto.id
                        report.status = 'Enviado'
                        report.is_readed = true
                        await report.save()
    
                        return response.json({
                            status: 'success',
                            data: '¡Alerta Enviada!'
                        })    

                    } else {
                        return response.status(400).json({
                            status: 'Wrong',
                            data: 'pago no procesado'
                        })    
                    }
                } catch(error){
                    console.log(error)
                    return response.status(400).json({
                        status: 'Wrong',
                        data: 'pago no procesado'
                    })  
                }
            } 
        }
    }
}

module.exports = AlertController
