'use strict'

class ReservaController {

    async respondreport({auth,request,response}){
        const data = request.only(['id', 'supervisor_name',
                                    'report', 'image'])
        const user = await User.query()
            .where('id' , auth.current.user.id)
            .with('rank')
            .firstOrFail()
        
        try{
            
            const operador = await user.toJSON()

            if(operador.rank !== null && operador.rank == 'Operador' && data.image !== null){

                const image = data['image']
                const resultado = await Cloudinary.v2.uploader.upload(image);
                const final = resultado.secure_url

                const report = await Report.findBy('id', data.id)
                report.status = 'Finalizado'
                report.supervisor_name = data.supervisor_name
                report.operador_name = auth.current.user.name
                report.coments = data.coments
                report.image = final
                report.is_readed = false
                await report.save()
            }

        }catch(error){

        }
            
    }
}

module.exports = ReservaController
