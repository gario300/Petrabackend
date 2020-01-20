'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')


Route.post('/signup', 'UserController.signup');
Route.post('/login', 'UserController.login');
Route.post('/makeop', 'ServerfunctionController.makeop')

Route.group(() => {
    Route.post('/getallalerts', 'ServerfunctionController.getalertssend')
    Route.get('/onproccess/:id', 'ServerfunctionController.onproccess')
    Route.get('/getone/:id', 'ServerfunctionController.getonereport')
    Route.put('/respond', 'ServerfunctionController.responder')
}).prefix('superuser').middleware('auth:jwt')

Route.group(() => {
    Route.get('/me/:token', 'UserController.me')
    Route.get('/mypremium', 'UserController.consultsuscription')
    Route.post('/cancelsubscription', 'UserController.cancelsubscription')
    Route.post('/notifications', 'ExpotokenController.postoken')
    Route.post('/logout', 'UserController.logout')
    
})
    .prefix('account')
    .middleware(['auth:jwt'])

Route.group(() => {
    Route.post('/newalert', 'AlertController.newalert')
    Route.post('/myreports/:page','ReportController.myreports')
    Route.post('/find', 'ReportController.finderreport')
    Route.post('/reportalert', 'AlertController.reportalert')
    Route.get('/onereport/:id', 'ReportController.onereport')
    })
    .prefix('emergence')
    .middleware(['auth:jwt'])

Route.group(() => {
    Route.post('/premium', 'UserController.premium')
    Route.post('/supervition', 'AlertController.needsupervition')
    })
    .prefix('buy')
    .middleware(['auth:jwt'])
