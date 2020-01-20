'use strict'
const Report = use('App/Models/Report')
const { validate } = use('Validator')

class ReportController {
    async myreports({auth, response, params, request}){
        const data = request.only(['status'])
        const user = auth.current.user
        try{
        const report = await Report.query()
            .where('user_id', user.id)
            .where('status', data.status)
            .with('user')
            .with('alert')
            .orderBy('created_at', 'DESC')
            .paginate(params.page, 5)
            
          const updatereports = await Report.query()
          .where('user_id', user.id)
          .where('is_readed', false)
          .update({ is_readed: true })

            return response.json({
                status: 'success',
                data: report
      
              })
            } catch(error){
              console.log(error)
              return response.status(400).json({
                status: 'wrong',
                data:'error'
              })
            }
    }

    async finderreport({request, response}){
      const data = request.only(['report_id'])
      const rules = {
        report_id : 'required|string|max:255|min:1|alpha_numeric'
      }
      const messages = {
        required: 'Tienes que poner al menos un numero para iniciar la busqueda',
        string: 'Este caracter tiene que ser un texto',
        min: 'Tienes que poner al menos un numero para iniciar la busqueda',
        alpha_numeric: 'Este campo solo acepta letras o numeros'
      }
      const validation = await validate(data, rules, messages)

      if (validation.fails()){
          const message = validation.messages()
          let error = message[0]
          return response.status(400).json({
              status: 'wrong',
              message: error.message
          })
      } else{

      try{
        const report = await Report.query()
        .where('id', data.report_id)
        .with('user')
        .with('alert')
        .firstOrFail()

        return response.json({
          status: 'succes',
          data: report
        })

      }catch(error){
        return response.status(400).json({
          status: 'wrong',
          data: 'Reporte no existente o Finalizado'
        })
      }
    }
  }
    async onereport({params, response}){

      try{
        const report = await Report.query()
        .where('id', params.id)
        .with('alert')
        .with('user')
        .firstOrFail()

        return response.json({
          status: 'succes',
          data: report
        })

      }catch(error){
        return response.status(400).json({
          status: 'wrong',
          data: 'Reporte no existente o Finalizado'
        })
      }

    }
}

module.exports = ReportController
