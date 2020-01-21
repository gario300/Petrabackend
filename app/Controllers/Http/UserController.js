'use strict'
const stripe = use('stripe')('sk_test_6Jnz1yV1rfBNyHyDITQNYWNp00oamIYJTh');
const User = use('App/Models/User')
const Report = use('App/Models/Report')
const Customer = use('App/Models/Customer')
const Expotoken = use('App/Models/Expotoken')
const { validate } = use('Validator')
const cjson = use('compressed-json')


class UserController {
    async signup ({ request, auth, response }) {
		// get user data from signup form
		const userData = request.only(['name', 'number','password','gender']);
        //console.log(userData);
        try {
            const rules = {
                name: 'required|string|max:10|alpha',
                number: 'required|string|max:10|min:10|unique:users,number|integer',
                password: 'string|required|min:8|max:15',
                gender:'string'
            }
            const messages = {
                required: 'Es necesario llenar todos los campos',
                alpha: 'Tu nombre no puede contener simbolos ni espacios',
                'number.unique': 'Este numero ya está registrado',
                'number.min':'Tu numero no puede ser inferior a 10 caracteres',
                max: 'Nombre o numero no pueden ser mayores a 10 caracteres',
                integer : 'Solo se aceptan numeros del 0 al 9',
                'password.min': 'Tu contraseña debe tener más de 8 caracteres',
                'password.max': 'Tu contraseña debe ser menor a 15 caracteres'
              }

            const validation = await validate(userData, rules, messages)


            if (validation.fails()) {
                
                const message = validation.messages()
                let error = message[0]
                return response.status(400).json({
                    status: 'wrong',
                    message: error.message
                })
              } else {

                const user = await new User()
                user.name = userData.name
                user.gender = userData.gender
                user.number = userData.number
                user.password = userData.password
                await user.save();    
                const token = await auth.generate(user)
                
                
                
                return response.json({
                    status: 'success',
                    data: token
                })
              }
        } catch(error){
            return response.status(400).json({
                status: 'wrong',
                message : 'error'
            })
        }
        
	}
	async login ({ request, auth, response }) {
        
        try {
            const rules = {
                number:'required|string|integer|max:10|min:10',
                password:'required|string|max:15|min:8'
            }
            const messages = {
                required:'Ninguno de los campos pueden estar vacios',
                'password.min': 'La contraseña debe tener más de 8 caracteres',
                'password.max':'La contraseña debe tener menos de 15 caracteres',
                'number.min':'El numero debe tener 10 caracteres',
                'number.max': 'El numero no puede tener más de 10 caracteres LADA',
                string: 'Ninguno de los valores puede ser diferente a un texto',
                integer:'Porfavor llena los campos'
            } 

            const validation = await validate(request.all(), rules, messages)

            if (validation.fails()) {
                
                const message = validation.messages()
                let error = message[0]
                return response.status(400).json({
                    status: 'wrong',
                    message: error.message
                })
              } else{

            const token = await auth.attempt(
                request.input('number'),
                request.input('password')
            )
                
            return response.json({
                status: 'success',
                data: token
            })}
        } catch (error) {
            console.log(error)
            response.status(400).json({
                status: 'error',
                message: 'Contraseña o E-mail incorrecto'
            })
        }
    }
    async me ({ auth, response, params }) {
        try{
        let custominfo = {}
        let finalresponse = null

        const user = await User.query()
            .where('id', auth.current.user.id)
            .with('customer')
            .firstOrFail()   
        
        const customer = await user.toJSON()

        if(customer.customer !== null){
            custominfo = await stripe.subscriptions.retrieve(customer.customer.customer_id)

            if(custominfo.status == 'active'){
                user.is_premium = true
                await user.save()
            } else {
                user.is_premium = false
                await user.save()
            }
        } else {
            user.is_premium = false
            await user.save()
        }
        const alltokens = await Expotoken.findBy('expo_token', params.token)

        if(alltokens == null && params.token !== null){
            const newtoken = await new Expotoken()
            newtoken.user_id = customer.id
            newtoken.expo_token = params.token
            newtoken.save()
        }
        //tokens

        return response.json({
            status: 'success',
            data: user
        })

    } catch(error){
        return response.status(400).json({
            status: 'wrong',
            data: 'No pudimos acceder a tu usuario intentalo de nuevo más tarde'
        })
    }

    }
    async premium({auth, request,response}){

        const userData = request.only(['tokenId','email'])

         try {
        
            const customer = await stripe.customers.create({
                email : userData.email,
                source: userData.tokenId
            })

            const pay = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{plan: 'plan_GT9nmMFhVtieYt'}],
            })

            if(pay.status == 'active' ){
            
            const usuario = await User.query()
            .where('id', auth.current.user.id)
            .with('customer')
            .firstOrFail()

            const user = usuario.toJSON()
            
            if(user.customer == null){
                const newcustom = await new Customer()
                newcustom.user_id = auth.current.user.id
                newcustom.customer_id = pay.id
                await newcustom.save()

                return response.json({
                    status: 'wrong',
                    data: newcustom
    
                })

            } else {

                const updatecustomer = await Customer.findBy('user_id', auth.current.user.id)
                updatecustomer.customer_id = pay.id
                await updatecustomer.save()

                return response.json({
                    status: 'wrong',
                    data: updatecustomer
    
                })
            }
        } else {
            return response.status(400).json({
                status: 'err',
                data: 'pago no procesado'
            })
        }



         } catch(error){
            return response.status(400).json({
              status: 'wrong',
              data: error
            })
            }
         }
    async consultsuscription({auth, response}){
        let user = await User.query()
        .where('id', auth.current.user.id)
        .with('customer')
        .firstOrFail()

        let subscriptions = await user.toJSON()

        let reports = await Report.query()
        .where('is_readed', false)
        .count('* as total')

        const total = reports[0].total 

        try{
        if(subscriptions.customer !== null){
            const custominfo = await stripe.subscriptions.retrieve(subscriptions.customer.customer_id) 
            if(custominfo.status == 'active'){
                return response.json({
                    status: 'active',
                    data: true, total
                })
            } else {
                return response.json({
                    status: 'inactive',
                    data: false, total
                })
            }
        } else {
            return response.json({
                status: 'inactive',
                data: false, total
            })
        }
    } catch(error){
        return response.status(400).json({
            status: 'wrong',
            data: error
        })
    }
    }

    async cancelsubscription({auth, request, response}){
        const data = request.only(['password'])

        const userdata = await User.query()
        .where('id', auth.current.user.id)
        .with('customer')
        .firstOrFail()

        const user = await userdata.toJSON()

        if(data.password == user.name && user.customer !== null){
                const susinfo = await stripe.subscriptions.retrieve(user.customer.customer_id)
            if(susinfo.status == 'active'){
                const del = await stripe.subscriptions.del(user.customer.customer_id)
                const erasecustomer = await Customer.findBy('user_id', user.id)
                await erasecustomer.delete()

                return response.json({
                    status: 'success',
                    data: 'Subscripción eliminada'
                })
            } else {
                return response.status(400).json({
                    status: 'wrong',
                    data: 'tu subscripcion no está activa'
                })
            }
        } else {
            return response.status(400).json({
                status: 'wrong',
                data: 'Tu contraseña no es correcta'
            })
        }
    }

    async logout({auth, request, response}){
        const data = request.only(['expotoken'])
        try{
            if(data.expotoken !== null){
                const expot = await Expotoken.findBy('expo_token', data.expotoken)
                await expot.delete()
            }
            return response.json({
                status:'sure',
                data:'list'
            })
        } catch(error){
            return response.status(400).json({
                status: 'wrong',
                message: 'No te puedes desconectar'
            })
        }
    }
}

module.exports = UserController
